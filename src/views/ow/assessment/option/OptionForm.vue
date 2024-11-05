<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <!-- 选项内容 -->
      <el-form-item label="选项内容" prop="optionText">
        <el-input v-model="formData.optionText" placeholder="请输入选项内容" />
      </el-form-item>

      <!-- 选项顺序 -->
      <el-form-item label="选项顺序" prop="optionOrder">
        <el-input-number v-model="formData.optionOrder" placeholder="请输入选项顺序" />
      </el-form-item>

      <!-- 选项值 -->
      <el-form-item label="选项值" prop="value">
        <el-input-number v-model="formData.value" placeholder="请输入选项值" />
      </el-form-item>
    </el-form>

    <!-- 表单操作按钮 -->
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, defineExpose, defineEmits } from 'vue'
import { getOptionDetail, createOption, updateOption, OfficialWebAssessmentOptionVO } from '@/api/ow/assessment/option/index'

const dialogVisible = ref(false) // 弹窗是否显示
const dialogTitle = ref('') // 弹窗标题
const formLoading = ref(false) // 表单加载中状态
const formType = ref('') // 表单类型：create 或 update
const formData = ref<OfficialWebAssessmentOptionVO>({
  id: undefined,
  question: 0, // 默认初始化为0
  optionText: '',
  optionOrder: 1,
  value: 0
})

// 表单验证规则
const formRules = reactive({
  optionText: [{ required: true, message: '请输入选项内容', trigger: 'blur' }],
  optionOrder: [{ required: true, message: '请输入选项顺序', trigger: 'blur' }],
  value: [{ required: true, message: '请输入选项值', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const message = useMessage() // 消息弹窗

/** 打开弹窗 */
const open = async (type: string, id?: number, questionId?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增选项' : '编辑选项'
  formType.value = type
  resetForm()

  if (questionId) {
    formData.value.question = questionId // 将 questionId 传递给表单数据
  }

  // 如果是更新，获取选项详情
  if (id) {
    formLoading.value = true
    try {
      const option = await getOptionDetail(id)
      formData.value = option
      console.log('选项详情:', formData.value) // 打印选项详情
    } catch (error) {
      console.error('获取选项详情失败:', error)
    } finally {
      formLoading.value = false
    }
  }
}

defineExpose({ open }) // 暴露open方法

/** 提交表单 */
const emit = defineEmits(['success']) // 事件用于回调
const submitForm = async () => {
  // 校验表单
  const valid = await formRef.value?.validate()
  if (!valid) return

  formLoading.value = true

  try {
    if (formType.value === 'create') {
      await createOption(formData.value) // 新增选项
      message.success('新增成功')
    } else if (formData.value.id) {
      await updateOption(formData.value.id, formData.value) // 更新选项
      message.success('更新成功')
    }
    dialogVisible.value = false
    emit('success') // 操作成功的回调
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    question: 0, // 初始化 question
    optionText: '',
    optionOrder: 1,
    value: 0
  }
  formRef.value?.resetFields()
}
</script>
