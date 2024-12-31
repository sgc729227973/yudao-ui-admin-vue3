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

      <!-- 标签描述 -->
      <el-form-item label="标签描述" prop="description">
        <el-input v-model="formData.description" type="textarea" placeholder="请输入标签描述" />
      </el-form-item>

      <!-- 标签类型 -->
      <el-form-item label="服务类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择服务类型">
          <el-option
            v-for="type in getIntDictOptions(DICT_TYPE.OW_SERVICES_NAME)"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </el-form-item>

      <!-- 媒体类型 -->
      <el-form-item label="标签类型" prop="mediaType">
        <el-select v-model="formData.mediaType" placeholder="请选社区类型">
          <el-option
            v-for="type in getIntDictOptions(DICT_TYPE.OW_COMMUNITY_TYPE)"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
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
import { createTag, updateTag, getTagDetail, TagVO } from '@/api/ow/community-center/community-tag'
import { ref, reactive, defineEmits, defineExpose } from 'vue'
const message = useMessage();
const dialogVisible = ref(false) // 弹窗的显示状态
const dialogTitle = ref('') // 弹窗标题
const formLoading = ref(false) // 表单加载状态
const formType = ref('') // 表单类型
const formData = ref<TagVO>({
  id: undefined,
  name: '',
  tagCode: '',
  description: '',
  type: undefined,
  mediaType: undefined,
  status: 0
}) // 初始化表单数据

// 表单验证规则
const formRules = reactive({
  name: [{ required: true, message: '标签名称不能为空', trigger: 'blur' }],
  tagCode: [{ required: true, message: '标签编码不能为空', trigger: 'blur' }],
  description: [{ required: true, message: '标签描述不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '标签类型不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})

const formRef = ref() // 表单引用

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增标签' : '修改标签'
  formType.value = type
  resetForm()

  if (id) {
    formLoading.value = true
    try {
      const tag = await getTagDetail(id)
      formData.value = { ...tag }
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      formLoading.value = false
    }
  }
}

defineExpose({ open }) // 提供 open 方法

const emit = defineEmits(['success']) // 定义 success 事件

/** 提交表单 */
const submitForm = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  formLoading.value = true

  try {
    if (formType.value === 'create') {
      await createTag(formData.value)
      message.success('创建成功');
    } else if (formData.value.id) {
      await updateTag(formData.value.id, formData.value)
      message.success('更新成功');
    }
    emit('success')
    dialogVisible.value = false
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
    description: '',
    type: undefined,
    mediaType: undefined,
    status: 0
  }
  formRef.value?.resetFields()
}
</script>
@/api/ow/release-center/release-tag