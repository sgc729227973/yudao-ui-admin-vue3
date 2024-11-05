<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <!-- 最小值和最大值在同一行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="最小值" prop="minValue">
            <el-input-number v-model="formData.minValue" placeholder="请输入最小值" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最大值" prop="maxValue">
            <el-input-number v-model="formData.maxValue" placeholder="请输入最大值" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 风险等级 -->
      <el-form-item label="风险等级" prop="level">
        <el-input-number v-model="formData.level" placeholder="请输入风险等级" />
      </el-form-item>

      <!-- 结果描述 -->
      <el-form-item label="结果描述" prop="resultDescription">
        <el-input type="textarea" v-model="formData.resultDescription" placeholder="请输入结果描述" :autosize="{ minRows: 2, maxRows: 5 }" />
      </el-form-item>

      <!-- 媒体代码和跳转链接在同一行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="媒体代码" prop="mediaCode">
            <el-input v-model="formData.mediaCode" placeholder="请输入媒体代码" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="跳转链接" prop="redirectUrl">
            <el-input v-model="formData.redirectUrl" placeholder="请输入跳转链接" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 建议 -->
      <el-form-item label="建议" prop="suggestion">
        <el-input type="textarea" v-model="formData.suggestion" placeholder="请输入建议" :autosize="{ minRows: 3, maxRows: 5 }" resize="both" />
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
import { getAssessmentResultDetail, createAssessmentResult, updateAssessmentResult, OfficialWebAssessmentResultRangeVO } from '@/api/ow/assessment/result/index'

const dialogVisible = ref(false) // 弹窗是否显示
const dialogTitle = ref('') // 弹窗标题
const formLoading = ref(false) // 表单加载中状态
const formType = ref('') // 表单类型：create 或 update
const formData = ref<OfficialWebAssessmentResultRangeVO>({
  id: undefined,
  assessment: 0, // 初始化评估ID
  minValue: 0,
  maxValue: 0,
  mediaCode: '',
  level: 0,
  resultDescription: '',
  redirectUrl: '',
  suggestion: ''
})

// 表单验证规则
const formRules = reactive({
  minValue: [{ required: true, message: '请输入最小值', trigger: 'blur' }],
  maxValue: [{ required: true, message: '请输入最大值', trigger: 'blur' }],
  level: [{ required: true, message: '请输入风险等级', trigger: 'blur' }],
  resultDescription: [{ required: true, message: '请输入结果描述', trigger: 'blur' }],
  suggestion: [{ required: true, message: '请输入建议', trigger: 'blur' }] // 添加建议为必填
})
const formRef = ref() // 表单 Ref
const message = useMessage() // 消息弹窗

/** 打开弹窗 */
const open = async (type: string, id?: number, assessmentId?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增结果' : '编辑结果'
  formType.value = type
  resetForm()

  if (assessmentId) {
    formData.value.assessment = assessmentId // 将评估ID传递给表单数据
  }

  // 如果是更新，获取评估结果详情
  if (id) {
    formLoading.value = true
    try {
      const result = await getAssessmentResultDetail(id)
      formData.value = result
      console.log('评估结果详情:', formData.value) // 打印评估结果详情
    } catch (error) {
      console.error('获取评估结果详情失败:', error)
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
      await createAssessmentResult(formData.value) // 新增评估结果
      message.success('新增成功')
    } else if (formData.value.id) {
      await updateAssessmentResult(formData.value.id, formData.value) // 更新评估结果
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
    assessment: 0, // 初始化评估ID
    minValue: 0,
    maxValue: 0,
    mediaCode: '',
    level: 0,
    resultDescription: '',
    redirectUrl: '',
    suggestion: ''
  }
  formRef.value?.resetFields()
}
</script>
