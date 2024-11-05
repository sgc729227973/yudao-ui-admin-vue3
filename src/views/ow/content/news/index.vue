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
      <!-- 新闻标题 -->
      <el-form-item label="新闻标题" prop="title">
        <el-input
          v-model="queryParams.title"
          class="!w-240px"
          clearable
          placeholder="请输入新闻标题"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <!-- 是否置顶 -->
      <el-form-item label="是否置顶" prop="isTop">
        <el-select
          v-model="queryParams.isTop"
          class="!w-240px"
          clearable
          placeholder="请选择置顶状态"
        >
          <el-option label="是" :value="true" />
          <el-option label="否" :value="false" />
        </el-select>
      </el-form-item>

      
      <!-- 状态 -->
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          class="!w-240px"
          clearable
          placeholder="请选择开启状态"
        >
          <el-option
            v-for="status in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
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
        @click="handleQuery"
        v-hasPermi="['ow:content:news:query']"	
        >
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
        <el-button plain type="primary" @click="openForm('create')"
        v-hasPermi="['ow:content:news:create']"	
        >
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
        <el-button 
        :loading="exportLoading" 
        plain 
        type="success" 
        @click="handleExport"
        v-hasPermi="['ow:content:news:export']"	
        >
          <Icon class="mr-5px" icon="ep:download" />
          导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 新闻列表表格 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column align="center" label="新闻编号" prop="id" />
      <el-table-column align="center" label="新闻标题" prop="title" show-overflow-tooltip />
      <el-table-column align="center" label="作者" prop="author" show-overflow-tooltip />
      <el-table-column align="center" label="状态" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否置顶" prop="isTop">
        <template #default="scope">
          <el-tag v-if="scope.row.isTop" type="success">置顶</el-tag>
          <el-tag v-else type="info">否</el-tag>
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
          <el-button link type="primary" @click="openForm('update', scope.row.id)"
          v-hasPermi="['ow:content:news:update']"	
          >修改</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)"
          v-hasPermi="['ow:content:news:delete']"	
          >删除</el-button>
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
  <NewsForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as NewsApi from '@/api/ow/content/news'  // 引入新闻API
import NewsForm from './NewForm.vue' // 引入表单组件
import { ref, reactive, onMounted } from 'vue'
import download from '@/utils/download'

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(false) // 加载状态
const total = ref(0) // 总记录数
const list = ref([]) // 新闻列表数据
const queryParams = reactive({
  pageNo: 1, // 当前页码
  pageSize: 10, // 每页大小
  title: '', // 查询条件：新闻标题
  isTop: undefined, // 查询条件：是否置顶
  status: undefined,
  createTime: [] // 查询条件：创建时间范围
})
const exportLoading = ref(false) // 导出按钮加载状态

/** 获取新闻列表 */
const getList = async () => {
  loading.value = true
  try {
    // 请求新闻列表数据
    const data = await NewsApi.getNewsList(queryParams)
    list.value = data.list // 更新列表数据
    total.value = data.total // 更新总记录数
  } finally {
    loading.value = false // 关闭加载状态
  }
}

/** 搜索操作 */
const handleQuery = () => {
  queryParams.pageNo = 1 // 重置页码
  getList() // 重新获取列表
}

/** 重置搜索表单 */
const resetQuery = () => {
  queryParams.title = '' // 清空新闻标题
  queryParams.isTop = undefined // 清空置顶状态
  queryParams.createTime = [] // 清空创建时间范围
  queryParams.status = undefined // 清空创建时间范围
  handleQuery() // 重新获取列表
}

/** 打开表单 */
const formRef = ref() // 表单引用
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id) // 打开表单，传入操作类型和新闻ID
}

/** 删除操作 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await NewsApi.deleteNews(id)
    message.success(t('common.delSuccess'))
    getList()
  } catch (error) {}
}

/** 导出操作 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await NewsApi.exportNews(queryParams)
    download.excel(data, '新闻数据.xls')
  } catch (error) {
    message.error('导出失败')
  } finally {
    exportLoading.value = false
  }
}

/** 组件挂载时获取数据 */
onMounted(() => {
  getList() // 初始化时获取新闻列表
})
</script>
