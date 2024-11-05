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
      <el-form-item label="页面名称" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入页面名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <!-- 页面编码 -->
      <el-form-item label="页面编码" prop="code">
        <el-input
          v-model="queryParams.code"
          class="!w-240px"
          clearable
          placeholder="请输入页面编码"
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
        v-hasPermi="['ow:content:dynamic-page:query']"	
        >
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
        <el-button plain type="primary" @click="openForm('create')"
        v-hasPermi="['ow:content:dynamic-page:create']"	
        >
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
        <!-- 新增说明按钮 -->
        <el-button plain type="info" @click="showInfoDialog = true">
          <Icon class="mr-5px" icon="ep:info-filled" />
          说明
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="filteredData" stripe>
      <el-table-column align="center" label="页面编号" prop="id" />
      <el-table-column align="center" label="页面名称" prop="name" show-overflow-tooltip />
      <el-table-column align="center" label="页面编码" prop="code" />
      <el-table-column :formatter="dateFormatter" align="center" label="创建时间" prop="createTime" width="180" />

      <el-table-column align="center" label="操作">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('update', scope.row.id)"
          v-hasPermi="['ow:content:dynamic-page:update']"	
          >
            修改
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)"
          v-hasPermi="['ow:content:dynamic-page:delete']"	
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNo" :total="total" @pagination="getList" />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <DynamicPageForm ref="formRef" @success="getList" />

  <!-- 说明对话框 -->
  <el-dialog v-model="showInfoDialog" title="说明" width="30%">
    <span>
      该页面用于管理官网动态页面，您可以根据页面名称、页面编码以及创建时间来进行查询筛选。
      点击“新增”可以创建新的动态页面，点击表格中的“修改”按钮可以编辑现有页面，点击“删除”按钮可以删除页面。
    </span>
    <template #footer>
      <el-button @click="showInfoDialog = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as DynamicPageApi from '@/api/ow/content/dynamic-page/index'
import DynamicPageForm from './DynamicPageForm.vue'
import { ref, reactive, onMounted } from 'vue'
const message = useMessage()

interface DynamicPageItem {
  id: number
  name: string
  code: string
  createTime: Date
}

const loading = ref(true)
const total = ref(0)
const list = ref<DynamicPageItem[]>([])
const filteredData = ref<DynamicPageItem[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
  code: '',
  createTime: []
})

const showInfoDialog = ref(false)

const getList = async () => {
  loading.value = true
  try {
    const data = await DynamicPageApi.getDynamicPageList(queryParams)
    list.value = data.list
    total.value = data.total
    filteredData.value = list.value
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryParams.name = ''
  queryParams.code = ''
  queryParams.createTime = []
  handleQuery()
}

const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await DynamicPageApi.deleteDynamicPage(id)
    getList()
  } catch (error) {}
}

onMounted(() => {
  getList()
})
</script>
