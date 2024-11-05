<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <!-- 团队成员姓名 -->
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入姓名" />
      </el-form-item>

      <!-- 职位 -->
      <el-form-item label="职位" prop="title">
        <el-input v-model="formData.title" placeholder="请输入职位" />
      </el-form-item>

      <!-- 团队类型 -->
      <el-form-item label="团队类型" prop="teamType">
        <el-select v-model="formData.teamType" placeholder="请选择团队类型">
          <el-option
            v-for="type in getIntDictOptions(DICT_TYPE.OW_TEAM_TYPE)"
            :key="type.value"
            :value="type.value"
            :label="type.label"
          />
        </el-select>
      </el-form-item>

      <!-- 简介 -->
      <el-form-item label="简介" prop="description">
        <el-input v-model="formData.description" type="textarea" placeholder="请输入简介" />
      </el-form-item>

      <!-- 排序顺序 -->
      <el-form-item label="排序顺序" prop="sortOrder">
        <el-input-number v-model="formData.sortOrder" placeholder="请输入排序顺序" />
      </el-form-item>

      <!-- 媒体资源 -->
      <el-form-item label="媒体编码" prop="mediaCode">
        <el-input v-model="formData.mediaCode" placeholder="请输入媒体资源编码" />
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
import { createTeamMember, updateTeamMember, getTeamDetail } from '@/api/ow/team/index';
import { ref, reactive, defineEmits, defineExpose } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const message = useMessage();

const dialogVisible = ref(false);
const dialogTitle = ref('');
const formLoading = ref(false);
const formType = ref('');

interface TeamFormData {
  id?: number;
  name: string;
  title: string;
  teamType: number;
  description: string;
  sortOrder: number;
  mediaCode?: string;
}

const formData = ref<TeamFormData>({
  id: undefined,
  name: '',
  title: '',
  teamType: 1,
  description: '',
  sortOrder: 0,
  mediaCode: ''
});

const formRules = reactive({
  name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
  title: [{ required: true, message: '职位不能为空', trigger: 'blur' }],
  teamType: [{ required: true, message: '团队类型不能为空', trigger: 'change' }],
  sortOrder: [{ required: true, message: '排序不能为空', trigger: 'blur' }]
});

const formRef = ref();

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true;
  dialogTitle.value = t('action.' + type);
  formType.value = type;
  resetForm();

  if (id) {
    formLoading.value = true;
    try {
      const member = await getTeamDetail(id);
      formData.value = { ...member };
    } catch (error) {
      console.error('获取团队成员详情失败:', error);
    } finally {
      formLoading.value = false;
    }
  }
};

defineExpose({ open });

/** 提交表单 */
const emit = defineEmits(['success']);
const submitForm = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  formLoading.value = true;

  try {
    const data = { ...formData.value };

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

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: '',
    title: '',
    teamType: 1,
    description: '',
    sortOrder: 0,
    mediaCode: ''
  };
  formRef.value?.resetFields();
};
</script>
