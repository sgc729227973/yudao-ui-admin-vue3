<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <!-- 基础信息 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单编码" prop="code">
              <el-input v-model="formData.code" placeholder="请输入菜单编码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择状态">
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                  :key="dict.value"
                  :value="dict.value"
                  :label="dict.label"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="formData.sort" placeholder="请输入排序值" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input v-model="formData.description" type="textarea" placeholder="请输入描述" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="菜单路径" prop="path">
              <el-input v-model="formData.path" placeholder="请输入菜单路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否可见" prop="visible">
              <el-switch v-model="formData.visible" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="父菜单" prop="parent">
              <el-select
                v-model="formData.parent"
                placeholder="请选择父菜单（默认顶级菜单）"
                clearable
              >
                <el-option
                  v-for="menu in parentMenus"
                  :key="menu.id"
                  :label="menu.name"
                  :value="menu.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否为快捷菜单" prop="isQuickLink">
              <el-switch v-model="formData.isQuickLink" />
            </el-form-item>
          </el-col>
        </el-row>
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
import { createMenu, updateMenu, getMenuDetail, getSimpleMenuList, OfficialWebsiteMenuVO } from '@/api/ow/menu/index';
import { ref, reactive, defineEmits, defineExpose, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const message = useMessage();

const dialogVisible = ref(false);
const dialogTitle = ref('');
const formLoading = ref(false);
const formType = ref('');

interface ParentMenus {
  id: number;
  name: string;
}
const parentMenus = ref<ParentMenus[]>([]);

interface MenuFormData {
  id?: number;
  name: string;
  path: string;
  code: string;
  status?: number;
  description?: string;
  parent?: number;
  sort?: number;
  visible?: boolean; // 是否可见
  isQuickLink?: boolean; // 是否为快捷菜单
}

const formData = ref<MenuFormData>({
  id: undefined,
  name: '',
  path: '',
  code: '',
  status: undefined,
  description: '',
  parent: undefined, // 父级菜单 ID
  sort: undefined,
  visible: true, // 默认可见
  isQuickLink: false,
});

const formRules = reactive({
  name: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '菜单编码不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  sort: [{ required: true, message: '排序值不能为空', trigger: 'blur' }],
});

const formRef = ref();

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true;
  dialogTitle.value = t('action.' + type);
  formType.value = type;
  resetForm();

  // 获取父菜单列表
  await loadParentMenus();

  if (id) {
    formLoading.value = true;
    try {
      const menu = await getMenuDetail(id);
      formData.value = { ...menu };
    } catch (error) {
      console.error('获取菜单详情失败:', error);
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
    const data: OfficialWebsiteMenuVO = { ...formData.value };

    if (formType.value === 'create') {
      await createMenu(data);
      message.success(t('common.createSuccess'));
    } else if (data.id) {
      await updateMenu(data.id, data);
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
    path: '',
    code: '',
    status: undefined,
    description: '',
    parent: undefined,
    sort: undefined,
    visible: true,
    isQuickLink: false,
  };
  formRef.value?.resetFields();
};

/** 加载父菜单列表 */
const loadParentMenus = async () => {
  try {
    const data = await getSimpleMenuList(); // 获取父菜单列表
    parentMenus.value = data; // 设置父菜单
  } catch (error) {
    console.error('加载父菜单失败:', error);
  }
};

/** 在弹窗打开时获取父级菜单 */
onMounted(async () => {
  await loadParentMenus();
});
</script>
