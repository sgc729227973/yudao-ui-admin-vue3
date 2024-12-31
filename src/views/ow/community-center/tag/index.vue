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
      <!-- 标签名称 -->
      <el-form-item label="标签名称" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入标签名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <!-- 标签名称 -->
      <el-form-item label="标签编码" prop="code">
        <el-input
          v-model="queryParams.code"
          class="!w-240px"
          clearable
          placeholder="请输入标签编码"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <!-- 标签状态 -->
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          class="!w-240px"
          clearable
          placeholder="请选择状态"
        >
          <el-option
            v-for="status in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>
      </el-form-item>

      <!-- 标签类型 -->
      <el-form-item label="服务类型" prop="type">
        <el-select
          v-model="queryParams.type"
          class="!w-240px"
          clearable
          placeholder="请选择服务类型"
        >
          <el-option
            v-for="type in getIntDictOptions(DICT_TYPE.OW_SERVICES_NAME)"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </el-form-item>
      <!-- 标签类型 -->
      <el-form-item label="社区类型" prop="mediaType">
        <el-select
          v-model="queryParams.mediaType"
          class="!w-240px"
          clearable
          placeholder="请选择社区类型"
        >
          <el-option
            v-for="type in getIntDictOptions(DICT_TYPE.OW_COMMUNITY_TYPE)"
            :key="type.value"
            :label="type.label"
            :value="type.value"
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
        v-hasPermi="['ow:community-tag:query']"	
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
          v-hasPermi="['ow:community-tag:create']"	
        >
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column align="center" label="标签编号" prop="id" />
      <el-table-column align="center" label="标签编码" prop="tagCode" />
      <el-table-column align="center" label="标签名称" prop="name" show-overflow-tooltip />
      <el-table-column align="center" label="服务类型" prop="type">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.OW_SERVICES_NAME" :value="scope.row.type" />
        </template>
      </el-table-column>      
      <el-table-column align="center" label="社区类型" prop="mediaType">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.OW_COMMUNITY_TYPE" :value="scope.row.mediaType" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
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
            v-hasPermi="['ow:community-tag:update']"	
          >
            修改
          </el-button>
          <el-button 
            link 
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['ow:community-tag:delete']"	
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
  <TagForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as TagApi from '@/api/ow/community-center/community-tag'
import TagForm from './TagForm.vue'

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表加载状态
const total = ref(0) // 列表总记录数
const list = ref<any[]>([]) // 标签数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
  code: '',
  status: undefined,
  type:undefined,
  mediaType:undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索表单引用

/** 获取列表数据 */
const getList = async () => {
  loading.value = true
  try {
    const data = await TagApi.getTagList(queryParams)
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
    await TagApi.deleteTag(id)
    message.success(t('common.delSuccess'))
    getList()
  } catch (error) {
    console.error('删除标签失败:', error)
  }
}

/** 初始化时获取数据 */
onMounted(() => {
  getList()
})
</script>
@/api/ow/release-center/release-tag