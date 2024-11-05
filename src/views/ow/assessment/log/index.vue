<template>
  <ContentWrap>
    <!-- 搜索栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="用户编号" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户编号"
          clearable
          class="!w-240px"
        />
      </el-form-item>
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
      <el-form-item label="操作时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"
        v-hasPermi="['ow:assessment:log:query']"	
        ><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['ow:assessment:log:export']"	
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 日志列表 -->
  <ContentWrap>
    <!-- 日志列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column label="日志编号" align="center" prop="id" />
      <el-table-column label="用户编号" align="center" prop="userId" />
      <el-table-column label="评估标题" align="center" prop="assessmentTitle" />
      <el-table-column label="评估编号" align="center" prop="assessment" />
      <el-table-column label="得分" align="center" prop="score"  />
      <el-table-column label="持续时间" align="center" prop="duration"  />
      <el-table-column label="操作" align="center" fixed="right" >
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openDetail(scope.row)"
          >
            详情
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

  <!-- 详情弹窗 -->
  <AssessmentLogDetail ref="detailRef" />
</template>

<script lang="ts" setup>
import download from '@/utils/download'
import * as AssessmentApi from '@/api/ow/assessment/topic/index'
import { getAssessmentLogList, exportAssessmentLog, OfficialWebAssessmentLogVO } from '@/api/ow/assessment/log'
import AssessmentLogDetail from './LogDetail.vue'

const message = useMessage()
const assessmentList = ref<AssessmentApi.OfficialWebAssessmentSimpleVO[]>([]);

const loading = ref(true)
const total = ref(0)
const list = ref<OfficialWebAssessmentLogVO[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  assessmentId: undefined,
  createTime: [],
})
const queryFormRef = ref()
const exportLoading = ref(false)

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await getAssessmentLogList(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  // 重置搜索表单
  queryFormRef.value.resetFields()

  // 清空查询参数
  queryParams.userId = undefined
  queryParams.assessmentId = undefined
  queryParams.createTime = []

  // 重置页码
  queryParams.pageNo = 1

  // 重新触发查询
  getList()
}

/** 详情操作 */
const detailRef = ref()
const openDetail = (data: OfficialWebAssessmentLogVO) => {
  detailRef.value.open(data)
}

/** 导出操作 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await exportAssessmentLog(queryParams)
    download.excel(data, '评估日志.xls')
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 */
onMounted(async () => {
  const assessmentData = await AssessmentApi.getSimpleAssessmentList()
  if (assessmentData) {
    assessmentList.value = assessmentData // 处理从 API 获取的数据
  }
  await getList()
})
</script>
