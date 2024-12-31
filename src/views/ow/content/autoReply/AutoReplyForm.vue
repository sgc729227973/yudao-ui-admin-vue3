<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <!-- 问题 -->
      <el-form-item label="问题" prop="question">
        <el-input v-model="formData.question" placeholder="请输入问题" />
      </el-form-item>

      <!-- 回复内容 -->
      <el-form-item label="回复内容" prop="reply">
        <el-input
          v-model="formData.reply"
          type="textarea"
          placeholder="请输入回复内容"
        />
      </el-form-item>

      <!-- 关键词 -->
      <el-form-item label="关键词" prop="keywords">
        <div>
          <el-input
            @keyup.enter="addKeyword"
            v-model="keywordInput"
            placeholder="请输入关键词"
          />
          <el-button size="small" type="primary" @click="addKeyword">添加</el-button>
        </div>
        <div>
          <el-tag
            v-for="(keyword, index) in formData.keywords"
            :key="index"
            closable
            @close="removeKeyword(index)"
            class="mb-5px"
          >
            {{ keyword }}
          </el-tag>
        </div>
      </el-form-item>

      <!-- 是否预加载 -->
      <el-form-item label="预加载" prop="preloaded">
        <el-radio-group v-model="formData.preloaded">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
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
import { createAutoReply, updateAutoReply, getAutoReplyDetail, AutoReplyVO } from '@/api/ow/content/autoReply'
import { ref, reactive, defineEmits, defineExpose } from 'vue'

const message = useMessage();
const { t } = useI18n() // 国际化

const dialogVisible = ref(false) // 弹窗的显示状态
const dialogTitle = ref('') // 弹窗标题
const formLoading = ref(false) // 表单加载状态
const formType = ref('') // 表单类型
const keywordInput = ref('') // 当前输入的关键词
const formData = ref<AutoReplyVO>({
  id: undefined,
  question: '',
  reply: '',
  keywords: [],
  preloaded: false
}) // 初始化表单数据

// 表单验证规则
const formRules = reactive({
  question: [{ required: true, message: '问题不能为空', trigger: 'blur' }],
  reply: [{ required: true, message: '回复内容不能为空', trigger: 'blur' }],
  preloaded: [{ required: true, message: '预加载不能为空', trigger: 'change' }]
})

const formRef = ref() // 表单引用

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增自动回复' : '修改自动回复'
  formType.value = type
  resetForm()

  if (id) {
    formLoading.value = true
    try {
      const autoReply = await getAutoReplyDetail(id)
      formData.value = { ...autoReply }
    } finally {
      formLoading.value = false
    }
  }
}

defineExpose({ open }) // 提供 open 方法


/** 添加关键词 */
const addKeyword = () => {
  const trimmedKeyword = keywordInput.value.trim()
  if (trimmedKeyword && !formData.value.keywords.includes(trimmedKeyword)) {
    formData.value.keywords.push(trimmedKeyword)
  }
  keywordInput.value = ''
}

/** 删除关键词 */
const removeKeyword = (index: number) => {
  formData.value.keywords.splice(index, 1)
}

const emit = defineEmits(['success']) // 定义 success 事件
/** 提交表单 */
const submitForm = async () => {
  if (!formRef.value) return 
  const valid = await formRef.value?.validate()
  if (!valid) return

  formLoading.value = true

  try {
    if (formType.value === 'create') {
      await createAutoReply(formData.value)
      message.success(t('common.createSuccess'))
    } else if (formData.value.id) {
      await updateAutoReply(formData.value.id, formData.value)
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
    question: '',
    reply: '',
    keywords: [],
    preloaded: false
  }
  keywordInput.value = ''
  formRef.value?.resetFields()
}
</script>

<style scoped>
.keywords-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.el-tag {
  font-size: 14px;
  padding: 4px 10px;
}
</style>