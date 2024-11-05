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
      <el-form-item label="评估名称" prop="assessment">
        <el-select v-model="queryParams.assessmentId" placeholder="请选择评估" clearable class="!w-240px">
          <el-option
            v-for="item in assessmentList"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <!-- 搜索、重置、新增按钮 -->
      <el-form-item>
        <el-button @click="handleQuery"
        v-hasPermi="['ow:assessment:questions:query']"
        ><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['ow:assessment:questions:create']"	
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表展示 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="问题ID" align="center" prop="id" />
      <el-table-column label="问题内容" align="center" prop="questionText" />
      <el-table-column label="问题顺序" align="center" prop="order" />
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" />

      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button 
          link 
          type="primary" 
          @click="openForm('update', scope.row.id)"
          v-hasPermi="['ow:assessment:questions:update']"
          >
          修改
        </el-button>
         <router-link 
         :to="'/ow/assessment/options/' + scope.row.id">
            <el-button 
              link 
              type="primary"
              v-hasPermi="['ow:assessment:options:list']"	
              >
              数据
            </el-button>
          </router-link>
          <el-button 
          link 
          type="danger" 
          @click="handleDelete(scope.row.id)"
          v-hasPermi="['ow:assessment:questions:delete']"	
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
  <QuestionForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as QuestionApi from '@/api/ow/assessment/question/index'
import * as AssessmentApi from '@/api/ow/assessment/topic/index'
import QuestionForm from './QuestionForm.vue'

const message = useMessage() // 消息弹窗
const loading = ref(false) // 列表加载中
const total = ref(0) // 总条数
const list = ref([]) // 列表数据
const route = useRoute()

// 修改为数组类型
const assessmentList = ref<AssessmentApi.OfficialWebAssessmentSimpleVO[]>([]);
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  assessmentId: Number(route.params.assessmentId), // 确保评估ID是数字类型
})

const queryFormRef = ref() // 搜索表单的引用

/** 查询问题列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await QuestionApi.getQuestionList(queryParams)
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
  formRef.value.open(type, id,queryParams.assessmentId)
}

/** 删除操作 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await QuestionApi.deleteQuestion(id)
    message.success('删除成功')
    getList()
  } catch {
    message.error('删除失败')
  }
}

/** 初始化加载数据 */
onMounted(async () => {


  const assessmentData = await AssessmentApi.getSimpleAssessmentList()
  if (assessmentData) {
    assessmentList.value = assessmentData // 处理从 API 获取的数据
  }
  await getList() // 加载问题列表
})
</script>
