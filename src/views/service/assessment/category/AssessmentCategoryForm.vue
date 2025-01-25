<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <!-- 分类名称 -->
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入分类名称" />
      </el-form-item>

      <!-- 分类编码 -->
      <el-form-item label="分类编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入分类编码" />
      </el-form-item>

      <!-- 状态 -->
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="status in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="status.value"
            :value="status.value"
          >
            {{ status.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 排序 -->
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" :max="999" />
      </el-form-item>

      <!-- 描述 -->
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          placeholder="请输入分类描述"
        />
      </el-form-item>
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
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import {
  createAssessmentCategory,
  updateAssessmentCategory,
  getAssessmentCategoryDetail,
} from '@/api/service/assessment/category'
import { ref, reactive, defineEmits, defineExpose } from 'vue'

defineOptions({ name: 'AssessmentCategoryForm' })

const message = useMessage()
const { t } = useI18n() // 国际化

const dialogVisible = ref(false) // 弹窗的显示状态
const dialogTitle = ref('') // 弹窗标题
const formLoading = ref(false) // 表单加载状态
const formType = ref('') // 表单类型
const formData = ref({
  id: undefined,
  name: '',
  code: '',
  status: 0,
  sort: 0,
  description: '',
}) // 初始化表单数据

// 表单验证规则
const formRules = reactive({
  name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '分类编码不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  sort: [{ required: true, message: '排序值不能为空', trigger: 'blur' }],
  description: [{ required: false }], // 描述字段非必填
})

const formRef = ref() // 表单引用

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()

  if (id) {
    formLoading.value = true
    try {
      const category = await getAssessmentCategoryDetail(id)
      formData.value = { ...category }
    } finally {
      formLoading.value = false
    }
  }
}

defineExpose({ open }) // 提供 open 方法

const emit = defineEmits(['success']) // 定义 success 事件

/** 提交表单 */
const submitForm = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate() // 表单验证
  if (!valid) return

  formLoading.value = true

  try {
    if (formType.value === 'create') {
      await createAssessmentCategory(formData.value)
      message.success(t('common.createSuccess'))
    } else if (formData.value.id) {
      await updateAssessmentCategory(formData.value.id, formData.value)
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
    name: '',
    code: '',
    status: 0,
    sort: 0,
    description: '',
  }
  formRef.value?.resetFields()
}
</script>