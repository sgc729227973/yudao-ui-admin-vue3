<template>
  <!-- 搜索工作栏 -->
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="公众号" prop="accountId">
        <el-select v-model="queryParams.accountId" placeholder="请选择公众号名称" clearable class="!w-240px">
          <el-option
            v-for="item in accountList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="食用建议" prop="consumptionAdvice">
        <el-select v-model="queryParams.consumptionAdvice" placeholder="请选择食用建议" clearable class="!w-240px">
          <el-option label="建议谨慎食用" :value="1" />
          <el-option label="适量食用为宜" :value="2" />
          <el-option label="一般可安全食用" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button 
        @click="handleQuery"
        v-hasPermi="['mp:function:additive-ingredient:query']"
        ><Icon icon="ep:search" class="mr-5px" />搜索</el-button>
        <el-button 
        @click="resetQuery"
        >
        <Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
        <el-button 
        type="primary" 
        @click="openForm('create')" 
        v-hasPermi="['mp:function:additive-ingredient:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button 
        v-hasPermi="['mp:function:additive-ingredient:import']" 
        plain type="warning"
         @click="handleImport"
         >
          <Icon icon="ep:upload" />
          导入
        </el-button>
        <el-button 
          type="primary" 
          @click="handleCalculateScores" 
          v-hasPermi="['mp:function:additive-ingredient:calculate-scores']"
        >
          <Icon icon="ep:refresh" class="mr-5px" /> 计算评分
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="介绍" align="center" prop="introduce" />
      <el-table-column label="类别" align="center" prop="categories">
        <template #default="scope">
          <div class="category-tags">
            <el-tag
              v-for="category in scope.row.categories"
              :key="category"
              :color="categoryOptions.find(opt => opt.value === category)?.color"
              effect="dark"
              class="category-tag custom-tag"
            >
              {{ categoryOptions.find(opt => opt.value === category)?.label }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="评分" align="center" prop="score" />
      <el-table-column label="食用建议" align="center" prop="consumptionAdvice">
        <template #default="scope">
          <span>{{ consumptionAdviceOptions[scope.row.consumptionAdvice] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数据来源" align="center" prop="dataSource" />
      <el-table-column label="安全摄入范围(ADI)" align="center" prop="ADI" />
      <el-table-column label="长期摄入风险" align="center" prop="longTermIngestionRisk" />
      <el-table-column label="健康益处" align="center" prop="healthBenefits" />
      <el-table-column label="致癌性风险" align="center" prop="carcinogenicRisk" />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="创建时间"
        prop="createTime"
        width="180"
      />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['mp:function:additive-ingredient:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['mp:function:additive-ingredient:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 对话框(添加 / 修改) -->
  <AdditiveForm ref="formRef" @success="getList" />
  <AdditiveImportForm ref="importFormRef" @success="getList" />
</template>

<style scoped>
.custom-tag {
  border: none; /* 取消边框 */
  padding: 8px 16px; /* 调整块大小 */
  font-size: 14px; /* 调整字体大小 */
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px; /* 标签之间的间距 */
}

</style>
<script lang="ts" setup>
import * as FunctionAdditiveApi from '@/api/mp/function/additive/index'
import * as AccountApi from '@/api/mp/account/index'
import AdditiveForm from './AdditiveForm.vue'
import { dateFormatter } from '@/utils/formatTime'
import AdditiveImportForm from './AdditiveImportForm.vue'

defineOptions({ name: 'MpFunctionAdditive' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

// 枚举类别的描述
const categoryOptions = [
  { value: 1, label: '酸度调节剂', color: '#409EFF' }, // 蓝色
  { value: 2, label: '抗结剂', color: '#67C23A' }, // 绿色
  { value: 3, label: '消泡剂', color: '#E6A23C' }, // 橙色
  { value: 4, label: '抗氧化剂', color: '#F56C6C' }, // 红色
  { value: 5, label: '漂白剂', color: '#909399' }, // 灰色
  { value: 6, label: '膨松剂', color: '#F39C12' }, // 黄色
  { value: 7, label: '胶基糖果中基础剂物质', color: '#8E44AD' }, // 紫色
  { value: 8, label: '着色剂', color: '#3498DB' }, // 浅蓝
  { value: 9, label: '护色剂', color: '#27AE60' }, // 深绿
  { value: 10, label: '乳化剂', color: '#D35400' }, // 橙红
  { value: 11, label: '酶制剂', color: '#C0392B' }, // 深红
  { value: 12, label: '增味剂', color: '#1ABC9C' }, // 青色
  { value: 13, label: '面粉处理剂', color: '#BDC3C7' }, // 银灰
  { value: 14, label: '被膜剂', color: '#7F8C8D' }, // 深灰
  { value: 15, label: '水分保持剂', color: '#2ECC71' }, // 亮绿
  { value: 16, label: '营养强化剂', color: '#16A085' }, // 绿色
  { value: 17, label: '防腐剂', color: '#E74C3C' }, // 红色
  { value: 18, label: '稳定剂和凝固剂', color: '#34495E' }, // 深蓝
  { value: 19, label: '甜味剂', color: '#FFC0CB' }, // 粉色
  { value: 20, label: '增稠剂', color: '#9B59B6' }, // 紫色
  { value: 21, label: '食品用香料', color: '#2980B9' }, // 蓝色
  { value: 22, label: '食品工业用加工助剂', color: '#D5DBDB' }, // 浅灰
  { value: 23, label: '其他类', color: '#A6ACAF' } // 灰色
];

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: null,
  consumptionAdvice: undefined, // 增加过滤项
  accountId: undefined, // 增加过滤项
})
const queryFormRef = ref() // 搜索的表单

// 枚举食用建议的描述
const consumptionAdviceOptions = {
  1: '建议谨慎食用',
  2: '适量食用为宜',
  3: '一般可安全食用'
}

const accountList = ref<AccountApi.AccountVO[]>([]);

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await FunctionAdditiveApi.getFunctionAdditivePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 导入按钮操作 */
const importFormRef = ref<InstanceType<typeof AdditiveImportForm>>()
const handleImport = () => {
  importFormRef.value?.open()
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await FunctionAdditiveApi.deleteFunctionAdditive(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 计算评分按钮操作 */
const handleCalculateScores = async () => {
  try {
    loading.value = true
    const response = await FunctionAdditiveApi.calculateScores()
    message.success(`成功计算 ${response.success_count} 个成分的评分，失败 ${response.fail_count} 个。`)
    // 重新获取列表，更新评分显示
    await getList()
  } catch (error) {
    message.error('计算评分失败，请稍后重试。')
  } finally {
    loading.value = false
  }
}
/** 初始化 **/
onMounted(async () => {
  const accountData = await AccountApi.getSimpleAccountList()
  if (accountData) {
    accountList.value = accountData // 处理从 API 获取的数据
  }
  getList()
})
</script>
