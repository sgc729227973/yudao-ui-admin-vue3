<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <!-- 标签名称 -->
      <el-form-item label="标签名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入标签名称" />
      </el-form-item>

      <!-- 标签编码 -->
      <el-form-item label="标签编码" prop="tagCode">
        <el-input v-model="formData.tagCode" placeholder="请输入标签编码" />
      </el-form-item>

      <!-- 状态 -->
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio v-for="status in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="status.value" :value="status.value">
            {{ status.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <!-- 表单按钮 -->
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { createTag, updateTag, getTagDetail } from '@/api/ow/assessment/tag'
import { ref, reactive, defineEmits, defineExpose } from 'vue'

defineOptions({ name: 'OwAssessmentTag' })

const message = useMessage();
const { t } = useI18n() // 国际化

const dialogVisible = ref(false) // 弹窗的显示状态
const dialogTitle = ref('') // 弹窗标题
const formLoading = ref(false) // 表单加载状态
const formType = ref('') // 表单类型
const formData = ref({
  id: undefined,
  name: '',
  tagCode: '',
  status: 0
}) // 初始化表单数据

// 表单验证规则
const formRules = reactive({
  name: [{ required: true, message: '标签名称不能为空', trigger: 'blur' }],
  tagCode: [{ required: true, message: '标签编码不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
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
      const tag = await getTagDetail(id)
      formData.value = { ...tag }
    }finally {
      formLoading.value = false
    }
  }
}

defineExpose({ open }) // 提供 open 方法

const emit = defineEmits(['success']) // 定义 success 事件

/** 提交表单 */
const submitForm = async () => {
  if (!formRef.value) return 
  const valid = await formRef.value.validate() // 修复此处，直接使用 validate 方法
  if (!valid) return

  formLoading.value = true

  try {
    if (formType.value === 'create') {
      await createTag(formData.value)
      message.success(t('common.createSuccess'))
    } else if (formData.value.id) {
      await updateTag(formData.value.id, formData.value)
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
    tagCode: '',
    status: 0
  }
  formRef.value?.resetFields()
}
</script>
