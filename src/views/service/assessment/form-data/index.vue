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
    <el-form-item label="表单名称" prop="assessmentFormId">
      <el-select
        v-model="queryParams.assessmentFormId"
        placeholder="请选择表单"
        clearable
        class="!w-240px"
        @keyup.enter="handleQuery"
      >
        <el-option
          v-for="item in assessmentFormList"
          :key="item.id"
          :label="`${item.name} v${item.version}`"
          :value="item.id"
        />
      </el-select>
    </el-form-item>
      <el-form-item label="客户" prop="customerId">
        <el-select
          v-model="queryParams.customerId"
          class="!w-240px"
          clearable
          lable-key="name"
          placeholder="请选择客户"
          value-key="id"
          @keyup.enter="handleQuery"
        >
          <el-option
            v-for="item in customerList"
            :key="item.id"
            :label="item.name"
            :value="item.id!"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="负责人" prop="ownerUserId">
            <el-select
              v-model="queryParams.ownerUserId"
              class="!w-240px"
              clearable
              lable-key="nickname"
              placeholder="请选择负责人"
              value-key="id"
              @keyup.enter="handleQuery"
            >
              <el-option
                v-for="item in userOptions"
                :key="item.id"
                :label="item.nickname"
                :value="item.id"
              />
            </el-select>
          </el-form-item>

      <!-- 评估时间围选择 -->
      <el-form-item label="评估时间" prop="createTime">
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
        <el-button @click="handleQuery" v-hasPermi="['service:assessment:form-data:query']">
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column align="center" label="ID" prop="id" />
      <el-table-column label="客户名称" align="center">
        <template #default="{ row }">
          <el-link
            :underline="false"
            type="primary"
            @click="openCustomerDetail(row.customerId)"
          >
            {{ getCrmCustomerName(row.customerId) }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="表单名称" align="center">
        <template #default="{ row }">
          {{ getAssessmentFormName(row.assessmentFormId) }}
        </template>
      </el-table-column>
      <el-table-column label="负责人" align="center">
        <template #default="{ row }">
          {{ getownerUserName(row.ownerUserId) }}
        </template>
      </el-table-column>
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="评估时间"
        prop="createTime"
        width="180"
      />
      <el-table-column align="center" label="操作">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm(scope.row.id)"
            v-hasPermi="['service:assessment:form-data:update']"
          >
            详情
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['service:assessment:form-data:delete']"
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
  <AssessmentFormDataForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as AssessmentFormDataApi from '@/api/service/assessment/form-data'
import * as AssessmentApi from '@/api/service/assessment/form'
import * as CustomerApi from '@/api/crm/customer'
import AssessmentFormDataForm from './AssessmentFormDataForm.vue'
import * as UserApi from '@/api/system/user'

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const userOptions = ref<UserApi.UserVO[]>([]) // 用户列表
const loading = ref(false) // 列表加载状态
const total = ref(0) // 列表总记录数
const list = ref<any[]>([]) // 表单数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
  assessmentFormId: '',
  customerId: undefined,
  ownerUserId: undefined,
  createTime: [] // 创建时间范围
})

const assessmentFormList = ref<AssessmentApi.AssessmentSimpleFormVO[]>([])
const customerList = ref<CustomerApi.CustomerVO[]>([]) // 客户列表
const queryFormRef = ref() // 搜索表单引用

/** 获取评估名称 */
const getAssessmentFormName = (assessmentId: number) => {
  const assessment = assessmentFormList.value.find((item) => item.id === assessmentId);
  return assessment ? `${assessment.name} v${assessment.version}` : '未知';
};

/** 获取客户名称 */
const getCrmCustomerName = (customerId: number) => {
  if (!customerId) return '未知' // 如果 customerId 为空，直接返回“未知”
  const customer = customerList.value.find((item) => item.id === customerId)
  return customer ? customer.name : '未知'
}

/** 获取客户名称 */
const getownerUserName = (ownerUserId: number) => {
  if (!ownerUserId) return '未知'; 
  const ownerUser = userOptions.value.find((item) => item.id === ownerUserId);
  return ownerUser ? ownerUser.nickname : '未知';
};

/** 获取列表数据 */
const getList = async () => {
  loading.value = true
  try {
    // 处理创建时间范围
    const params = {
      ...queryParams,
      createTimeStart: queryParams.createTime?.[0], // 开始时间
      createTimeEnd: queryParams.createTime?.[1], // 结束时间
    }
    const data = await AssessmentFormDataApi.getAssessmentFormDataList(params)
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

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除操作 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await AssessmentFormDataApi.deleteAssessmentFormData(id)
    message.success(t('common.delSuccess'))
    getList()
  } catch {}
}

/** 打开客户详情 */
const { push } = useRouter()
const openCustomerDetail = (id: number) => {
  push({ name: 'CrmCustomerDetail', params: { id } })
}

/** 初始化时获取数据 */
onMounted(async () => {
  try {
    // 获取客户列表
    const customerData = await CustomerApi.getCustomerSimpleList()
    customerList.value = customerData || []

    // 获取评估表单列表
    const assessmentData = await AssessmentApi.getAssessmentFormSimpleList()
    assessmentFormList.value = assessmentData || []
    userOptions.value = await UserApi.getSimpleUserList()

    // 获取表单数据列表
    await getList()
  } catch (error) {
    console.error('初始化数据失败:', error)
  }
})
</script>