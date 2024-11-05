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
      <!-- 文本名称 -->
      <el-form-item label="文本名称" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入文本名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>      
      <!-- 所属HTML -->
      <el-form-item label="模版名称" prop="belongToHtml">
        <el-input
          v-model="queryParams.belongToHtml"
          class="!w-240px"
          clearable
          placeholder="请输入模版名称"
          @keyup.enter="handleQuery"
        />
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
        <el-button @click="handleQuery"
        v-hasPermi="['ow:content:text:query']"	
        >
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
        <el-button plain type="primary" @click="openForm('create')"
        v-hasPermi="['ow:content:text:create']"	
        >
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
        <el-button :loading="exportLoading" plain type="success" @click="handleExport"
        v-hasPermi="['ow:content:text:export']"	
        >
          <Icon class="mr-5px" icon="ep:download" />
          导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 文本资源列表表格 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column align="center" label="编号" prop="id" />
      <el-table-column align="center" label="文本名称" prop="name" show-overflow-tooltip />
      <el-table-column align="center" label="模版名称" prop="belongToHtml" show-overflow-tooltip />
      <el-table-column
        label="内容"
        align="center"
        prop="content"
        :show-overflow-tooltip="true"
        width="180"
      />
      <el-table-column align="center" label="创建时间" prop="createTime" :formatter="dateFormatter" />

      <el-table-column align="center" label="操作">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('update', scope.row.id)"
          v-hasPermi="['ow:content:text:update']"	
          >修改</el-button>
          <el-button 
          link 
          type="danger" 
          @click="handleDelete(scope.row.id)"
          v-hasPermi="['ow:content:text:delete']"	
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
  <TextForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as TextResourceApi from '@/api/ow/content/text'
import TextForm from './TextForm.vue'
import { ref, reactive, onMounted } from 'vue'

const message = useMessage()
const loading = ref(false)
const total = ref(0)
const list = ref([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
  belongToHtml: '',
  createTime: []
})
const exportLoading = ref(false)

const getList = async () => {
  loading.value = true
  try {
    const data = await TextResourceApi.getTextResourceList(queryParams)
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
  queryParams.name = ''
  queryParams.createTime = []
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
    await TextResourceApi.deleteTextResource(id)
    message.success('删除成功')
    getList()
  } catch (error) {}
}

/** 导出操作 */
const handleExport = async () => {
  exportLoading.value = true
  await TextResourceApi.exportTextResource(queryParams)
  exportLoading.value = false
}

onMounted(() => {
  getList()
})
</script>
