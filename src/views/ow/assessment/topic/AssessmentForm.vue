<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="1200px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <!-- 基础数据区域 -->
      <el-card shadow="never" class="mb-20">
        <template #header>
          <span>基础数据</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <!-- 评估标题 -->
            <el-form-item label="评估标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入评估标题" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <!-- 评估编码 -->
            <el-form-item label="评估编码" prop="code">
              <el-input v-model="formData.code" placeholder="请输入评估编码" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <!-- 状态 -->
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio
                  v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                  :key="dict.value"
                  :label="dict.value"
                >
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <!-- 总评估次数 -->
            <el-form-item label="总评估次数" prop="count">
              <el-input-number v-model="formData.count" placeholder="请输入总评估次数" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <!-- 文件配置 -->
            <el-form-item label="文件配置" prop="fileConfigId">
              <el-select
                v-model="formData.fileConfigId"
                placeholder="请选择文件配置"
                clearable
                class="w-100"
              >
                <el-option
                  v-for="config in fileConfigList"
                  :key="config.id"
                  :label="config.name"
                  :value="config.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <!-- 是否加密 -->
            <el-form-item label="是否加密" prop="encrypted">
              <el-switch v-model="formData.encrypted" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <!-- 标签 -->
            <el-form-item label="标签" prop="tags">
              <el-select 
              v-model="selectedTagIds"
              multiple 
              placeholder="请选择标签" 
              class="w-100"
              >
                <el-option
                  v-for="tag in tagList"
                  :key="tag.id"
                  :label="tag.name"
                  :value="tag.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 评估信息区域 -->
      <el-card shadow="never" class="mb-20">
        <template #header>
          <span>评估信息</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <!-- 评估主图 -->
            <el-form-item label="评估主图" prop="assessmentInfo.fileUrl">
              <el-input
                v-model="formData.assessmentInfo.fileUrl"
                placeholder="请输入评估主图 URL"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <!-- 副标题 -->
            <el-form-item label="副标题" prop="assessmentInfo.subheading">
              <el-input
                v-model="formData.assessmentInfo.subheading"
                placeholder="请输入副标题"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <!-- 页面标题 -->
            <el-form-item label="页面标题" prop="assessmentInfo.pageTitle">
              <el-input
                v-model="formData.assessmentInfo.pageTitle"
                placeholder="请输入页面标题"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 评估描述 -->
        <el-form-item label="评估描述" prop="assessmentInfo.description">
          <Editor
            v-model="formData.assessmentInfo.description"
            height="200px"
            placeholder="请输入评估描述"
          />
        </el-form-item>
        <!-- 问题数量和评估时长 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="问题数量" prop="assessmentInfo.numQuestions">
              <el-input-number
                v-model="formData.assessmentInfo.numQuestions"
                placeholder="请输入问题数量"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="评估时长" prop="assessmentInfo.duration">
              <el-input-number
                v-model="formData.assessmentInfo.duration"
                placeholder="请输入评估时长"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <!-- Meta Keywords -->
            <el-form-item label="Meta 关键字" prop="assessmentInfo.metaKeywords">
              <el-input
                v-model="formData.assessmentInfo.metaKeywords"
                placeholder="请输入 Meta 关键字"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- Meta 描述 -->
        <el-form-item label="Meta 描述" prop="assessmentInfo.metaDescription">
          <el-input
            v-model="formData.assessmentInfo.metaDescription"
            placeholder="请输入 Meta 描述"
          />
        </el-form-item>
      </el-card>

      <!-- 评估结果管理区域 -->
      <el-card shadow="never" class="mb-20">
        <template #header>
          <span>评估结果管理</span>
        </template>
        <ResultContentsForm v-model="formData.resultContents.riskLevels" />
      </el-card>

      <!-- 问答管理区域 -->
      <el-card shadow="never" class="mb-20">
        <template #header>
          <span>问答管理</span>
        </template>
        <FAQSectionForm v-model="formData.faqSection" />
      </el-card>

      <!-- 评论管理区域 -->
      <el-card shadow="never" class="mb-20">
        <template #header>
          <span>评论管理</span>
        </template>
        <CommentsSectionForm v-model="formData.comments" />
      </el-card>

      <!-- 问题管理区域 -->
      <el-card shadow="never" class="mb-20">
        <template #header>
          <span>问题管理</span>
        </template>
        <QuestionsSectionForm v-model="formData.questions" />
      </el-card>
    </el-form>

    <!-- 表单按钮 -->
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">保存</el-button>
      <el-button @click="dialogVisible = false">取消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict';
import {
  createAssessment,
  updateAssessment,
  getAssessmentDetail,
  OfficialWebAssessmentVO,
  OfficialWebsiteTag,
  ResultContents,  // 新增导入
} from '@/api/ow/assessment/topic';
import { getSimpleTagList } from '@/api/ow/assessment/tag'; // 获取标签列表 API
import { ref, reactive, defineEmits, defineExpose } from 'vue';
import FAQSectionForm from './FAQSectionForm.vue';
import CommentsSectionForm from './CommentsSectionForm.vue';
import QuestionsSectionForm from './QuestionsSectionForm.vue';
import { getSimpleFileConfigList } from '@/api/infra/fileConfig';
import ResultContentsForm from './result/ResultContentsForm.vue'; // 修改路径为正确的组件路径

const message = useMessage(); // 消息弹窗
const fileConfigList = ref<fileConfigList[]>([]);
const dialogVisible = ref(false); // 弹窗的是否展示
const dialogTitle = ref(''); // 弹窗的标题
const formLoading = ref(false); // 表单的加载中
const formType = ref(''); // 表单的类型：create - 新增；update - 修改
const tagList = ref<{ id: number; name: string; tagCode: string }[]>([]); // 标签列表
const selectedTagIds = ref<number[]>([]); // 选中的标签ID列表

interface fileConfigList {
  id: number;
  name: string;
}

// 定义表单数据接口
interface AssessmentFormData {
  id?: number;
  title: string;
  code: string;
  status: number;
  count?: number;
  tags?: OfficialWebsiteTag[];
  assessmentInfo: AssessmentInfo;
  faqSection: FAQItem[];
  comments: CommentItem[];
  questions: AssessmentQuestion[];
  fileConfigId: undefined,
  encrypted: false,
  resultContents: ResultContents;  // 添加此属性
}


interface AssessmentInfo {
  duration: number;
  fileUrl: string;
  pageTitle: string;
  subheading: string;
  description: string;
  metaKeywords: string;
  numQuestions: number;
  metaDescription: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface CommentItem {
  name: string;
  comment: string;
}

interface AssessmentOption {
  score: number;
  content: string;
}

interface AssessmentQuestion {
  questionText: string;
  options: AssessmentOption[];
}

const formData = ref<AssessmentFormData>({
  id: undefined,
  title: '',
  code: '',
  status: 0,
  count: 0,
  tags: [],
  assessmentInfo: {
    duration: 0,
    fileUrl: '',
    pageTitle: '',
    subheading: '',
    description: '',
    metaKeywords: '',
    numQuestions: 0,
    metaDescription: '',
  },
  faqSection: [],
  comments: [],
  questions: [],
  fileConfigId: undefined,
  encrypted: false,
  resultContents: {
    riskLevels: []  // 初始化 resultContents
  },
});

// 表单验证规则
const formRules = reactive({
  title: [{ required: true, message: '评估标题不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '评估编码不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  'assessmentInfo.numQuestions': [
    { required: true, message: '问题数量不能为空', trigger: 'blur' },
  ],
  'assessmentInfo.duration': [{ required: true, message: '评估时长不能为空', trigger: 'blur' }],
  // 可以根据需要添加其他验证规则
});

const formRef = ref(); // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true;
  dialogTitle.value = type === 'create' ? '新增评估' : '编辑评估';
  formType.value = type;
  resetForm();

  await loadTags();

  if (id) {
    formLoading.value = true;
    try {
      const assessment = await getAssessmentDetail(id);
      formData.value = {
        ...assessment,
        assessmentInfo: assessment.assessmentInfo || formData.value.assessmentInfo,
        faqSection: assessment.faqSection || [],
        comments: assessment.comments || [],
        questions: assessment.questions || [],
        resultContents: assessment.resultContents || { riskLevels: [] }, // 确保 resultContents 存在
      };
      selectedTagIds.value = assessment.tags?.map(tag => tag.id) || [];
    } catch (error) {
      console.error('获取评估详情失败:', error);
    } finally {
      formLoading.value = false;
    }
  }
};
defineExpose({ open }); // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']); // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  formLoading.value = true;

  try {
    // 构建 tags 数据
    const tags = selectedTagIds.value.map((id) => {
      const tag = tagList.value.find((tag) => tag.id === id);
      return { id: tag?.id || 0, name: tag?.name || '', tagCode: tag?.tagCode || '' };
    });

    const data: OfficialWebAssessmentVO = {
      ...formData.value,
      tags,
    };

    if (formType.value === 'create') {
      await createAssessment(data);
      message.success('创建成功');
    } else if (data.id) {
      await updateAssessment(data.id, data);
      message.success('更新成功');
    }
    dialogVisible.value = false;
    emit('success');
  } finally {
    formLoading.value = false;
  }
};

const loadTags = async () => {
  try {
    const response = await getSimpleTagList();
    if (response) {
      tagList.value = response;
    }
  } catch (error) {
    console.error('标签加载失败', error);
    tagList.value = [];
  }
};
/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    title: '',
    code: '',
    status: 0,
    count: 0,
    tags: [],
    assessmentInfo: {
      duration: 0,
      fileUrl: '',
      pageTitle: '',
      subheading: '',
      description: '',
      metaKeywords: '',
      numQuestions: 0,
      metaDescription: '',
    },
    faqSection: [],
    comments: [],
    questions: [],
    fileConfigId: undefined,
    encrypted: false,
    resultContents: {
      riskLevels: []
    },
  };
  selectedTagIds.value = []; // 重置选中的标签 ID
  formRef.value?.resetFields();
};

/** 加载配置列表 */
const loadFileConifgList = async () => {
  try {
    const data = await getSimpleFileConfigList(); // 获取配置列表
    fileConfigList.value = data; // 设置配置
  } catch (error) {
    console.error('加载文件配置列表失败:', error);
  }
};

/** 在弹窗打开时获取文件配置列表 */
onMounted(async () => {
  await loadFileConifgList();
});
</script>

<style scoped>
.w-100 {
  width: 100%;
}
.mb-20 {
  margin-bottom: 20px;
}
</style>