<template>
  <!-- 搜索栏 -->
  <ContentWrap>
    <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="-mb-15px" label-width="68px">
      <!-- 岗位名称 -->
      <el-form-item label="岗位名称" prop="title">
        <el-input v-model="queryParams.title" class="!w-240px" clearable placeholder="请输入岗位名称" @keyup.enter="handleQuery" />
      </el-form-item>

      <!-- 岗位状态 -->
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" class="!w-240px" clearable placeholder="请选择岗位状态">
          <el-option v-for="status in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="status.value" :label="status.label" :value="status.value" />
        </el-select>
      </el-form-item>

      <!-- 岗位列表 -->
      <el-form-item label="岗位列表" prop="postId">
        <el-select
          v-model="queryParams.postId"
          class="!w-240px"
          clearable
          placeholder="请选择岗位"
        >
          <el-option
            v-for="post in postList"
            :key="post.id"
            :label="post.name"
            :value="post.id"
          />
        </el-select>
      </el-form-item>

      <!-- 创建时间范围选择 -->
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker v-model="queryParams.createTime" :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]" class="!w-240px" type="daterange" value-format="YYYY-MM-DD HH:mm:ss" start-placeholder="开始日期" end-placeholder="结束日期" />
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item>
        <el-button @click="handleQuery"
        v-hasPermi="['ow:job:post:query']"
        >
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
        <el-button plain type="primary" @click="openForm('create')" v-hasPermi="['ow:job:post:create']">
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
        <el-button :loading="exportLoading" plain type="success" @click="handleExport" v-hasPermi="['ow:job:post:export']">
          <Icon class="mr-5px" icon="ep:download" />
          导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="filteredData" stripe>
      <el-table-column align="center" label="岗位编号" prop="id" />
      <el-table-column align="center" label="岗位名称" prop="title" show-overflow-tooltip />
      <el-table-column align="center" label="工作地点" prop="location" show-overflow-tooltip />
      <el-table-column align="center" label="经验要求" prop="experienceLevel" />
      <el-table-column align="center" label="状态" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>

      <el-table-column :formatter="dateFormatter" align="center" label="创建时间" prop="createTime" width="180" />
      <el-table-column align="center" label="操作">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('update', scope.row.id)" 
          v-hasPermi="['ow:job:post:update']"
          >
            修改
          </el-button>
          <router-link :to="'/ow/job/application/' + scope.row.id">
            <el-button link type="primary" v-hasPermi="['ow:job:application:list']">申请记录</el-button>
          </router-link>
          <el-button link type="danger" @click="handleDelete(scope.row.id)" v-hasPermi="['ow:job:post:delete']">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNo" :total="total" @pagination="getList" />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <JobPostForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as JobPostApi from '@/api/ow/job/post/index'
import JobPostForm from './PostForm.vue'
import download from '@/utils/download'
import { PostVO, getSimplePostList } from '@/api/system/post'

defineOptions({ name: 'JobPostList' })

interface PostItem {
  id: number;
  name: string;
}

const postList = ref<PostItem[]>([]) // 用于存储顶级菜单的列表


interface JobPostItem {
  id: number
  title: string
  location: string
  experienceLevel: string
  status: number
  postId: number
  createTime: Date
}

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表加载状态
const total = ref(0) // 列表总记录数
const list = ref<JobPostItem[]>([]) // 原始表格数据
const filteredData = ref<JobPostItem[]>([]) // 过滤后的表格数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  title: '',
  status: undefined,
  postId: undefined,
  createTime: [] // 创建时间范围
})
const queryFormRef = ref() // 搜索表单引用
const exportLoading = ref(false) // 导出按钮加载状态

/** 获取列表数据 */
const getList = async () => {
  loading.value = true
  try {
    const data = await JobPostApi.getJobPostList(queryParams)
    list.value = data.list
    total.value = data.total

    // 初始化过滤后的数据
    filteredData.value = list.value
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
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除操作 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await JobPostApi.deleteJobPost(id)
    message.success(t('common.delSuccess'))
    getList()
  } catch (error) {}
}

/** 导出操作 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await JobPostApi.exportJobPost(queryParams)
    download.excel(data, '岗位数据.xls')
  } catch (error) {
    message.error(t('common.exportError'))
  } finally {
    exportLoading.value = false
  }
}

// 获取岗位列表
const getPostList = async () => {
  try {
    const data = await getSimplePostList();
    postList.value = data
      .filter((post): post is PostVO & { id: number } => post.id !== undefined) // 确保 id 存在 
      .map((post) => ({
        id: post.id!,
        name: post.name,
      }));
  } catch (error) {}
}
/** 初始化时获取数据 */
onMounted(() => {
  getPostList();  
  getList()
})
</script>
