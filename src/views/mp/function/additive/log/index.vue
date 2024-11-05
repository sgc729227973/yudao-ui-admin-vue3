<template>
  <ContentWrap>
    <!-- 搜索栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="用户编号" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户编号"
          clearable
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="用户openid" prop="openid">
        <el-input
          v-model="queryParams.openid"
          placeholder="请输入用户openid"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <!-- 公众号选择器 -->
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
        <el-button 
        @click="handleQuery"
        v-hasPermi="['mp:function:additive:log:query']"    
        ><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button 
        @click="resetQuery"
        >
        <Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['mp:function:additive:log:export']"    
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 日志列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="日志编号" align="center" prop="id" />
      <el-table-column label="用户编号" align="center" prop="userId" />
      <el-table-column label="用户OpenID" align="center" prop="openid" />
      <el-table-column label="微信公众号ID" align="center" prop="accountId" />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="创建时间"
        prop="createTime"
        width="180"
      />
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
  <FunctionLogDetail ref="detailRef" />
</template>

<script lang="ts" setup>
import download from '@/utils/download'
import { getFunctionLogList, exportFunctionLog, MpFunctionLogVO } from '@/api/mp/function/additive/log/index'
import * as AccountApi from '@/api/mp/account/index'
import FunctionLogDetail from './LogDetail.vue'
import { dateFormatter } from '@/utils/formatTime'

const message = useMessage()


const loading = ref(true)
const total = ref(0)
const list = ref<MpFunctionLogVO[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  openid: null,
  accountId: undefined, // 新增公众号ID过滤
  createTime: [],
})
const queryFormRef = ref()
const exportLoading = ref(false)
const accountList = ref<AccountApi.AccountVO[]>([])

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await getFunctionLogList(queryParams)
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
  queryParams.openid = null
  queryParams.accountId = undefined
  queryParams.createTime = []

  // 重置页码
  queryParams.pageNo = 1

  // 重新触发查询
  getList()
}

/** 详情操作 */
const detailRef = ref()
const openDetail = (data: MpFunctionLogVO) => {
  detailRef.value.open(data)
}

/** 导出操作 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await exportFunctionLog(queryParams)
    download.excel(data, '功能日志.xls')
  } finally {
    exportLoading.value = false
  }
}

/** 加载公众号列表 */
const loadAccountList = async () => {
  try {
    const response = await AccountApi.getSimpleAccountList();
    if (response) {
      accountList.value = response;
    }
  } catch (error) {}
}

/** 初始化 */
onMounted(async () => {
  await loadAccountList()
  await getList()
})
</script>
