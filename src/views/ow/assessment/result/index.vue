<template>
  <ContentWrap>
    <!-- 搜索表单 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <!-- 评估选择器 -->
      <el-form-item label="评估名称" prop="assessmentId">
        <el-select v-model="queryParams.assessmentId" placeholder="请选择评估" clearable class="!w-240px">
          <el-option
            v-for="item in assessmentList"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <!-- 搜索按钮 -->
      <el-form-item>
        <el-button @click="handleQuery"
        v-hasPermi="['ow:assessment:result:query']"
        ><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['ow:assessment:result:create']"	
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表展示 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="最小值" align="center" prop="minValue" />
      <el-table-column label="最大值" align="center" prop="maxValue" />
      <el-table-column label="风险等级" align="center" prop="level" />
      <el-table-column label="结果描述" align="center" prop="resultDescription" show-overflow-tooltip />
      <el-table-column label="建议" align="center" prop="suggestion" show-overflow-tooltip />
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" />

      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button 
            link 
            type="primary" 
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['ow:assessment:result:update']"
            >
            修改
          </el-button>
          <el-button 
            link 
            type="danger" 
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['ow:assessment:result:delete']"	
            >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <ResultForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as ResultApi from '@/api/ow/assessment/result/index'
import * as AssessmentApi from '@/api/ow/assessment/topic/index'
import ResultForm from './ResultForm.vue'

const message = useMessage() // 消息弹窗
const loading = ref(false) // 列表加载中
const total = ref(0) // 总条数
const list = ref([]) // 列表数据
const assessmentList = ref<AssessmentApi.OfficialWebAssessmentSimpleVO[]>([])

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  assessmentId: '', // 获取评估ID
})

const queryFormRef = ref() // 搜索表单的引用

/** 查询评估结果列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ResultApi.getAssessmentResultList(queryParams)
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

/** 重置操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 打开添加/修改表单 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id, queryParams.assessmentId)
}

/** 删除操作 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await ResultApi.deleteAssessmentResult(id)
    message.success('删除成功')
    getList()
  } catch {
    message.error('删除失败')
  }
}

/** 初始化加载数据 */
onMounted(async () => {
  const assessmentsData = await AssessmentApi.getSimpleAssessmentList()
  if (assessmentsData) {
    assessmentList.value = assessmentsData // 处理从 API 获取的数据
  }
  await getList() // 加载评估结果列表
})
</script>
