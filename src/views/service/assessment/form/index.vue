<template>
  <doc-alert title="评估表单" url="" />

  <ContentWrap>
    <!-- 搜索栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <!-- 表单名 -->
      <el-form-item label="表单名" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入表单名"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="表单编码" prop="code">
        <el-input
          v-model="queryParams.code"
          class="!w-240px"
          clearable
          placeholder="请输入表单编码"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <!-- 评估选择器 -->
      <el-form-item label="评估类型" prop="category">
        <el-select v-model="queryParams.category" placeholder="请选择评估类型" clearable class="!w-240px">
          <el-option
            v-for="item in categoryList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <!-- 状态 -->
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          class="!w-240px"
          clearable
          placeholder="请选择状态"
        >
          <el-option
            v-for="status in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item>
        <el-button
          @click="handleQuery"
          v-hasPermi="['service:assessment:query']"
        >
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
        <el-button
          plain
          type="primary"
          @click="() => openForm()"
          v-hasPermi="['service:assessment:create']"
        >
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column align="center" label="编号" prop="id" />
      <el-table-column align="center" label="表单名" prop="name" />
      <el-table-column align="center" label="表单编码" prop="code" />
      <el-table-column align="center" label="评估次数" prop="count" />
      <el-table-column label="评估类型" align="center">
        <template #default="{ row }">
          <el-tag type="success">{{ getCategoryName(row.category) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="版本号" prop="version">
        <template #default="scope">
          <el-tag type="success">V{{ scope.row.version }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="备注" prop="remark" />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="发布时间"
        prop="createTime"
        width="180"
      />
      <el-table-column align="center" label="操作">
        <template #default="scope">
          <el-button
            v-hasPermi="['bpm:form:update']"
            link
            type="primary"
            @click="openForm(scope.row.id)"
          >
            编辑
          </el-button>
          <el-button v-hasPermi="['service:assessment:query']" 
          link @click="openDetail(scope.row.id)"
          >
            详情
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['service:assessment:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单详情的弹窗 -->
  <Dialog v-model="detailVisible" title="表单详情" width="800">
    <form-create :option="detailData.option" :rule="detailData.rule" />
  </Dialog>
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as AssessmentFormApi from '@/api/service/assessment/form'
import * as AssessmentCategoryApi from '@/api/service/assessment/category'
import { setConfAndFields2 } from '@/utils/formCreate'

defineOptions({ name: 'ServiceAssessmentForm' })
const categoryList = ref<AssessmentCategoryApi.AssessmentSimpleVO[]>([]);

/** 获取评估名称 */
const getCategoryName = (categoryId: number) => {
  const category = categoryList.value.find((item) => item.id === categoryId)
  return category ? category.name : '未分类'
}

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const { currentRoute, push } = useRouter() // 路由

const loading = ref(true) // 列表加载状态
const total = ref(0) // 列表总记录数
const list = ref([]) // 原始表格数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
  code: '',
  status: undefined,
  category: undefined,
})
const queryFormRef = ref() // 搜索表单引用

/** 获取列表数据 */
const getList = async () => {
  loading.value = true
  try {
    const data = await AssessmentFormApi.getAssessmentFormList(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置搜索表单 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const openForm = (id?: number) => {
  const toRouter: { name: string; query?: { id: number } } = {
    name: 'AssessmentFormEditor'
  }
  if (typeof id === 'number') {
    toRouter.query = {
      id
    }
  }
  push(toRouter)
}

/** 删除操作 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await AssessmentFormApi.deleteAssessmentForm(id)
    message.success(t('common.delSuccess'))
    getList()
  } catch {}
}

/** 详情操作 */
const detailVisible = ref(false)
const detailData = ref({
  rule: [],
  option: {}
})
const openDetail = async (rowId: number) => {
  // 设置表单
  const data = await AssessmentFormApi.getAssessmentFormDetail(rowId)
  setConfAndFields2(detailData, data.conf, data.fields)
  // 弹窗打开
  detailVisible.value = true
}

/** 初始化时获取数据 */
onMounted(async () => {
  const categoryData = await AssessmentCategoryApi.getAssessmentCategorySimpleList()
  if (categoryData) {
    categoryList.value = categoryData // 处理从 API 获取的数据
  }

  await getList()
})

/**表单保存返回后重新加载列表 */
watch(
  () => currentRoute.value,
  () => {
    // getList()
  },
  {
    immediate: true
  }
)
</script>

<style scoped>
.tag-dropdown {
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
}
/* 网格布局：每行显示 3 个 */
.tag-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
</style>