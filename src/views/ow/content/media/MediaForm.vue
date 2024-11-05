<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <!-- 媒体名称 -->
      <el-form-item label="媒体名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入媒体名称" />
      </el-form-item>

      <!-- 媒体编码 -->
      <el-form-item label="媒体编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入媒体编码" />
      </el-form-item>

      <!-- 媒体文件 URL -->
      <el-form-item label="文件URL" prop="fileUrl">
        <el-input v-model="formData.fileUrl" placeholder="请输入文件 URL" />
      </el-form-item>

      <!-- 媒体类型 -->
      <el-form-item label="媒体类型" prop="mediaType">
        <el-select v-model="formData.mediaType" placeholder="请选择媒体类型">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.OW_MEDIA_TYPE)"
            :key="dict.value"
            :value="dict.value"
            :label="dict.label"
          />
        </el-select>
      </el-form-item>

      <!-- 描述 -->
      <el-form-item label="描述" prop="description">
        <el-input v-model="formData.description" type="textarea" placeholder="请输入描述" />
      </el-form-item>

      <!-- 副标题 -->
      <el-form-item label="副标题" prop="subheading">
        <el-input v-model="formData.subheading" placeholder="请输入副标题" />
      </el-form-item>

      <!-- 配置ID -->
      <el-form-item label="配置ID" prop="fileConfigId">
        <el-select
          v-model="formData.fileConfigId"
          placeholder="请输入文件配置ID"
          clearable
        >
          <el-option
            v-for="config in fileConfigList"
            :key="config.id"
            :label="config.name"
            :value="config.id"
          />
        </el-select>
      </el-form-item>

      <!-- 是否加密 -->
      <el-form-item label="是否加密" prop="encrypted">
        <el-switch v-model="formData.encrypted" />
      </el-form-item>

      <!-- 标题 -->
      <el-form-item label="标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入标题" />
      </el-form-item>

      <!-- 封面 URL -->
      <el-form-item label="封面 URL" prop="coverUrl">
        <el-input v-model="formData.coverUrl" placeholder="请输入封面 URL" />
      </el-form-item>

      <!-- 链接 URL -->
      <el-form-item label="链接 URL" prop="linkUrl">
        <el-input v-model="formData.linkUrl" placeholder="请输入链接 URL" />
      </el-form-item>

      <!-- HTML 名称 -->
      <el-form-item label="HTML 名称" prop="htmlName">
        <el-input v-model="formData.htmlName" placeholder="请输入 HTML 名称" />
      </el-form-item>

      <!-- CSS 类名 -->
      <el-form-item label="CSS 类名" prop="cssClass">
        <el-input v-model="formData.cssClass" placeholder="请输入 CSS 类名" />
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
import { createMedia, updateMedia, getMediaDetail, MediaVO } from '@/api/ow/content/media';
import { ref, reactive, defineEmits, defineExpose } from 'vue';
import { useI18n } from 'vue-i18n';
import { getSimpleFileConfigList } from '@/api/infra/fileConfig';

const { t } = useI18n(); // 国际化
const message = useMessage(); // 消息弹窗

const dialogVisible = ref(false); // 弹窗的是否展示
const dialogTitle = ref(''); // 弹窗的标题
const formLoading = ref(false); // 表单的加载中
const formType = ref(''); // 表单的类型：create - 新增；update - 修改

interface fileConfigList {
  id: number;
  name: string;
}
const fileConfigList = ref<fileConfigList[]>([]);

// 定义表单数据接口
interface MediaFormData {
  id?: number;
  name: string;
  code?: string;
  description?: string;
  fileUrl: string;
  mediaType: number;
  subheading?: string;
  fileConfigId?: number;
  encrypted?: boolean;
  title?: string;
  coverUrl?: string;
  linkUrl?: string;
  htmlName?: string;
  cssClass?: string;
}

const formData = ref<MediaFormData>({
  id: undefined,
  name: '',
  code: '',
  description: '',
  fileUrl: '',
  mediaType: 0,
  subheading: '',
  fileConfigId: undefined,
  encrypted: false,
  title: '',
  coverUrl: '',
  linkUrl: '',
  htmlName: '',
  cssClass: '',
});

// 表单验证规则
const formRules = reactive({
  name: [{ required: true, message: '媒体名称不能为空', trigger: 'blur' }],
  fileUrl: [{ required: true, message: '文件 URL 不能为空', trigger: 'blur' }],
  mediaType: [{ required: true, message: '媒体类型不能为空', trigger: 'change' }],
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
      const media = await getMediaDetail(id);
      formData.value = { ...media };
      console.log('媒体详情:', formData.value);
    } catch (error) {
      console.error('获取媒体详情失败:', error);
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
    const data: MediaVO = { ...formData.value };

    if (formType.value === 'create') {
      await createMedia(data);
      message.success(t('common.createSuccess'));
    } else if (data.id) {
      await updateMedia(data.id, data);
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
    name: '',
    code: '',
    description: '',
    fileUrl: '',
    mediaType: 0,
    subheading: '',
    fileConfigId: undefined,
    encrypted: false,
    title: '',
    coverUrl: '',
    linkUrl: '',
    htmlName: '',
    cssClass: '',
  };
  formRef.value?.resetFields();
};

/** 加载父菜单列表 */
const loadFileConifgList = async () => {
  try {
    const data = await getSimpleFileConfigList(); // 获取配置列表
    fileConfigList.value = data; // 设置配置
  } catch (error) {
    console.error('加载文件配置列表失败:', error);
  }
};
/** 在弹窗打开时获取父级菜单 */
onMounted(async () => {
  await loadFileConifgList();
});
</script>
