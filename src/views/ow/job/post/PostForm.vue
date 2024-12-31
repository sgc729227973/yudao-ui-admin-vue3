<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="1000px">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="80px">
      <!-- 基础信息 -->
      <el-card shadow="never" class="mb-20">
        <template #header>
          <span>基础信息</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="岗位名称" prop="title">
              <el-input v-model="formData.title" placeholder="请输入岗位名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作地点" prop="location">
              <el-input v-model="formData.location" placeholder="请输入工作地点" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="经验水平" prop="experienceLevel">
              <el-input v-model="formData.experienceLevel" placeholder="请输入经验要求" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位列表" prop="postId">
              <el-select v-model="formData.postId" placeholder="请选择岗位" clearable>
                <el-option v-for="post in postList" :key="post.id" :label="post.name" :value="post.id||0" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="formData.sortOrder" placeholder="请输入排序" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :value="dict.value">
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="岗位描述" prop="description">
          <Editor v-model="formData.description" height="300px" placeholder="请输入岗位描述" />
        </el-form-item>
      </el-card>
    </el-form>

    <!-- 问题管理 -->
    <el-card shadow="never" class="mb-20">
      <template #header>
        <span>问题管理</span>
      </template>
      <el-table :data="formData.contents.question" border style="width: 100%">
        <el-table-column label="序号" type="index" width="50" align="center" />
        <el-table-column label="问题内容" min-width="300">
          <template #default="{ $index }">
            <el-input
              v-model="formData.contents.question[$index]"
              placeholder="请输入问题内容"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="60" align="center">
          <template #default="{ $index }">
            <el-button type="danger" @click="removeQuestion($index)" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-row justify="center" class="mt-3">
        <el-button @click="addQuestion" round>+ 添加问题</el-button>
      </el-row>
    </el-card>

    <!-- 表单按钮 -->
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict';
import { ref, reactive, defineEmits, defineExpose, onMounted } from 'vue';
import { getSimplePostList, PostVO } from '@/api/system/post';
import { createJobPost, updateJobPost, getJobPostDetail, JobPostVO } from '@/api/ow/job/post';

const dialogVisible = ref(false);
const dialogTitle = ref('');
const formLoading = ref(false);
const formType = ref('');
const formRef = ref();

const postList = ref<PostVO[]>([]);

const formData = reactive({
  id: undefined,
  title: '',
  location: '',
  experienceLevel: '',
  description: '',
  status: 1,
  postId: undefined,
  sortOrder: 0,
  contents: {
    question: [] as string[], // 改为直接使用字符串数组
  },
});

const formRules = reactive({
  title: [{ required: true, message: '岗位名称不能为空', trigger: 'blur' }],
  location: [{ required: true, message: '工作地点不能为空', trigger: 'blur' }],
  experienceLevel: [{ required: true, message: '经验要求不能为空', trigger: 'blur' }],
  description: [{ required: true, message: '岗位描述不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
});

const emit = defineEmits(['success']);

const open = async (type: string, id?: number) => {
  dialogVisible.value = true;
  dialogTitle.value = type === 'create' ? '新增岗位' : '编辑岗位';
  formType.value = type;
  resetForm();

  if (id) {
    formLoading.value = true;
    try {
      const jobPost = await getJobPostDetail(id);
      Object.assign(formData, jobPost);

      // 直接赋值为后端返回的字符串数组
      formData.contents.question = jobPost.contents?.question || [];
    } finally {
      formLoading.value = false;
    }
  }
};

defineExpose({ open });

const submitForm = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  formLoading.value = true;
  try {
    const payload: JobPostVO = {
      ...formData,
      contents: {
        question: [...formData.contents.question], // 保持为字符串数组
      },
    };
    if (formType.value === 'create') {
      await createJobPost(payload);
    } else if (formData.id) {
      await updateJobPost(formData.id, payload);
    }
    emit('success');
    dialogVisible.value = false;
  } finally {
    formLoading.value = false;
  }
};

const resetForm = () => {
  formData.id = undefined;
  formData.title = '';
  formData.location = '';
  formData.experienceLevel = '';
  formData.description = '';
  formData.status = 1;
  formData.postId = undefined;
  formData.sortOrder = 0;
  formData.contents.question = [];
};

const addQuestion = () => {
  formData.contents.question.push(''); // 添加空字符串表示新问题
};

const removeQuestion = (index: number) => {
  formData.contents.question.splice(index, 1);
};

onMounted(async () => {
  const data = await getSimplePostList();
  postList.value = data.map((post) => ({
    id: post.id,
    name: post.name,
    code: '', // 默认值
    sort: 0,
    status: 1,
    remark: '',
    createTime: undefined,
  }));
});
</script>
