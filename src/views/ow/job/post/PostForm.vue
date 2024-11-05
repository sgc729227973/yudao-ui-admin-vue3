<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="80px">
      <!-- 岗位名称 -->
      <el-form-item label="岗位名称" prop="title">
        <el-input v-model="formData.title" placeholder="请输入岗位名称" />
      </el-form-item>

      <!-- 工作地点 -->
      <el-form-item label="工作地点" prop="location">
        <el-input v-model="formData.location" placeholder="请输入工作地点" />
      </el-form-item>

      <!-- 经验水平 -->
      <el-form-item label="经验水平" prop="experienceLevel">
        <el-input v-model="formData.experienceLevel" placeholder="请输入经验要求" />
      </el-form-item>

      <!-- 岗位列表 -->
      <el-form-item label="岗位列表" prop="postId">
        <el-select
          v-model="formData.postId"
          placeholder="请选择岗位"
          clearable
        >
          <el-option
            v-for="post in postList"
            :key="post.id"
            :label="post.name"
            :value="post.id"
          />
        </el-select>
      </el-form-item>

      <!-- 排序 -->
      <el-form-item label="排序" prop="sortOrder">
        <el-input-number v-model="formData.sortOrder" placeholder="请输入排序" />
      </el-form-item>

      <!-- 岗位描述（使用Editor组件） -->
      <el-form-item label="岗位描述" prop="description">
        <Editor v-model="formData.description" height="300px" placeholder="请输入岗位描述" />
      </el-form-item>

      <!-- 状态 -->
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :value="dict.value">
            {{ dict.label }}
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
import { createJobPost, updateJobPost, getJobPostDetail, JobPostVO } from '@/api/ow/job/post/index'
import { ref, reactive, defineEmits, defineExpose } from 'vue'
import { useI18n } from 'vue-i18n'
import { PostVO, getSimplePostList } from '@/api/system/post';

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗是否展示
const dialogTitle = ref('') // 弹窗标题
const formLoading = ref(false) // 表单加载中
const formType = ref('') // 表单类型：create - 新增；update - 修改

interface PostItem {
  id: number;
  name: string;
}

const postList = ref<PostItem[]>([]) 

// 定义表单数据接口
interface JobPostFormData {
  id?: number
  title: string
  location: string
  experienceLevel: string
  description: string // 使用 Editor 组件
  status: number
  postId: number
  sortOrder?: number
  createTime?: Date
}

const formData = ref<JobPostFormData>({
  id: undefined,
  title: '',
  location: '',
  experienceLevel: '',
  description: '', // 初始化为空字符串
  status: 1,
  postId: 0,
  sortOrder: 0
})

// 表单验证规则
const formRules = reactive({
  title: [{ required: true, message: '岗位名称不能为空', trigger: 'blur' }],
  location: [{ required: true, message: '工作地点不能为空', trigger: 'blur' }],
  experienceLevel: [{ required: true, message: '经验要求不能为空', trigger: 'blur' }],
  description: [{ required: true, message: '岗位描述不能为空', trigger: 'blur' }], // 使用 Editor 验证
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})

const formRef = ref()

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()

  if (id) {
    formLoading.value = true
    try {
      const jobPost = await getJobPostDetail(id)
      formData.value = {
        ...jobPost,
        description: jobPost.description || '' // 确保 description 不为 null
      }
    } catch (error) {
      console.error('获取岗位详情失败:', error)
    } finally {
      formLoading.value = false
    }
  }
}

defineExpose({ open }) // 提供 open 方法，用于外部调用

const emit = defineEmits(['success'])

/** 提交表单 */
const submitForm = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  formLoading.value = true

  try {
    const data: JobPostVO = { ...formData.value }

    if (formType.value === 'create') {
      await createJobPost(data)
      message.success(t('common.createSuccess'))
    } else if (data.id) {
      await updateJobPost(data.id, data)
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
    title: '',
    location: '',
    experienceLevel: '',
    description: '', // 重置为字符串
    status: 1,
    postId: 0,
    sortOrder: 0
  }
  formRef.value?.resetFields()
}

/** 加载岗位列表 */
const getPostList = async () => {
  try {
    const data = await getSimplePostList();
    postList.value = data
      .filter((post): post is PostVO & { id: number } => post.id !== undefined) // 确保 id 存在 
      .map((post) => ({
        id: post.id!,
        name: post.name,
      }));
  } catch (error) {}
}

/** 在弹窗打开时获取父级菜单 */
onMounted(async () => {
  await getPostList();
});

</script>
