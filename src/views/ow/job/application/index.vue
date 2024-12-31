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
      <el-form-item label="岗位编号" prop="postId">
        <el-input
          v-model="queryParams.postId"
          placeholder="请输入岗位编号"
          clearable
          class="!w-240px"
        />
      </el-form-item>
      <!-- 申请人姓名 -->
      <el-form-item label="申请人" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入申请人名字"
          clearable
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="申请时间" prop="createTime">
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
          v-hasPermi="['ow:job:application:query']"
        >
          <Icon icon="ep:search" class="mr-5px" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px" /> 重置
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['ow:job:application:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 岗位申请列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="申请编号" align="center" prop="id" />
      <el-table-column label="岗位编号" align="center" prop="postId" />
      <el-table-column label="申请人姓名" align="center" prop="name" />
      <el-table-column label="电子邮件" align="center" prop="email" />
      <el-table-column label="电话" align="center" prop="phone" />
      <el-table-column label="申请时间" align="center" prop="createTime">
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openDetail(scope.row)">
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
  <JobApplicationDetail ref="detailRef" />
</template>

<script lang="ts" setup>
import download from '@/utils/download';
import {
  getJobApplicationList,
  exportJobApplication,
  JobApplicationVO,
} from '@/api/ow/job/application';
import JobApplicationDetail from './Detail.vue';

const message = useMessage(); // 消息弹窗
const loading = ref(true);
const total = ref(0);
const list = ref<JobApplicationVO[]>([]);
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  postId: undefined,
  name: undefined,
  createTime: [],
});
const queryFormRef = ref();
const exportLoading = ref(false);

/** 查询列表 */
const getList = async () => {
  loading.value = true;
  try {
    const data = await getJobApplicationList(queryParams);
    list.value = data.list;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields();
  queryParams.postId = undefined;
  queryParams.name = undefined;
  queryParams.createTime = [];
  queryParams.pageNo = 1;
  getList();
};

/** 详情操作 */
const detailRef = ref();
const openDetail = (data: JobApplicationVO) => {
  detailRef.value.open(data);
};

/** 导出操作 */
const handleExport = async () => {
  try {
    await message.exportConfirm();
    exportLoading.value = true;
    const data = await exportJobApplication(queryParams);
    download.excel(data, '岗位申请.xls');
  } finally {
    exportLoading.value = false;
  }
};

/** 初始化 */
onMounted(() => {
  getList();
});

/** 格式化时间 */
const formatDate = (timestamp?: number) => {
  if (!timestamp) return '无';
  const date = new Date(timestamp);
  return date.toLocaleString();
};
</script>
