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
            <!-- 作者 -->
            <el-form-item label="作者" prop="author">
              <el-select v-model="formData.author" class="!w-240px" clearable placeholder="请选择作者">
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
            <!-- 是否置顶 -->
            <el-form-item label="是否置顶" prop="top">
              <el-switch v-model="formData.top" />
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
          <el-col :span="8">
            <!-- 状态 -->
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio
                  v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                  :key="dict.value"
                  :value="dict.value"
                >
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <!-- 发布类型 -->
            <el-form-item label="发布类型" prop="type">
              <el-select
                v-model="formData.type"
                placeholder="请选择发布类型"
                @change="handleTypeChange"
              >
                <el-option
                  v-for="type in getIntDictOptions(DICT_TYPE.OW_RELEASE_TYPE)"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
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
            <el-form-item label="发布日期" prop="datePublished">
              <el-date-picker
                v-model="formData.contents.datePublished"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                placeholder="选择发布日期"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <!-- 标签 -->
            <el-form-item label="标签" prop="tags">
              <el-select
                v-model="selectedTagIds"
                multiple
                placeholder="请选择标签"
                class="w-100"
                :disabled="!tagList.length && !formData.type"
              >
                <template v-if="!tagList.length">
                  <el-option
                    :key="-1"
                    :label="'请先选择发布类型'"
                    :value=number
                    disabled
                  />
                </template>
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
        <el-row :gutter="20">
          <el-col :span="8">
            <!-- 跳转链接 -->
            <el-form-item label="跳转链接" prop="linkUrl">
              <el-input disabled v-model="formData.linkUrl" placeholder="自动构建无需输入" />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <!-- 封面URL -->
            <el-form-item label="封面URL" prop="contents.coverUrl.fileUrl">
              <el-input
                v-model="formData.contents.coverUrl.fileUrl"
                placeholder="请输入封面URL"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-col :span="16">
          <!-- 标题 -->
          <el-form-item label="标题" prop="title">
            <el-input 
              v-model="formData.title" 
              placeholder="请输入标题" />
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <!-- 副标题 -->
          <el-form-item label="副标题" prop="subheading">
            <el-input
              v-model="formData.subheading"
              placeholder="请输入副标题"
            />
          </el-form-item>
        </el-col>
      </el-card>
      <!-- 动态内容管理 -->
      <el-card shadow="never" class="mb-20">
        <template #header>
          <span>动态内容管理</span>
        </template>
        <el-table :data="formData.contents.dynamicContent" border stripe>
          <el-table-column prop="sort" label="排序" width="120">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.sort"
                :min="1"
                @change="sortDynamicContent"
                class="w-100"
              />
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="120">
            <template #default="scope">
              <el-select v-model="scope.row.type" placeholder="选择类型">
                <el-option label="文本" value="content" />
                <el-option label="图片" value="image" />
                <el-option label="视频" value="video" />
                <el-option label="音频" value="audio" />
                <el-option label="超链接" value="link" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="内容" width="750">
            <template #default="scope">
              <el-input
                v-if="scope.row.type === 'content'"
                v-model="scope.row.data.text"
                type="textarea"
                placeholder="输入文本内容"
              />
              <div v-else-if="scope.row.type === 'image'">
                <el-input
                  v-model="scope.row.data.fileUrl"
                  placeholder="请输入图片URL"
                  class="mb-3"
                />
                <el-input
                  v-model="scope.row.data.description"
                  placeholder="请输入图片描述"
                  class="mb-3"
                />
                <el-input
                  v-model="scope.row.data.imageLinkUrl"
                  placeholder="请输入图片跳转链接"
                />
              </div>
              <div v-else-if="scope.row.type === 'video'">
                <el-input
                  v-model="scope.row.data.fileUrl"
                  placeholder="请输入视频URL"
                  class="mb-3"
                />
                <el-input
                  v-model="scope.row.data.coverUrl.fileUrl"
                  placeholder="请输入视频封面URL"
                />
              </div>
              <div v-else-if="scope.row.type === 'audio'">
                <el-input
                  v-model="scope.row.data.fileUrl"
                  placeholder="请输入音频URL"
                />
              </div>
              <div v-else-if="scope.row.type === 'link'">
                <el-input
                  v-model="scope.row.data.linkText"
                  placeholder="请输入链接文字"
                  class="mb-3"
                />
                <el-input
                  v-model="scope.row.data.linkUrl"
                  placeholder="请输入超链接URL"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="80">
            <template #default="scope">
              <el-button type="danger" @click="removeDynamicContent(scope.$index)" link>删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="add-button-container">
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="addDynamicContent"
            class="mt-10"
          >
            添加内容
          </el-button>
        </div>
      </el-card>
      <!-- 评论管理 -->
      <el-card shadow="never" class="mb-20">
        <template #header>
          <span>评论管理</span>
        </template>
        <ReleaseSectionForm v-model="formData.comments" />
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
import { getSimpleTagList } from '@/api/ow/release-center/release-tag';
import {
  createCommunity,
  updateCommunity,
  getCommunityDetail,
  CommunityVO,
  OfficialWebsiteTag,
} from '@/api/ow/release-center/release';
import { ref, reactive, defineEmits, defineExpose, onMounted, watch } from 'vue';
import ReleaseSectionForm from './ReleaseSectionForm.vue'; // 评论管理组件
import { getSimpleFileConfigList } from '@/api/infra/fileConfig';
import { getTeamSimpleList } from '@/api/ow/team';
import { number } from 'vue-types';

const message = useMessage();

/** 接口/类型定义 **/
interface fileConfigList {
  id: number;
  name: string;
}

interface Member {
  id: number;
  name: string;
}

// 动态内容类型，增加 'link'
interface DynamicContentItem {
  type: 'content' | 'image' | 'video' | 'audio' | 'link';
  sort: number;
  data: {
    fileUrl?: string;     // 图片、音视频 URL
    description?: string; // 图片描述
    title?: string;       // 视频或音频标题
    text?: string;        // 文本内容

    // 新增：超链接相关
    linkText?: string;    
    linkUrl?: string;     
    imageLinkUrl?: string;  // 点击图片时要跳转的地址

    coverUrl?: {
      fileUrl: string;    // 视频封面 URL
    };
  };
}

interface CommentItem {
  date: string;
  content: string;
  username: string;
  avatarUrl: string;
}

interface CommunityFormData {
  id?: number;
  title: string;
  subheading?: string;
  author?: number;
  top: boolean;
  status: number;
  tags?: OfficialWebsiteTag[];
  type?: number;
  fileConfigId?: number;
  encrypted?: boolean;
  linkUrl?: string;
  contents: {
    coverUrl: {
      fileUrl: string;
    };
    datePublished: string;
    dynamicContent: DynamicContentItem[];
  };
  comments: CommentItem[];
}

/** 响应式数据 **/
const fileConfigList = ref<fileConfigList[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formLoading = ref(false);
const formType = ref('');
const tagList = ref<OfficialWebsiteTag[]>([]);
const selectedTagIds = ref<number[]>([]);
const memberList = ref<Member[]>([]);

/** 表单数据（reactive） **/
const formData = reactive<CommunityFormData>({
  id: undefined,
  title: '',
  subheading: '',
  author: undefined,
  top: false,
  status: 0,
  tags: [],
  type: undefined,
  fileConfigId: undefined,
  encrypted: false,
  linkUrl: '',
  contents: {
    coverUrl: { fileUrl: '' },
    datePublished: '',
    dynamicContent: [],
  },
  comments: [],
});

/** 表单校验规则 **/
const formRules = reactive({
  title: [{ required: true, message: '知识标题不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  type: [{ required: true, message: '知识类型不能为空', trigger: 'change' }],
});

/** 加载成员列表 **/
const loadMemberList = async () => {
  try {
    const data = await getTeamSimpleList();
    memberList.value = data.map((item: any) => ({
      id: item.id,
      name: item.name,
    }));
  } catch (error) {
    console.error('加载成员列表失败:', error);
  }
};

/** 加载标签列表 **/
const loadTags = async (type?: number) => {
  try {
    if (!type) {
      tagList.value = [];
      return;
    }
    const response = await getSimpleTagList({ type });
    if (response) {
      tagList.value = response;
    }
  } catch (error) {
    console.error('标签加载失败:', error);
  }
};

/** 加载文件配置列表 **/
const loadFileConifgList = async () => {
  try {
    const data = await getSimpleFileConfigList();
    fileConfigList.value = data;
  } catch (error) {
    console.error('加载文件配置列表失败:', error);
  }
};

/** 排序，保证 sort 字段连续 **/
const sortDynamicContent = () => {
  formData.contents.dynamicContent.sort((a, b) => a.sort - b.sort);
};

/** 重置表单 **/
const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    title: '',
    subheading: '',
    author: undefined,
    top: false,
    status: 0,
    tags: [],
    type: undefined,
    category: undefined,
    fileConfigId: undefined,
    encrypted: false,
    linkUrl: '',
    contents: {
      coverUrl: { fileUrl: '' },
      datePublished: '',
      dynamicContent: [],
    },
    comments: [],
  });
  selectedTagIds.value = [];
};

/** 类型变更时触发 **/
const handleTypeChange = async () => {
  if (formData.type) {
    await loadTags(formData.type);
  } else {
    tagList.value = [];
  }
};

/** 弹窗：创建 or 编辑 **/
const open = async (type: string, id?: number) => {
  dialogVisible.value = true;
  dialogTitle.value = type === 'create' ? '新增知识' : '编辑知识';
  formType.value = type;
  resetForm();

  if (id) {
    formLoading.value = true;
    try {
      const community = await getCommunityDetail(id);
      Object.assign(formData, community);
      selectedTagIds.value = community.tags?.map((tag) => tag.id) || [];
      await handleTypeChange();
      sortDynamicContent();
    } catch (error) {
      console.error('获取知识详情失败:', error);
      message.error('获取详情失败');
    } finally {
      formLoading.value = false;
    }
  }
};

/** 动态内容：新增一项 **/
const addDynamicContent = () => {
  formData.contents.dynamicContent.push({
    type: 'content',
    sort: formData.contents.dynamicContent.length + 1,
    data: {
      fileUrl: '',
      text: '',
      description: '',
      coverUrl: { fileUrl: '' },
    },
  });
  sortDynamicContent();
};

/** 动态内容：移除某一项 **/
const removeDynamicContent = (index: number) => {
  formData.contents.dynamicContent.splice(index, 1);
  formData.contents.dynamicContent.forEach((item, idx) => {
    item.sort = idx + 1;
  });
};

/** 对外暴露 open 方法 **/
defineExpose({ open });

/** 表单提交 **/
const emit = defineEmits(['success']);
const formRef = ref();

const submitForm = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  formLoading.value = true;
  try {
    const tags = selectedTagIds.value.map((id) => {
      const tag = tagList.value.find((tag) => tag.id === id);
      return {
        id: tag?.id || 0,
        name: tag?.name || '',
        tagCode: tag?.tagCode || '',
      };
    });

    const data: CommunityVO = {
      id: formData.id,
      title: formData.title,
      subheading: formData.subheading,
      author: formData.author,
      top: formData.top,
      status: formData.status,
      type: formData.type,
      fileConfigId: formData.fileConfigId,
      encrypted: formData.encrypted,
      linkUrl: formData.linkUrl,
      tags,
      contents: {
        coverUrl: formData.contents.coverUrl,
        datePublished: formData.contents.datePublished,
        dynamicContent: formData.contents.dynamicContent.map((item) => ({
          type: item.type,
          sort: item.sort,
          data: {
            fileUrl: item.data.fileUrl || '',
            description: item.data.description || '',
            text: item.data.text || '',
            linkText: item.data.linkText || '',
            linkUrl: item.data.linkUrl || '',
            imageLinkUrl: item.data.imageLinkUrl || '',
            coverUrl: item.data.coverUrl || { fileUrl: '' },
          },
        })),
      },
      comments: {
        comments: formData.comments,
        commentCount: formData.comments.length.toString(),
      },
    };

    if (formType.value === 'create') {
      await createCommunity(data);
      message.success('创建成功');
    } else if (data.id) {
      await updateCommunity(data.id, data);
      message.success('更新成功');
    }

    dialogVisible.value = false;
    emit('success');
  } catch (error) {
    console.error('提交表单失败:', error);
    message.error('提交失败');
  } finally {
    formLoading.value = false;
  }
};

/** onMounted 时加载基础数据 **/
onMounted(async () => {
  await loadMemberList();
  await loadFileConifgList();
});

watch(() => formData.type, handleTypeChange);
</script>



<style scoped>
.w-100 {
  width: 100%;
}
.mb-20 {
  margin-bottom: 20px;
}
</style>
@/api/ow/ow-community-center@/api/ow/release-center/release-tag