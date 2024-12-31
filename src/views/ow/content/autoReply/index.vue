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
      <!-- 问题 -->
      <el-form-item label="问题" prop="question">
        <el-input
          v-model="queryParams.question"
          class="!w-240px"
          clearable
          placeholder="请输入问题"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <!-- 是否预加载 -->
      <el-form-item label="预加载" prop="preloaded">
        <el-select
          v-model="queryParams.preloaded"
          class="!w-240px"
          clearable
          placeholder="请选择是否预加载"
        >
          <el-option label="是" :value="true" />
          <el-option label="否" :value="false" />
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
        <el-button @click="handleQuery" v-hasPermi="['ow:content:auto_reply:query']">
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
          v-hasPermi="['ow:content:auto_reply:create']"
        >
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column align="center" label="ID" prop="id" />
      <el-table-column align="center" label="问题" prop="question" show-overflow-tooltip />
      <el-table-column align="center" label="回复内容" prop="reply" show-overflow-tooltip />
      <el-table-column align="center" label="关键词" prop="keywords">
        <template #default="scope">
          <div>{{ scope.row.keywords.join(', ') }}</div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否预加载" prop="preloaded">
        <template #default="scope">
          <el-tag
            :type="scope.row.preloaded ? 'success' : 'info'"
            effect="plain"
          >
            {{ scope.row.preloaded ? '是' : '否' }}
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
            v-hasPermi="['ow:content:auto_reply:update']"
          >
            修改
          </el-button>
          <el-button 
            link 
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['ow:content:auto_reply:delete']"
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
  <AutoReplyForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as AutoReplyApi from '@/api/ow/content/autoReply'
import AutoReplyForm from './AutoReplyForm.vue'

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表加载状态
const total = ref(0) // 列表总记录数
const list = ref<any[]>([]) // 自动回复数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  question: '',
  preloaded: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索表单引用

/** 获取列表数据 */
const getList = async () => {
  loading.value = true
  try {
    const data = await AutoReplyApi.getAutoReplyList(queryParams)
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
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 打开表单弹窗 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除操作 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await AutoReplyApi.deleteAutoReply(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch{}
}

/** 初始化时获取数据 */
onMounted(() => {
  getList()
})
</script>
