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
      <!-- 社区名称 -->
      <el-form-item label="知识标题" prop="title">
        <el-input
          v-model="queryParams.title"
          class="!w-240px"
          clearable
          placeholder="请输入知识标题"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <!-- 知识类型 -->
      <el-form-item label="知识类型" prop="type">
        <el-select
          v-model="queryParams.type"
          class="!w-240px"
          clearable
          placeholder="请选择知识类型 "
        >
          <el-option
            v-for="type in getIntDictOptions(DICT_TYPE.OW_SERVICES_NAME)"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </el-form-item>

      <!-- 载体类型 -->
      <el-form-item label="载体类型" prop="carrierType">
        <el-select
          v-model="queryParams.carrierType"
          class="!w-240px"
          clearable
          placeholder="请选择载体类型"
        >
          <el-option
            v-for="carrier in getStrDictOptions(DICT_TYPE.MP_MESSAGE_TYPE)"
            :key="carrier.value"
            :label="carrier.label"
            :value="carrier.value"
          />
        </el-select>
      </el-form-item>     
       
      <!-- 社区状态 -->
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
        <el-button @click="handleQuery"
        v-hasPermi="['ow:community:query']"
        >
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
        <el-button 
        plain 
        type="primary" 
        @click="openForm('create')"
        v-hasPermi="['ow:community:create']"	
        >
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
        <el-button 
        :loading="exportLoading" 
        plain 
        type="success" 
        @click="handleExport"
        v-hasPermi="['ow:community:export']"	
        >
          <Icon class="mr-5px" icon="ep:download" />
          导出
        </el-button>
          <!-- 重置标签过滤按钮 -->
        <el-button type="danger" @click="resetTagFilters">
          重置标签过滤
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="filteredData" stripe>
      <el-table-column align="center" label="ID编号" prop="id" />
      <el-table-column align="center" label="知识标题" prop="title" show-overflow-tooltip />
      <el-table-column align="center" label="作者" prop="author" />
      <el-table-column align="center" label="状态" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="类型" prop="type">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.OW_SERVICES_NAME" :value="scope.row.type" />
        </template>
      </el-table-column>

      <!-- 标签列 -->
      <el-table-column align="center" label="标签">
        <template #header>
          <el-dropdown @command="handleTagFilter" trigger="click">
            <el-button type="primary" size="default">
              选择标签<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="tag in allTags"
                  :key="tag"
                  :command="tag"
                  :class="{ 'selected-tag': selectedTags.includes(tag) }" 
                >
                  {{ tag }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template #default="scope">
          <el-tag
            v-for="tag in scope.row.tags"
            :key="tag.id"
            type="info"
            size="small"
            class="mr-2"
          >
            {{ tag.name }}
          </el-tag>
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
          v-hasPermi="['ow:community:update']"
          >
            修改
          </el-button>
          <el-button 
          link 
          type="danger"
           @click="handleDelete(scope.row.id)"
           v-hasPermi="['ow:community:delete']"	
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
  <CommunityForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions,getStrDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as CommunityApi from '@/api/ow/community'
import CommunityForm from './CommunityForm.vue'
import download from '@/utils/download'

interface CommunityItem {
  id: number
  title: string
  author: string
  tags: { name: string }[]
}

const message = useMessage()
const loading = ref(true)
const total = ref(0)
const list = ref<CommunityItem[]>([])
const filteredData = ref<CommunityItem[]>([]) // 过滤后的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  title: '',
  status: undefined,
  carrierType: '',
  createTime: [],
  type:undefined
})
const queryFormRef = ref()
const exportLoading = ref(false)

// 标签相关
const allTags = ref<string[]>([]) // 所有标签
const selectedTags = ref<string[]>([]) // 已选标签

/** 获取列表数据 */
const getList = async () => {
  loading.value = true
  try {
    const data = await CommunityApi.getCommunityList(queryParams)
    list.value = data.list
    total.value = data.total

    // 提取所有标签
    const tagSet = new Set<string>()
    list.value.forEach(item => {
      item.tags.forEach(tag => {
        tagSet.add(tag.name)
      })
    })
    allTags.value = Array.from(tagSet)

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
    await CommunityApi.deleteCommunity(id)
    message.success('删除成功')
    getList()
  } catch (error) {}
}

/** 导出操作 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await CommunityApi.exportCommunity(queryParams)
    download.excel(data, '社区数据.xls')
  } catch (error) {
    message.error('导出失败')
  } finally {
    exportLoading.value = false
  }
}

/** 标签过滤逻辑 */
const handleTagFilter = (tag) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
  filterByTags()
}

/** 根据已选择的标签对列表进行过滤 */
const filterByTags = () => {
  if (selectedTags.value.length === 0) {
    filteredData.value = list.value
  } else {
    filteredData.value = list.value.filter(item =>
      selectedTags.value.every(selectedTag =>
        item.tags.some(tag => tag.name === selectedTag)
      )
    )
  }
}

/** 重置标签过滤 */
const resetTagFilters = () => {
  selectedTags.value = []
  filterByTags()
}

/** 初始化时获取数据 */
onMounted(() => {
  getList()
})
</script>
