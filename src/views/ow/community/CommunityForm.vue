<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <!-- 知识标题 -->
      <el-form-item label="知识标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入社区标题" />
      </el-form-item>

      <!-- 知识描述 (使用 Editor 组件) -->
      <el-form-item label="知识描述" prop="description">
        <Editor v-model="formData.description" height="300px" placeholder="请输入社区描述" />
      </el-form-item>

      <!-- 是否置顶 -->
      <el-form-item label="是否置顶" prop="isTop">
        <el-switch v-model="formData.isTop" />
      </el-form-item>

      <!-- 状态 -->
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :value="dict.value">
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      
      <!-- 发布日期 -->
      <el-form-item label="发布日期" prop="datePublished">
        <el-date-picker
          v-model="formData.datePublished"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择发布日期"
        />
      </el-form-item>
      
      <!-- 知识类型 -->
      <el-form-item label="知识类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择类型" @change="handleTypeChange">
          <el-option
            v-for="type in getIntDictOptions(DICT_TYPE.OW_SERVICES_NAME)"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </el-form-item>

      <!-- 载体类型 -->
      <el-form-item label="载体类型" prop="carrierType">
        <el-select v-model="formData.carrierType" placeholder="请选择载体类型">
          <el-option
            v-for="carrier in getStrDictOptions(DICT_TYPE.MP_MESSAGE_TYPE)"
            :key="carrier.value"
            :label="carrier.label"
            :value="carrier.value"
          />
        </el-select>
      </el-form-item>

      <!-- 媒体编码 -->
      <el-form-item label="媒体编码" prop="mediaCode">
        <el-input v-model="formData.mediaCode" placeholder="请输入媒体编码" />
      </el-form-item>

      <!-- 封面媒体编码 -->
      <el-form-item label="封面媒体" prop="coverMediaCode">
        <el-input v-model="formData.coverMediaCode" placeholder="请输入封面媒体编码" />
      </el-form-item>

      <!-- 视频封面媒体编码 -->
      <el-form-item label="视频封面" prop="videoCoverMediaCode">
        <el-input v-model="formData.videoCoverMediaCode" placeholder="请输入视频封面编码" />
      </el-form-item>

      <!-- 标签 -->
      <el-form-item label="标签" prop="tags">
        <el-select
          v-model="selectedTagIds"
          multiple
          placeholder="请选择标签"
        >
          <el-option
            v-for="tag in filteredTags"
            :key="tag.id"
            :label="tag.name"
            :value="tag.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import { getSimpleTagList } from '@/api/ow/content/tag'
import { createCommunity, updateCommunity, getCommunityDetail, CommunityVO } from '@/api/ow/community'
import { ref, reactive, defineEmits, defineExpose } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const tagList = ref<{ id: number; name: string; type: number }[]>([])  // 增加了 type 属性
const selectedTagIds = ref<number[]>([])
const filteredTags = ref<{ id: number; name: string }[]>([])  // 用于动态展示过滤后的标签

interface CommunityFormData {
  id?: number
  title: string
  description: string
  isTop: boolean
  datePublished: string // 确保它是 string 类型
  type: number
  carrierType: string
  mediaCode: string
  coverMediaCode: string
  videoCoverMediaCode: string
  status: number
}

const formData = ref<CommunityFormData>({
  id: undefined,
  title: '',
  description: '',
  isTop: false,
  datePublished: '',  // 初始化为空字符串
  type: 0,
  carrierType: '',
  mediaCode: '',
  coverMediaCode: '',
  videoCoverMediaCode: '',
  status: 1,
})

const formRules = reactive({
  title: [{ required: true, message: '知识社区标题不能为空', trigger: 'blur' }],
  description: [{ required: true, message: '知识社区描述不能为空', trigger: 'blur' }],
  datePublished: [{ required: true, message: '发布日期不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
})

const formRef = ref()

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()

  if (id) {
    formLoading.value = true
    try {
      const community = await getCommunityDetail(id)
      formData.value = {
        ...community,
        datePublished: community.datePublished || '',  // 确保它是字符串
      }
      selectedTagIds.value = community.tags?.map(tag => tag.id) || []
    } catch (error) {
      console.error('获取知识社区详情失败:', error)
      message.error(t('common.fetchDetailFailed'))
    } finally {
      formLoading.value = false
    }
  }

  await loadTags()
}

defineExpose({ open })

const emit = defineEmits(['success'])

const submitForm = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  formLoading.value = true

  try {
    const tags = selectedTagIds.value.map(id => {
      const tag = tagList.value.find(tag => tag.id === id)
      return { id: tag?.id || 0, name: tag?.name || '' }
    })

    const data: CommunityVO = {
      ...formData.value,
      datePublished: formData.value.datePublished || '', // 确保是字符串格式
      tags,
      mediaCode: formData.value.mediaCode || '',
      coverMediaCode: formData.value.coverMediaCode || '',
      videoCoverMediaCode: formData.value.videoCoverMediaCode || ''
    }

    if (formType.value === 'create') {
      await createCommunity(data)
      message.success(t('common.createSuccess'))
    } else if (data.id) {
      await updateCommunity(data.id, data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } catch (error) {
    console.error('提交表单失败:', error)
    message.error(t('common.submitFailed'))
  } finally {
    formLoading.value = false
  }
}

const loadTags = async () => {
  try {
    const response = await getSimpleTagList()
    if (response) {
      tagList.value = response
      // 初始化时，根据当前的type过滤标签
      filteredTags.value = tagList.value.filter(tag => tag.type === formData.value.type)
    }
  } catch (error) {
    console.error('标签加载失败', error)
    tagList.value = []
  }
}

const resetForm = () => {
  formData.value = {
    id: undefined,
    title: '',
    description: '',
    isTop: false,
    datePublished: '',  // 重置为字符串
    type: 0,
    carrierType: '',
    mediaCode: '',
    coverMediaCode: '',
    videoCoverMediaCode: '',
    status: 1,
  }
  selectedTagIds.value = []
  formRef.value?.resetFields()
}

// 当知识类型改变时，过滤相应的标签
const handleTypeChange = () => {
  filteredTags.value = tagList.value.filter(tag => tag.type === formData.value.type)
}
</script>