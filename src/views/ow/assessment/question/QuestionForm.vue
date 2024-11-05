<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <!-- 问题内容 -->
      <el-form-item label="问题内容" prop="questionText">
        <el-input v-model="formData.questionText" placeholder="请输入问题内容" />
      </el-form-item>

      <!-- 问题顺序 -->
      <el-form-item label="问题顺序" prop="order">
        <el-input-number v-model="formData.order" placeholder="请输入问题顺序" />
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
import { getQuestionDetail, createQuestion, updateQuestion, OfficialWebAssessmentQuestionVO } from '@/api/ow/assessment/question/index'

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 控制弹窗显示
const dialogTitle = ref('') // 弹窗标题
const formLoading = ref(false) // 表单加载中状态
const formType = ref('') // 表单类型：create 或 update
const formData = ref<OfficialWebAssessmentQuestionVO>({
  id: undefined,
  assessment: 0, // 默认初始化为0
  questionText: '',
  order: 1
})

// 表单验证规则
const formRules = reactive({
  questionText: [{ required: true, message: '问题内容不能为空', trigger: 'blur' }],
  order: [{ required: true, message: '问题顺序不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number,assessmentId?:number) => {
  dialogVisible.value = true;
  dialogTitle.value = t('action.' + type);
  formType.value = type;
  resetForm();

  if(assessmentId){
    formData.value.assessment = assessmentId
  }
  // 如果是更新，获取问题详情
  if (id) {
    formLoading.value = true;
    try {
      const question = await getQuestionDetail(id);
      formData.value = question;
      console.log('问题详情:', formData.value); // 打印问题详情
    } catch (error) {
      console.error('获取问题详情失败:', error);
    } finally {
      formLoading.value = false;
    }
  }
};

defineExpose({ open }) // 暴露open方法

/** 提交表单 */
const emit = defineEmits(['success']) // 事件用于回调
const submitForm = async () => {
  // 校验表单
  const valid = await formRef.value?.validate();
  if (!valid) return;

  formLoading.value = true;

  try {
    if (formType.value === 'create') {
      await createQuestion(formData.value);  // 新增问题
      message.success(t('common.createSuccess'));
    } else if (formData.value.id) {
      await updateQuestion(formData.value.id, formData.value);  // 更新问题
      message.success(t('common.updateSuccess'));
    }
    dialogVisible.value = false;
    emit('success');  // 操作成功的回调
  } finally {
    formLoading.value = false;
  }
};

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    assessment: 0,
    questionText: '',
    order: 1
  };
  formRef.value?.resetFields();
};
</script>
