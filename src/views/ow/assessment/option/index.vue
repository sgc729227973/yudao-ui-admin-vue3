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
          <!-- 评估问题选择器 -->
      <el-form-item label="问题名称" prop="questions">
        <el-select v-model="queryParams.questionId" placeholder="请选择评估问题" clearable class="!w-240px">
          <el-option
            v-for="item in questionList"
            :key="item.id"
            :label="item.questionText"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <!-- 搜索按钮 -->
      <el-form-item>
      <el-button @click="handleQuery"
      v-hasPermi="['ow:assessment:options:query']"
      ><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['ow:assessment:options:create']"	
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表展示 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="选项ID" align="center" prop="id" />
      <el-table-column label="选项内容" align="center" prop="optionText" />
      <el-table-column label="选项顺序" align="center" prop="optionOrder" />
      <el-table-column label="选项值" align="center" prop="value" />
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" />

      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button 
            link 
            type="primary" 
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['ow:assessment:options:update']"
            >
            修改
          </el-button>
          <el-button 
            link 
            type="danger" 
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['ow:assessment:options:delete']"	
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
  <OptionForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as OptionApi from '@/api/ow/assessment/option/index'
import * as QuestionsApi from '@/api/ow/assessment/question/index'
import OptionForm from './OptionForm.vue'

const message = useMessage() // 消息弹窗
const loading = ref(false) // 列表加载中
const total = ref(0) // 总条数
const list = ref([]) // 列表数据
const route = useRoute()

const questionList = ref<QuestionsApi.OfficialWebAssessmentQuestionSimpleVO[]>([]);


const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  questionId: Number(route.params.questionId), // 获取问题ID，确保为数字类型
})

const queryFormRef = ref() // 搜索表单的引用

/** 查询选项列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await OptionApi.getOptionList(queryParams)
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
  formRef.value.open(type, id, queryParams.questionId)
}

/** 删除操作 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await OptionApi.deleteOption(id)
    message.success('删除成功')
    getList()
  } catch {
    message.error('删除失败')
  }
}

/** 初始化加载数据 */
onMounted(async () => {
  const questionsData = await QuestionsApi.getSimpleAssessmentQuestionsList()
  if (questionsData) {
    questionList.value = questionsData // 处理从 API 获取的数据
  }

  await getList() // 加载选项列表
})
</script>
