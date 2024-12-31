<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="1200px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <!-- 基础信息区域 -->
      <el-card shadow="never" class="mb-20">
        <template #header>
          <span>基础信息</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <!-- 姓名 -->
            <el-form-item label="姓名" prop="name">
              <el-input v-model="formData.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <!-- 职位 -->
            <el-form-item label="职位" prop="position">
              <el-input v-model="formData.position" placeholder="请输入职位" />
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
            <!-- 排序顺序 -->
            <el-form-item label="排序顺序" prop="sortOrder">
              <el-input-number v-model="formData.sortOrder" placeholder="请输入排序顺序" />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <!-- 团队类型 -->
            <el-form-item label="团队类型" prop="teamType">
              <el-select v-model="formData.teamType" multiple placeholder="请选择团队类型">
                <el-option
                  v-for="type in getIntDictOptions(DICT_TYPE.OW_TEAM_TYPE)"
                  :key="type.value"
                  :value="type.value"
                  :label="type.label"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="头像 URL" prop="avatarUrl">
          <el-input v-model="formData.avatarUrl" placeholder="请输入头像 URL">
            <template #append>
              <el-button type="primary" @click="previewAvatar">预览</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-dialog v-model="avatarPreviewVisible" title="头像预览" width="400px">
          <el-image
            v-if="formData.avatarUrl"
            class="preview-image"
            :src="formData.avatarUrl"
            lazy
            preview-teleported
            fit="cover"
          />
          <template #footer>
            <el-button type="primary" @click="avatarPreviewVisible = false">关闭</el-button>
          </template>
        </el-dialog>
        <el-row :gutter="20">
          <el-col :span="12">
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
          <el-col :span="12">
            <!-- 用户选择 -->
            <el-form-item label="关联用户" prop="userId">
              <el-select v-model="formData.userId" placeholder="请选择用户" clearable>
                <el-option
                  v-for="user in userOptions"
                  :key="user.id"
                  :label="user.nickname"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="链接 URL" prop="linkUrl">
          <el-input v-model="formData.linkUrl" placeholder="请输入链接 URL">
            <template #append>
              <el-button type="primary" @click="navigateToLink">跳转</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-card>

      <!-- 内容区域 -->
      <el-card shadow="never" class="mb-20">
        <template #header>
          <span>内容设置</span>
          <!-- 这里是新增的切换按钮 -->
          <el-button type="text" @click="toggleEditorMode">
            {{ showJsonEditor ? '使用表单编辑' : '使用 JSON 编辑' }}
          </el-button>
        </template>

        <!-- 如果不在 JSON 编辑模式，就显示你的原来的递归表单：ContentsForm -->
        <ContentsForm
          v-if="!showJsonEditor"
          v-model="formData.contents"
        />

        <!-- 如果在 JSON 编辑模式，就渲染 JsonEditorTeam -->
        <JsonEditorTeam
          v-else
          v-model="formData.contents"
          mode="tree"
          style="height: 500px;"
        />
      </el-card>

    </el-form>

    <!-- 表单按钮 -->
    <template #footer>
      <el-button 
      :disabled="formLoading" 
      type="primary" 
      @click="submitForm"
      >
      确 定
    </el-button>
      <el-button 
      @click="dialogVisible = false"
      >
      取 消
    </el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict';
import { createTeamMember, updateTeamMember, getTeamDetail, OfficialWebsiteTeamMemberVO } from '@/api/ow/team/index';
import { ref, reactive, defineEmits, defineExpose } from 'vue';
import { useI18n } from 'vue-i18n';
import { UserVO } from '@/api/system/user';
import ContentsForm from './ContentsForm.vue';
import JsonEditorTeam from './JsonEditorTeam.vue'
import { getSimpleFileConfigList } from '@/api/infra/fileConfig';
import * as UserApi from '@/api/system/user';

const { t } = useI18n();
const message = useMessage();
const fileConfigList = ref<fileConfigList[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formLoading = ref(false);
const formType = ref('');
const userOptions = ref<UserVO[]>([]);
const avatarPreviewVisible = ref(false);

interface fileConfigList {
  id: number;
  name: string;
}

const formData = ref<OfficialWebsiteTeamMemberVO>({
  id: undefined,
  name: '',
  position: '',
  teamType: [],
  sortOrder: 0,
  encrypted: false,
  contents: {},
  avatarUrl: '',
  linkUrl: '',
  userId: undefined,
  fileConfigId: undefined,
});

/** 加载用户列表 */
const loadUserOptions = async () => {
  try {
    userOptions.value = await UserApi.getSimpleUserList();
  } catch (error) {
    console.error('加载用户列表失败:', error);
  }
};

const formRules = reactive({
  name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
  position: [{ required: true, message: '职位不能为空', trigger: 'blur' }],
  teamType: [{ required: true, message: '团队类型不能为空', trigger: 'change' }],
  sortOrder: [{ required: true, message: '排序不能为空', trigger: 'blur' }],
});

const formRef = ref();

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true;
  dialogTitle.value = type === 'create' ? '新增团队成员' : '编辑团队成员';
  formType.value = type;
  resetForm();

  if (id) {
    formLoading.value = true;
    try {
      const member = await getTeamDetail(id);
      formData.value = { ...member };
    } finally {
      formLoading.value = false;
    }
  }
};

/** 预览头像 */
const previewAvatar = () => {
  if (!formData.value.avatarUrl) {
    message.warning('请先输入头像 URL');
    return;
  }
  avatarPreviewVisible.value = true;
};

// 用于切换模式
const showJsonEditor = ref(true) // false=表单模式；true=JSON模式
function toggleEditorMode() {
  showJsonEditor.value = !showJsonEditor.value
}

/** 提交表单 */
const emit = defineEmits(['success']);
const submitForm = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  formLoading.value = true;

  try {
    const data = { ...formData.value };
    console.log("Submitted Data:", data); 
    if (formType.value === 'create') {
      await createTeamMember(data);
      message.success(t('common.createSuccess'));
    } else if (data.id) {
      await updateTeamMember(data.id, data);
      message.success(t('common.updateSuccess'));
    }
    dialogVisible.value = false;
    emit('success');
  } finally {
    formLoading.value = false;
  }
};
/** 跳转链接 */
const navigateToLink = () => {
  if (!formData.value.linkUrl) {
    message.warning('请先输入链接 URL');
    return;
  }
  window.open(formData.value.linkUrl, '_blank');
};

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: '',
    position: '',
    teamType: [],
    sortOrder: 0,
    encrypted: false,
    contents: {},
    avatarUrl: '',
    linkUrl: '',
    userId: undefined,
    fileConfigId: undefined,
  };
  formRef.value?.resetFields();
};

defineExpose({ open });
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
  await loadUserOptions(); // 加载用户列表
  await loadFileConifgList();
});
</script>

<style scoped>
.preview-image {
  width: 100%;
  height: auto;
}
.mb-20 {
  margin-bottom: 20px;
}
</style>