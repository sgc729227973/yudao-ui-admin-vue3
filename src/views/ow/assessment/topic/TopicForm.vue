<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <!-- 评估标题 -->
      <el-form-item label="评估标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入评估标题" />
      </el-form-item>

      <!-- 评估编码 -->
      <el-form-item label="评估编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入评估编码" />
      </el-form-item>

      <!-- 媒体编码 -->
      <el-form-item label="媒体编码" prop="mediaCode">
        <el-input v-model="formData.mediaCode" placeholder="请输入媒体编码" />
      </el-form-item>

      <!-- 评估描述 (使用 Editor 组件) -->
      <el-form-item label="评估描述" prop="description">
        <Editor v-model="formData.description" height="300px" placeholder="请输入评估描述" />
      </el-form-item>

      <!-- 问题数量和评估时长在同一行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="问题数量" prop="numQuestions">
            <el-input-number v-model="formData.numQuestions" placeholder="请输入问题数量" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="评估时长" prop="duration">
            <el-input-number v-model="formData.duration" placeholder="请输入评估时长" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <!-- 状态 -->
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :value="dict.value">
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!-- 菜单显示 -->
          <el-form-item label="菜单显示" prop="showMenu">
            <el-switch v-model="formData.showMenu" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 顶级菜单目录 -->
      <el-form-item label="顶级目录" prop="parent"  v-if="formData.showMenu">
        <el-select
          v-model="formData.showParentId"
          class="!w-240px"
          clearable
          placeholder="请选择顶级菜单目录"
        >
          <el-option
            v-for="menu in topMenus"
            :key="menu.id"
            :label="menu.name"
            :value="menu.id"
          />
        </el-select>
      </el-form-item>

      <!-- 标签 -->
      <el-form-item label="标签" prop="tags">
        <el-select
          v-model="selectedTagIds" 
          multiple
          placeholder="请选择标签"
        >
          <el-option
            v-for="tag in tagList"
            :key="tag.id"
            :label="tag.name"
            :value="tag.id"
          />
        </el-select>
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
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict';
import { getSimpleTagList } from '@/api/ow/content/tag'; // 获取标签列表 API
import { createAssessment, updateAssessment, getAssessmentDetail, OfficialWebAssessmentVO } from '@/api/ow/assessment/topic';
import { ref, reactive, defineEmits, defineExpose } from 'vue';
import { useI18n } from 'vue-i18n';
import { getSimpleMenuList } from '@/api/ow/menu'; // 导入API

interface MenuItem {
  id: number;
  name: string;
}

const topMenus = ref<MenuItem[]>([]);
const { t } = useI18n(); // 国际化
const message = useMessage(); // 消息弹窗

const dialogVisible = ref(false); // 弹窗的是否展示
const dialogTitle = ref(''); // 弹窗的标题
const formLoading = ref(false); // 表单的加载中
const formType = ref(''); // 表单的类型：create - 新增；update - 修改
const tagList = ref<{ id: number; name: string }[]>([]); // 标签列表
const selectedTagIds = ref<number[]>([]); // 选中的标签ID列表

// 获取顶级菜单列表
const getTopMenuList = async () => {
  try {
    const data = await getSimpleMenuList(); // 调用API获取顶级菜单
    topMenus.value = data; // 存储获取到的数据
  } catch (error) {
    console.error('获取顶级菜单列表失败:', error);
  }
};

// 定义表单数据接口
interface AssessmentFormData {
  id?: number;
  title: string;
  code: string;
  mediaCode: string;
  description: string;
  numQuestions: number;
  duration: number;
  status: number;
  showMenu: boolean;
  showParentId?: number; // 新增的父级菜单ID字段
}

const formData = ref<AssessmentFormData>({
  id: undefined,
  title: '',
  code: '',
  mediaCode: '',
  description: '',
  numQuestions: 0,
  duration: 0,
  status: 1,
  showMenu: false,
  showParentId: undefined, // 初始化为空
});

// 表单验证规则
const formRules = reactive({
  title: [{ required: true, message: '评估标题不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '评估编码不能为空', trigger: 'blur' }],
  mediaCode: [{ required: true, message: '媒体编码不能为空', trigger: 'blur' }],
  numQuestions: [{ required: true, message: '问题数量不能为空', trigger: 'blur' }],
  duration: [{ required: true, message: '评估时长不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  // 如果需要，可以添加其他验证规则
});

const formRef = ref(); // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true;
  dialogTitle.value = t('action.' + type);
  formType.value = type;
  resetForm();

  if (id) {
    formLoading.value = true;
    try {
      const assessment = await getAssessmentDetail(id);
      formData.value = {
        ...assessment,
        showParentId: assessment.showParentId || undefined, // 初始化 showParentId
      };
      selectedTagIds.value = assessment.tags.map(tag => tag.id);
      console.log('评估详情:', formData.value);
    } catch (error) {
      console.error('获取评估详情失败:', error);
    } finally {
      formLoading.value = false;
    }
  }
  await getTopMenuList(); 
  await loadTags();
};

defineExpose({ open }); // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']); // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  formLoading.value = true;

  try {
    // 将 selectedTagIds 映射为标签对象
    const tags = selectedTagIds.value.map(id => {
      const tag = tagList.value.find(tag => tag.id === id);
      return { id: tag?.id || 0, name: tag?.name || '' };
    });

    const data: OfficialWebAssessmentVO = {
      ...formData.value,
      tags, // 使用映射后的标签对象
      mediaCode: formData.value.mediaCode || '',
      numQuestions: formData.value.numQuestions || 0,
    };

    if (formType.value === 'create') {
      await createAssessment(data);
      message.success(t('common.createSuccess'));
    } else if (data.id) {
      await updateAssessment(data.id, data);
      message.success(t('common.updateSuccess'));
    }
    dialogVisible.value = false;
    emit('success');
  } finally {
    formLoading.value = false;
  }
}

/** 加载标签列表 */
const loadTags = async () => {
  try {
    const response = await getSimpleTagList(); // 调用获取简单标签的接口
    if (response) {
      tagList.value = response; // 将获取到的标签列表存储到 tagList 中
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
    mediaCode: '',
    description: '',
    numQuestions: 0,
    duration: 0,
    status: 1,
    showMenu: false,
    showParentId: undefined, // 重置父级菜单ID
  };
  selectedTagIds.value = []; // 重置选中的标签 ID
  formRef.value?.resetFields();
};
</script>