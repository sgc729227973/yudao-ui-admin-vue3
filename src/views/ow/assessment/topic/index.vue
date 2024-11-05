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
      <!-- 评估名称 -->
      <el-form-item label="评估名称" prop="title">
        <el-input
          v-model="queryParams.title"
          class="!w-240px"
          clearable
          placeholder="请输入评估名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <!-- 评估状态 -->
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          class="!w-240px"
          clearable
          placeholder="请选择评估状态"
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
        v-hasPermi="['ow:assessment:topic:query']"
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
        v-hasPermi="['ow:assessment:topic:create']"
        >
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
        <el-button 
        :loading="exportLoading" 
        plain 
        type="success" 
        @click="handleExport"
        v-hasPermi="['ow:assessment:topic:export']"
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
      <el-table-column align="center" label="评估编号" prop="id" />
      <el-table-column align="center" label="评估编码" prop="code" />
      <el-table-column align="center" label="评估名称" prop="title" show-overflow-tooltip />
      <el-table-column align="center" label="总评估次数" prop="count" show-overflow-tooltip />
      <el-table-column align="center" label="状态" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>

      <!-- irujia 新增标签列 -->
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

        <!-- 显示每行评估的标签 -->
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
          v-hasPermi="['ow:assessment:topic:update']"
          >
            修改
          </el-button>
          <router-link :to="'/ow/assessment/questions/' + scope.row.id">
            <el-button 
              link 
              type="primary"
              v-hasPermi="['ow:assessment:questions:list']"
              >
              问题
            </el-button>
          </router-link>
          <router-link :to="'/ow/assessment/result/' + scope.row.id">
            <el-button 
              link 
              type="primary"
              v-hasPermi="['ow:assessment:result:list']"
              >
              结果
            </el-button>
          </router-link>
          <el-button 
          link 
          type="danger"
           @click="handleDelete(scope.row.id)"
           v-hasPermi="['ow:assessment:topic:delete']"
           >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页保持不变 -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>



  <!-- 表单弹窗：添加/修改 -->
  <TopicForm ref="formRef" @success="getList" />
</template>


<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as AssessmentApi from '@/api/ow/assessment/topic/index'
import TopicForm from './TopicForm.vue'
import download from '@/utils/download'

defineOptions({ name: 'AssessmentList' })

interface AssessmentItem {
  id: number
  title: string
  tags: { name: string }[]
}

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表加载状态
const total = ref(0) // 列表总记录数
const list = ref<AssessmentItem[]>([]) // 原始表格数据
const filteredData = ref<AssessmentItem[]>([]) // 过滤后的表格数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  title: '',
  status: undefined,
  createTime: [] // 创建时间范围
})
const queryFormRef = ref() // 搜索表单引用
const exportLoading = ref(false) // 导出按钮加载状态

// 标签相关
const allTags = ref<string[]>([]) // 所有标签，用于下拉选择
const selectedTags = ref<string[]>([]) // 已选择的标签，用于过滤

/** 获取列表数据 */
const getList = async () => {
  loading.value = true
  try {
    const data = await AssessmentApi.getAssessmentList(queryParams)
    list.value = data.list
    total.value = data.total

    // 提取所有标签
    const tagSet = new Set<string>()
    list.value.forEach(item => {
      item.tags.forEach(tag => {
        tagSet.add(tag.name)
      })
    })
    allTags.value = Array.from(tagSet) // 转换为数组

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
    await AssessmentApi.deleteAssessment(id)
    message.success(t('common.delSuccess'))
    getList()
  } catch (error) {}
}

/** 导出操作 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await AssessmentApi.exportAssessment(queryParams)
    download.excel(data, '评估数据.xls')
  } catch (error) {} finally {
    exportLoading.value = false
  }
}

/** 标签过滤逻辑 */
const handleTagFilter = (tag) => {
  // 如果标签已选中则移除，否则添加
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }

  // 调用过滤函数进行筛选
  filterByTags()
}

/** 根据已选择的标签对列表进行过滤 */
const filterByTags = () => {
  if (selectedTags.value.length === 0) {
    // 如果没有选择任何标签，则显示所有数据
    filteredData.value = list.value
  } else {
    // 根据选择的标签进行过滤
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

@/api/ow/assessment/topic/index