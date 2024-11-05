<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <!-- 新闻标题 -->
      <el-form-item label="新闻标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入新闻标题" />
      </el-form-item>

      <!-- 作者 -->
      <el-form-item label="作者" prop="author">
        <el-input v-model="formData.author" placeholder="请输入作者" />
      </el-form-item>

      <!-- 媒体编码 -->
      <el-form-item label="媒体编码" prop="mediaCode">
        <el-input v-model="formData.mediaCode" placeholder="请输入媒体编码" />
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

      <!-- 新闻描述（改为 Editor 组件） -->
      <el-form-item label="新闻描述" prop="description">
        <Editor v-model="formData.description" height="150px" placeholder="请输入新闻描述" />
      </el-form-item>

      <!-- 是否置顶 -->
      <el-form-item label="置顶" prop="isTop">
        <el-switch v-model="formData.isTop" />
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
import { createNews, updateNews, getNewsDetail, OfficialWebsiteNewsVO } from '@/api/ow/content/news/index';
import { ref, reactive, defineEmits, defineExpose } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n(); // 国际化
const message = useMessage(); // 消息弹窗

const dialogVisible = ref(false); // 弹窗的是否展示
const dialogTitle = ref(''); // 弹窗的标题
const formLoading = ref(false); // 表单的加载中
const formType = ref(''); // 表单的类型：create - 新增；update - 修改

// 定义表单数据接口
interface NewsFormData {
  id?: number;
  title: string;
  author: string;
  datePublished: string; // 确保它是 string 类型
  mediaCode: string;
  description: string;
  isTop: boolean;
  status: number;
}

const formData = ref<NewsFormData>({
  id: undefined,
  title: '',
  author: '',
  datePublished: '',  // 初始化为空字符串
  mediaCode: '',
  description: '',  // 初始化为空字符串
  isTop: false,
  status: 1,
});

// 表单验证规则
const formRules = reactive({
  title: [{ required: true, message: '新闻标题不能为空', trigger: 'blur' }],
  author: [{ required: true, message: '作者不能为空', trigger: 'blur' }],
  mediaCode: [{ required: true, message: '媒体编码不能为空', trigger: 'blur' }],
  datePublished: [{ required: true, message: '发布日期不能为空', trigger: 'change' }],
  description: [{ required: true, message: '新闻描述不能为空', trigger: 'blur' }], // 需要确保 Editor 的内容不为空
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
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
      const news = await getNewsDetail(id);
      formData.value = { 
        ...news,
        datePublished: news.datePublished || '',  // 确保它是字符串
        description: news.description || '',  // 确保 description 是字符串
      };
      console.log('新闻详情:', formData.value);
    } catch (error) {
      console.error('获取新闻详情失败:', error);
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
    const data: OfficialWebsiteNewsVO = { 
      ...formData.value, 
      datePublished: formData.value.datePublished || '', // 确保是字符串格式
      description: formData.value.description || '', // 确保 description 是字符串格式
    };

    if (formType.value === 'create') {
      await createNews(data);
      message.success(t('common.createSuccess'));
    } else if (data.id) {
      await updateNews(data.id, data);
      message.success(t('common.updateSuccess'));
    }
    dialogVisible.value = false;
    emit('success');
  } finally {
    formLoading.value = false;
  }
};

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    title: '',
    author: '',
    datePublished: '',  // 重置为字符串
    mediaCode: '',
    description: '',  // 重置 description 为字符串
    isTop: false,
    status: 1,
  };
  formRef.value?.resetFields();
};
</script>
