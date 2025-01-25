<template>
  <doc-alert title="评估表单" url="" />

  <!-- 第一步：选择分类和表单 -->
  <ContentWrap v-if="!selectedForm" v-loading="loading">
    <el-tabs v-if="categoryList.length > 0" tab-position="left" v-model="activeCategoryCode">
      <el-tab-pane
        :label="category.name"
        :name="category.code"
        :key="category.code"
        v-for="category in categoryList"
      >
        <el-row :gutter="20">
          <el-col
            :lg="6"
            :sm="12"
            :xs="24"
            v-for="form in getFormsByCategory(category.code)"
            :key="form.id"
          >
            <el-card
              shadow="hover"
              class="mb-20px cursor-pointer"
              @click="handleSelectForm(form)"
            >
              <template #default>
                <div class="flex">
                  <el-text class="!ml-10px" size="large">{{ form.name }}</el-text>
                </div>
              </template>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
    <el-empty v-else description="暂无数据" />
  </ContentWrap>

  <!-- 第二步：填写表单 -->
  <ContentWrap v-else>
    <el-card class="box-card">
      <div class="clearfix">
        <span class="el-icon-document">评估表单【{{ selectedForm.name }}】</span>
        <el-button style="float: right" type="primary" @click="selectedForm = undefined">
          <Icon icon="ep:delete" /> 选择其它表单
        </el-button>
      </div>

      <!-- 硬编码的表单区域 -->
      <el-form
        ref="fixedFormRef"
        :model="fixedFormData"
        label-width="100px"
        class="fixed-form"
        style="width: 91.6667%; margin-left: 0; margin-top: 20px"
      >
        <el-row :gutter="20">
          <!-- 姓名 -->
          <el-col :span="12">
            <el-form-item label="姓名" prop="user_info.name">
              <el-input v-model="fixedFormData.user_info.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>

          <!-- 电话 -->
          <el-col :span="12">
            <el-form-item label="电话" prop="user_info.phone">
              <el-input v-model="fixedFormData.user_info.phone" placeholder="请输入电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- 出生日期 -->
          <el-col :span="12">
            <el-form-item label="出生日期" prop="user_info.birthDate">
              <el-date-picker
                v-model="fixedFormData.user_info.birthDate"
                type="date"
                placeholder="请选择出生日期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>

          <!-- 评估日期 -->
          <el-col :span="12">
            <el-form-item label="评估日期" prop="user_info.assessmentDate">
              <el-date-picker
                v-model="fixedFormData.user_info.assessmentDate"
                type="date"
                placeholder="请选择评估日期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- 地址 -->
          <el-col :span="12">
            <el-form-item label="地址" prop="user_info.address">
              <el-input v-model="fixedFormData.user_info.address" placeholder="请输入地址" />
            </el-form-item>
          </el-col>

          <!-- 职业 -->
          <el-col :span="12">
            <el-form-item label="职业" prop="user_info.occupation">
              <el-select
                v-model="fixedFormData.user_info.occupation"
                placeholder="请选择职业"
                clearable
                class="w-1/1"
              >
                <el-option
                  v-for="occupation in occupationOptions"
                  :key="occupation"
                  :label="occupation"
                  :value="occupation"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- 身高 -->
          <el-col :span="12">
            <el-form-item label="身高 (cm)" prop="user_info.height">
              <el-input-number
                v-model="fixedFormData.user_info.height"
                :min="0"
                :max="300"
                placeholder="请输入身高"
              />
            </el-form-item>
          </el-col>

          <!-- 体重 -->
          <el-col :span="12">
            <el-form-item label="体重 (kg)" prop="user_info.weight">
              <el-input-number
                v-model="fixedFormData.user_info.weight"
                :min="0"
                :max="500"
                placeholder="请输入体重"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- 性别 -->
          <el-col :span="12">
            <el-form-item label="性别" prop="user_info.sex">
              <el-select v-model="fixedFormData.user_info.sex" placeholder="请选择" class="w-1/1">
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 年龄 -->
          <el-col :span="12">
            <el-form-item label="年龄" prop="user_info.age">
              <el-input-number
                v-model="fixedFormData.user_info.age"
                :min="0"
                :max="150"
                placeholder="请输入年龄"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- 负责人 -->
          <el-col :span="12">
            <el-form-item label="负责人" prop="ownerUserId">
              <el-select
                v-model="fixedFormData.ownerUserId"
                placeholder="请选择负责人"
                clearable
                class="w-1/1"
              >
                <el-option
                  v-for="item in userOptions"
                  :key="item.id"
                  :label="item.nickname"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 客户名称 -->
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customerId">
              <el-select
                v-model="fixedFormData.customerId"
                placeholder="请选择客户"
                clearable
                class="w-1/1"
              >
                <el-option
                  v-for="item in customerList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 动态表单区域 -->
      <el-col :span="22" :offset="0" style="margin-top: 20px">
        <form-create
          :rule="detailForm.rule"
          v-model:api="fApi"
          v-model="detailForm.value"
          :option="detailForm.option"
          @submit="submitForm"
        />
      </el-col>
    </el-card>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { setConfAndFields2 } from '@/utils/formCreate'
import type { ApiAttrs } from '@form-create/element-ui/types/config'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as UserApi from '@/api/system/user'
import * as CustomerApi from '@/api/crm/customer'
import * as AssessmentCategoryApi from '@/api/service/assessment/category'
import * as AssessmentFormApi from '@/api/service/assessment/form'

defineOptions({ name: 'AssessmentFormCreate' })

const message = useMessage() // 消息弹窗
const { push } = useRouter() // 路由

// ========== 分类和表单相关 ==========
const loading = ref(true) // 加载状态
const categoryList = ref<AssessmentCategoryApi.AssessmentCategoryVO[]>([]) // 分类列表
const activeCategoryCode = ref('') // 当前选中的分类编码
const formList = ref<AssessmentFormApi.AssessmentFormVO[]>([]) // 表单列表
const selectedForm = ref<AssessmentFormApi.AssessmentFormVO>() // 当前选中的表单

// ========== 硬编码表单相关 ==========
const userOptions = ref<UserApi.UserVO[]>([]) // 用户列表
const customerList = ref<CustomerApi.CustomerVO[]>([]) // 客户列表
const fixedFormRef = ref() // 硬编码表单的引用
const fixedFormData = ref({
  user_info: {
    name: '', // 姓名
    phone: '', // 电话
    birthDate: '', // 出生日期
    assessmentDate: '', // 评估日期
    address: '', // 地址
    occupation: '', // 职业
    height: undefined, // 身高
    weight: undefined, // 体重
    sex: undefined, // 性别
    age: undefined // 年龄
  },
  ownerUserId: undefined, // 负责人
  customerId: undefined // 客户
})

// ========== 职业选项 ==========
const occupationOptions = ref([
  '软件工程师',
  '医生',
  '教师',
  '律师',
  '会计师',
  '建筑师',
  '设计师',
  '销售经理',
  '市场营销',
  '人力资源',
  '项目经理',
  '产品经理',
  '数据分析师',
  '研究员',
  '作家',
  '编辑',
  '记者',
  '摄影师',
  '艺术家',
  '厨师',
  '服务员',
  '司机',
  '保安',
  '清洁工',
  '农民',
  '工人',
  '自由职业者',
  '其他'
])

// ========== 表单相关 ==========
const fApi = ref<ApiAttrs>() // 表单 API
const detailForm = ref({
  rule: [], // 表单规则
  option: {}, // 表单配置
  value: {} // 表单数据
})

// 获取分类和表单列表
const getCategoryAndFormList = async () => {
  loading.value = true
  try {
    // 获取分类列表
    const categoryData = await AssessmentCategoryApi.getAssessmentCategorySimpleList()
    if (categoryData) {
      categoryList.value = categoryData
      if (categoryList.value.length > 0) {
        activeCategoryCode.value = categoryList.value[0].code
      }
    }

    // 获取表单列表
    const formData = await AssessmentFormApi.getAssessmentFormList({})
    if (formData) {
      formList.value = formData.list
    }
  } catch (error) {
    message.error('加载分类和表单列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 根据分类编码获取表单列表
const getFormsByCategory = (categoryCode: string) => {
  if (categoryCode === 'uncategorized') {
    return formList.value.filter((form) => form.category === null || form.category === 0)
  }

  const category = categoryList.value.find((item) => item.code === categoryCode)
  if (!category) {
    return []
  }

  return formList.value.filter((form) => form.category === category.id)
}

// 选择表单
const handleSelectForm = (form: AssessmentFormApi.AssessmentFormVO) => {
  selectedForm.value = form
  initForm(form)
}

// 初始化表单
const initForm = async (form: AssessmentFormApi.AssessmentFormVO) => {
  if (!form.id) {
    message.error('表单 ID 无效，无法初始化')
    return
  }

  try {
    // 获取表单详情
    const formDetail = await AssessmentFormApi.getAssessmentFormDetail(form.id)
    console.log('表单详情:', formDetail) // 调试信息

    if (formDetail) {
      // 解析 conf
      const conf = formDetail.conf
      console.log('解析后的 conf:', conf) // 调试信息

      // 解析 fields
      const fields = formDetail.fields
      console.log('解析后的 fields:', fields) // 调试信息

      // 设置表单配置和字段
      setConfAndFields2(detailForm.value, conf, fields)
    }
  } catch (error) {
    console.error('初始化表单失败:', error) // 调试信息
    message.error('初始化表单失败，请稍后重试')
  }
}

// 提交表单
const submitForm = async (formData: any) => {
  if (!fApi.value || !selectedForm.value || !selectedForm.value.id) {
    message.error('表单 ID 无效，无法提交')
    return
  }

  // 创建提交数据对象
  const submitData = {
    formId: selectedForm.value.id, // 表单 ID
    ownerUserId: fixedFormData.value.ownerUserId, // 负责人
    customerId: fixedFormData.value.customerId, // 客户
    data: {
      user_info: fixedFormData.value.user_info, // 用户信息
      form_data: formData // 动态表单数据
    }
  }

  // 提交请求
  fApi.value.btn.loading(true)
  try {
    await AssessmentFormApi.submitAssessmentForm(submitData)
    message.success('提交成功')
    // 跳转到评估表单列表页
    await push({
      name: 'AssessmentFormList'
    })
  } finally {
    fApi.value.btn.loading(false)
  }
}

// 初始化
onMounted(async () => {
  getCategoryAndFormList()
  // 获得用户列表
  userOptions.value = await UserApi.getSimpleUserList()
  // 获得客户列表
  customerList.value = await CustomerApi.getCustomerSimpleList()
})
</script>

<style scoped>
.box-card {
  margin: 20px;
}

.fixed-form {
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fafafa;
}

.el-form-item {
  margin-bottom: 18px;
}
</style>