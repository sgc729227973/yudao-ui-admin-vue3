<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="60%">
    <!-- 表单区域 -->
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <!-- 用户信息 -->
      <el-row :gutter="20">
        <!-- 姓名、电话、职业 -->
        <el-col :span="8">
          <el-form-item label="姓名" prop="userInfo.name">
            <el-input v-model="formData.userInfo.name" placeholder="请输入姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="电话" prop="userInfo.phone">
            <el-input v-model="formData.userInfo.phone" placeholder="请输入电话" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="职业" prop="userInfo.occupation">
            <el-select
              v-model="formData.userInfo.occupation"
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

      <!-- 地址 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="地址" prop="userInfo.address">
            <el-input v-model="formData.userInfo.address" placeholder="请输入地址" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 出生日期、评估日期 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="出生日期" prop="userInfo.birthDate">
            <el-date-picker
              v-model="formData.userInfo.birthDate"
              type="date"
              placeholder="请选择出生日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="评估日期" prop="userInfo.assessmentDate">
            <el-date-picker
              v-model="formData.userInfo.assessmentDate"
              type="date"
              placeholder="请选择评估日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="性别" prop="userInfo.sex">
            <el-select
              v-model="formData.userInfo.sex"
              placeholder="请选择性别"
              clearable
              class="w-1/1"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 身高、体重、年龄 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="身高 (cm)" prop="userInfo.height">
            <el-input-number
              v-model="formData.userInfo.height"
              :min="0"
              :max="300"
              placeholder="请输入身高"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="体重 (kg)" prop="userInfo.weight">
            <el-input-number
              v-model="formData.userInfo.weight"
              :min="0"
              :max="500"
              placeholder="请输入体重"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="年龄" prop="userInfo.age">
            <el-input-number
              v-model="formData.userInfo.age"
              :min="0"
              :max="150"
              placeholder="请输入年龄"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 负责人、客户名称 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="负责人" prop="ownerUserId">
            <el-select
              v-model="formData.ownerUserId"
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
        <el-col :span="12">
          <el-form-item label="客户名称" prop="customerId">
            <el-select
              v-model="formData.customerId"
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

      <!-- 分组：AI 分析结果 -->
      <el-card class="box-card mb-20px">
        <template #header>
          <div class="clearfix">
            <span>AI 分析</span>
            <el-button type="primary" size="small" @click="copyDataToClipboard">
              一键复制用户数据
            </el-button>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="24">
            <!-- 普通输入框模式 -->
            <el-form-item label="AI 分析" prop="aiAnalysis">
              <el-input
                v-model="formData.aiAnalysis"
                type="textarea"
                :rows="5"
                placeholder="请输入 AI 分析"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 分组：动态表单 -->
      <el-card class="box-card">
        <template #header>
          <div class="clearfix">
            <span>动态表单</span>
            <!-- 显示表单名和版本号 -->
            <span v-if="formTemplate" class="form-info">
              <el-icon><document /></el-icon>
              <el-text type="primary" tag="strong" style="margin-right: 10px;">
                表单名：【 {{ formTemplate.name }} 】
              </el-text>
              <el-badge :value="`V${formTemplate.version}`" type="success">
                <el-icon><version /></el-icon>
              </el-badge>
            </span>
            <el-switch
              v-model="isDynamicFormEditable"
              class="float-right"
              active-text="允许修改"
              inactive-text="禁止修改"
            />
          </div>
        </template>
        <el-col :span="24">
          <form-create
            :rule="dynamicForm.rule"
            v-model:api="fApi"
            v-model="dynamicForm.value"
            :option="dynamicForm.option"
            :disabled="!isDynamicFormEditable"
          />
        </el-col>
      </el-card>
    </el-form>

    <!-- 表单按钮 -->
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { ref, reactive, defineEmits, defineExpose } from 'vue'
import { useMessage } from '@/hooks/web/useMessage'
import { useI18n } from '@/hooks/web/useI18n'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { setConfAndFields2 } from '@/utils/formCreate'
import type { ApiAttrs } from '@form-create/element-ui/types/config'
import {
  updateAssessmentFormData,
  getAssessmentFormDataDetail,
} from '@/api/service/assessment/form-data'
import * as AssessmentFormApi from '@/api/service/assessment/form'
import * as UserApi from '@/api/system/user'
import * as CustomerApi from '@/api/crm/customer'

defineOptions({ name: 'AssessmentFormDataForm' })

const message = useMessage()
const { t } = useI18n() // 国际化

const dialogVisible = ref(false) // 弹窗的显示状态
const dialogTitle = ref('') // 弹窗标题
const formLoading = ref(false) // 表单加载状态
const isDynamicFormEditable = ref(false) // 动态表单是否可编辑

// 表单模板数据
const formTemplate = ref<{
  id: number;
  name: string;
  version: number;
  conf: string;
  fields: string[];
} | null>(null);

const copyDataToClipboard = () => {
  if (!formTemplate.value) {
    message.error('表单模板未加载，无法复制数据');
    return;
  }

  // 解析 fields，生成 field 到 title 的映射（保持不变）
  const fieldTitleMap: Record<string, string> = {};
  formTemplate.value.fields.forEach((fieldStr) => {
    try {
      const field = JSON.parse(fieldStr);
      if (field.field && field.title) {
        fieldTitleMap[field.field] = field.title;
      }
    } catch (e) {
      console.error('解析字段失败:', e);
    }
  });

  // 将 formData 中的 field 替换为 title（保持不变）
  const formattedFormData: Record<string, any> = {};
  for (const [field, value] of Object.entries(dynamicForm.value.value)) {
    const title = fieldTitleMap[field] || field;
    formattedFormData[title] = value;
  }

  // 构造最终复制的数据（保持不变）
  const dataToCopy = {
    userInfo: formData.value.userInfo,
    formData: formattedFormData,
  };
  const textToCopy = JSON.stringify(dataToCopy, null, 2);

  // ========== 核心修改：添加备用复制方案 ==========
  // 尝试使用现代剪贴板 API
  if (navigator.clipboard) {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        message.success('用户数据已复制到剪贴板');
      })
      .catch(() => {
        // 现代 API 失败时使用备用方案
        fallbackCopyTextToClipboard(textToCopy);
      });
  } else {
    // 浏览器不支持现代 API 时直接使用备用方案
    fallbackCopyTextToClipboard(textToCopy);
  }
};
// ========== 新增：经典复制方案 ==========
const fallbackCopyTextToClipboard = (text: string) => {
  // 1. 创建临时 textarea
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed'; // 避免滚动
  textArea.style.opacity = '0';      // 透明元素
  
  // 2. 插入 DOM 并选中文本
  document.body.appendChild(textArea);
  textArea.select();

  try {
    // 3. 执行复制命令
    const successful = document.execCommand('copy');
    if (successful) {
      message.success('用户数据已复制到剪贴板');
    } else {
      message.error('复制失败，请手动复制');
    }
  } catch (err) {
    message.error('复制失败，请手动复制');
  }

  // 4. 清理 DOM
  document.body.removeChild(textArea);
};
const formData = ref({
  id: undefined,
  assessmentFormId: 0, // 关联的表单 ID
  userInfo: {
    name: '', // 姓名
    phone: '', // 电话
    birthDate: '', // 出生日期
    assessmentDate: '', // 评估日期
    address: '', // 地址
    occupation: '', // 职业
    height: undefined, // 身高
    weight: undefined, // 体重
    sex: undefined, // 性别
    age: undefined, // 年龄
  },
  formData: {} as Record<string, any>, // 动态表单数据
  ownerUserId: 0, // 负责人 ID
  customerId: 0, // 客户 ID
  aiAnalysis: '', // AI 分析结果（直接使用输入框）
  creator: '', // 创建者
  createTime: undefined as Date | undefined, // 创建时间
  updater: '', // 更新者
  updateTime: undefined as Date | undefined, // 更新时间
  deleted: false, // 是否删除
  tenantId: 0, // 租户编号
}) // 初始化表单数据

// 动态表单配置
const fApi = ref<ApiAttrs>() // 表单 API
const dynamicForm = ref({
  rule: [], // 表单规则
  option: {}, // 表单配置
  value: {}, // 表单数据
})

// 职业选项
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
  '其他',
])

// 用户列表
const userOptions = ref<UserApi.UserVO[]>([])
// 客户列表
const customerList = ref<CustomerApi.CustomerVO[]>([])

// 表单验证规则
const formRules = reactive({
  'userInfo.name': [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
  'userInfo.phone': [{ required: true, message: '电话不能为空', trigger: 'blur' }],
})

const formRef = ref() // 表单引用

/** 打开弹窗 */
const open = async (id: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.edit') // 弹窗标题固定为“编辑”
  resetForm()

  if (id) {
    formLoading.value = true
    try {
      // 获取表单数据详情
      const formDataDetail = await getAssessmentFormDataDetail(id)
      formData.value = {
        ...formDataDetail,
        aiAnalysisText: formDataDetail.aiAnalysisText || '', // 直接使用输入框的值
      }

      // 获取表单模板
      const formTemplateData = await AssessmentFormApi.getAssessmentFormDetail(
        formDataDetail.assessmentFormId
      )
      if (formTemplateData) {
        // 保存表单模板数据
        formTemplate.value = formTemplateData;
        // 设置动态表单
        setConfAndFields2(dynamicForm.value, formTemplateData.conf, formTemplateData.fields)
        // 将表单数据绑定到动态表单
        dynamicForm.value.value = formDataDetail.formData
      }
    } finally {
      formLoading.value = false
    }
  }
}

/** 提交表单 */
const submitForm = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate() // 表单验证
  if (!valid) return

  formLoading.value = true

  try {
    const payload = {
      ...formData.value,
      formData: dynamicForm.value.value, // 动态表单数据
    }

    if (formData.value.id) {
      await updateAssessmentFormData(formData.value.id, payload)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    assessmentFormId: 0,
    userInfo: {
      name: '',
      phone: '',
      birthDate: '',
      assessmentDate: '',
      address: '',
      occupation: '',
      height: undefined,
      weight: undefined,
      sex: undefined,
      age: undefined,
    },
    formData: {},
    ownerUserId: 0,
    customerId: 0,
    aiAnalysis: '', // 重置 AI 分析结果
    creator: '',
    createTime: undefined,
    updater: '',
    updateTime: undefined,
    deleted: false,
    tenantId: 0,
  }
  dynamicForm.value = {
    rule: [],
    option: {},
    value: {},
  }
  formRef.value?.resetFields()
}

/** 初始化时获取用户和客户列表 */
onMounted(async () => {
  userOptions.value = await UserApi.getSimpleUserList()
  customerList.value = await CustomerApi.getCustomerSimpleList()
})

defineExpose({ open }) // 提供 open 方法
const emit = defineEmits(['success']) // 定义 success 事件
</script>
<style scoped>
.el-form-item {
  margin-bottom: 18px;
}

.box-card {
  margin-bottom: 20px;
}

.clearfix {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.form-info {
  margin-left: 0px;
  font-size: 14px;
  display: flex;
  align-items: center;
}
</style>