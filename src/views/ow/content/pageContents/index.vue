<template>
  <!-- 搜索栏 -->
  <ContentWrap>
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <!-- 页面名称 -->
      <el-form-item label="页面名称" prop="pageName">
        <el-input
          v-model="queryParams.pageName"
          class="!w-240px"
          clearable
          placeholder="请输入页面名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <!-- 编码 -->
      <el-form-item label="编码" prop="code">
        <el-input
          v-model="queryParams.code"
          class="!w-240px"
          clearable
          placeholder="请输入编码"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <!-- 是否加密 -->
      <el-form-item label="是否加密" prop="encrypted">
        <el-select
          v-model="queryParams.encrypted"
          class="!w-240px"
          clearable
          placeholder="请选择是否加密"
        >
          <el-option :value="true" label="是" />
          <el-option :value="false" label="否" />
        </el-select>
      </el-form-item>

      <!-- 创建时间范围选择 -->
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item>
        <el-button
          v-hasPermi="['ow:page:contents:query']"
          @click="handleQuery"
        >
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button
          v-hasPermi="['ow:page:contents:query']"
          @click="resetQuery"
        >
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
        <el-button
          v-hasPermi="['ow:page:contents:create']"
          plain
          type="primary"
          @click="openForm('create')"
        >
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="filteredData" stripe>
      <el-table-column align="center" label="ID编号" prop="id" />
      <el-table-column align="center" label="页面名称" prop="pageName" show-overflow-tooltip />
      <el-table-column align="center" label="编码" prop="code" />
      <el-table-column align="center" label="描述" prop="description" />
      <el-table-column align="center" label="是否加密" prop="encrypted">
        <template #default="scope">
          <span>{{ scope.row.encrypted ? '是' : '否' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="创建时间"
        prop="createTime"
        width="180"
      />
      <el-table-column align="center" label="操作">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['ow:page:contents:update']"
          >
            修改
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['ow:page:contents:delete']"
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

  <!-- 表单弹窗：添加/修改 -->
  <PageContentsForm ref="formRef" @success="getList" />
</template>


<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as PageContentsApi from '@/api/ow/content/pageContents'
import PageContentsForm from './PageContentsForm.vue'

interface PageContentsItem {
  id: number
  code?: string
  pageName: string
  description?: string
  contents?: Record<string, any>
  fileConfigId?: number
  encrypted?: boolean
  createTime: string
}

const message = useMessage()
const loading = ref(true)
const total = ref(0)
const list = ref<PageContentsItem[]>([])
const filteredData = ref<PageContentsItem[]>([]) // 过滤后的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  pageName: '',
  code: '',
  encrypted: undefined,
  createTime: []
})

const queryFormRef = ref()


/** 获取列表数据 */
const getList = async () => {
  loading.value = true
  try {
    const data = await PageContentsApi.getPageContentsList(queryParams)
    list.value = data.list
    total.value = data.total
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
    await PageContentsApi.deletePageContents(id)
    message.success('删除成功')
    getList()
  } catch (error) {}
}

/** 初始化时获取数据 */
onMounted(() => {
  getList()
})
</script>
