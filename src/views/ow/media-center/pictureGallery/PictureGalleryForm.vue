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
          <span>基础信息</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- 标题 -->
            <el-form-item label="标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- 作者 -->
            <el-form-item label="作者" prop="authorId">
              <el-select
                v-model="formData.authorId"
                class="!w-240px"
                clearable
                placeholder="请选择作者"
              >
                <el-option
                  v-for="member in memberList"
                  :key="member.id"
                  :label="member.name"
                  :value="member.id"
                />
              </el-select>
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
          <el-col :span="4">
            <!-- 是否加密 -->
            <el-form-item label="是否加密" prop="encrypted">
              <el-switch v-model="formData.encrypted" />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <!-- 是否推荐 -->
            <el-form-item label="是否推荐" prop="isFeatured">
              <el-switch v-model="formData.isFeatured" />
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
        <el-row>
          <el-col :span="24">
            <!-- 副标题 -->
            <el-form-item label="副标题" prop="subheading">
              <el-input v-model="formData.subheading" placeholder="请输入副标题" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="16">
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
          <el-col :span="8">
            <!-- 拍摄日期 -->
            <el-form-item label="拍摄日期" prop="dateTaken">
              <el-date-picker
                v-model="formData.dateTaken"
                clearable
                placeholder="选择发布日期"
                type="date"
                value-format="x"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 内容管理区域：对 contents 进行深度编辑 -->
      <el-card shadow="never" class="mb-20">
        <template #header>
          <span>内容管理</span>
        </template>
        <!-- 这里使用 ContentsForm，内部会处理 coverUrl / pageTitle / wallSection / projectInfoSection 等 -->
        <ContentsForm v-model="formData.contents" />
      </el-card>
    </el-form>

    <!-- 表单按钮 -->
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">
        保存
      </el-button>
      <el-button @click="dialogVisible = false">取消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, defineExpose, defineEmits, onMounted } from 'vue';
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict';
import ContentsForm from './ContentsForm.vue';

import { getSimpleTagList } from '@/api/ow/media-center/tag';
import {
  createPictureGallery,
  updatePictureGallery,
  getPictureGalleryDetail,
  PictureGalleryVO,
  OfficialWebsiteTag
} from '@/api/ow/media-center/pictureGallery';
import { getTeamSimpleList } from '@/api/ow/team';
import { getSimpleFileConfigList } from '@/api/infra/fileConfig';

// 定义 Contents 类型
type Contents = {
  coverUrl?: { fileUrl: string };
  pageTitle?: string;
  wallSection?: Array<{ title: string; fileUrl: string }>;
  projectInfoSection?: Array<{ label: string; value: string }>;
  dynamicContent?: Array<{ sort: number; type: string; data: Record<string, any> }>;
};

const message = useMessage();
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formLoading = ref(false);
const formRef = ref();
const emit = defineEmits(['success']);
const { t } = useI18n() // 国际化

// 作者列表
const memberList = ref<{ id: number; name: string }[]>([]);
const fileConfigList = ref<{ id: number; name: string }[]>([]);
// 标签列表
const tagList = ref<OfficialWebsiteTag[]>([]);
// 选中的标签 ID
const selectedTagIds = ref<number[]>([]);

// 表单数据
const formData = reactive<PictureGalleryVO & { contents: Partial<Contents> }>({
  id: undefined,
  title: '',
  isFeatured: false,
  category: undefined,
  status: undefined,
  subheading: '',
  dateTaken: undefined,
  authorId: undefined,
  fileConfigId: undefined,
  encrypted: false,
  contents: {}, // 初始化为 Partial<Contents>
  tags: []
});

// 表单校验规则
const formRules = reactive({
  title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
  category: [{ required: true, message: '分类不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  dateTaken: [{ required: true, message: '拍摄日期不能为空', trigger: 'change' }]
});

defineExpose({
  open
});

/** open方法：创建 or 编辑 */
async function open(type: string, id?: number) {
  dialogVisible.value = true;
  dialogTitle.value = type === 'create' ? '新增图片' : '编辑图片';
  resetForm();

  await loadTags();

  if (id) {
    formLoading.value = true;
    try {
      const data = await getPictureGalleryDetail(id);
      Object.assign(formData, data);

      // 确保 contents 被正确初始化
      if (!formData.contents) {
        formData.contents = {};
      }

      selectedTagIds.value = data.tags?.map(tag => tag.id) || [];
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      formLoading.value = false;
    }
  }
}

/** 提交表单 */
async function submitForm() {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  formLoading.value = true;
  try {
    // 将选中的 tagId 转为标签对象
    const finalTags = tagList.value.filter(tag => selectedTagIds.value.includes(tag.id));
    formData.tags = finalTags;

    if (formData.id) {
      await updatePictureGallery(formData.id, formData);
      message.success(t('common.updateSuccess'))
    } else {
      await createPictureGallery(formData);
      message.success(t('common.createSuccess'))
    }
    dialogVisible.value = false;
    emit('success');
  } finally {
    formLoading.value = false;
  }
}

/** 重置表单 */
function resetForm() {
  Object.assign(formData, {
    id: undefined,
    title: '',
    isFeatured: false,
    category: undefined,
    status: undefined,
    subheading: '',
    dateTaken: undefined,
    authorId: null,
    fileConfigId: undefined,
    encrypted: false,
    contents: {}, // 确保是 Partial<Contents>
    tags: []
  });
  selectedTagIds.value = [];
}

/** 加载作者列表 */
async function loadmemberList() {
  try {
    const data = await getTeamSimpleList({ teamType: 7 });
    memberList.value = data.map((item: any) => ({
      id: item.id,
      name: item.name,
    }));
  } catch (error) {
    console.error('加载作者列表失败:', error);
  }
}

/** 加载文件配置 */
async function loadFileConifgList() {
  try {
    const data = await getSimpleFileConfigList();
    fileConfigList.value = data;
  } catch (error) {
    console.error('加载文件配置列表失败:', error);
  }
}

/** 加载标签 */
async function loadTags() {
  try {
    const response = await getSimpleTagList();
    tagList.value = response || [];
  } catch (error) {
    console.error('标签加载失败', error);
    tagList.value = [];
  }
}

onMounted(() => {
  loadmemberList();
  loadFileConifgList();
});
</script>
@/api/ow/release-center/release-tag