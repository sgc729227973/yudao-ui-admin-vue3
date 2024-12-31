<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="1400px">
    <!-- 整个表单 -->
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
            <!-- 页面名称 -->
            <el-form-item label="页面名称" prop="pageName">
              <el-input
                v-model="formData.pageName"
                placeholder="请输入页面名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- 编码 -->
            <el-form-item label="编码" prop="code">
              <el-input
                v-model="formData.code"
                placeholder="请输入编码"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- 文件配置 -->
            <el-form-item label="文件配置" prop="fileConfigId">
              <el-select
                v-model="formData.fileConfigId"
                placeholder="请选择文件配置"
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
          </el-col>
          <el-col :span="12">
            <!-- 是否加密 -->
            <el-form-item label="是否加密" prop="encrypted">
              <el-switch v-model="formData.encrypted" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <!-- 描述 -->
            <el-form-item label="描述" prop="description">
              <el-input
                type="textarea"
                v-model="formData.description"
                placeholder="请输入描述"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- JSONEditor 区域，用于编辑 formData.contents -->
      <el-card shadow="never" class="mb-20">
        <template #header>
          <span>内容管理</span>
        </template>

        <!-- 替换原先的 <ContentsForm v-model="formData.contents" /> -->
        <!-- 现在改为 JsonEditorWrapper -->
        <JsonEditorWrapper
          v-model="formData.contents"
          mode="tree"  
          style="height: 500px;" 
        />
      </el-card>
    </el-form>

    <!-- 底部按钮 -->
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
import JsonEditorWrapper from './JsonEditorWrapper.vue'; 

import { getSimpleFileConfigList } from '@/api/infra/fileConfig';
import { createPageContents, updatePageContents, getPageContentsDetail } from '@/api/ow/content/pageContents';

// 表单数据类型
interface PageContentsFormData {
  id?: number;
  pageName: string;
  code?: string;
  description?: string;
  contents: Record<string, any>;
  fileConfigId?: number;
  encrypted?: boolean;
}

const dialogVisible = ref(false);
const dialogTitle = ref('');
const formLoading = ref(false);

const formData = reactive<PageContentsFormData>({
  id: undefined,
  pageName: '',
  code: '',
  description: '',
  contents: {},  // 这里存放 JSON 
  fileConfigId: undefined,
  encrypted: false,
});

// 校验规则
const formRules = reactive({
  pageName: [{ required: true, message: '页面名称不能为空', trigger: 'blur' }],
});

const fileConfigList = ref<{ id: number; name: string }[]>([]);
const formRef = ref();
const message = useMessage();
const emit = defineEmits(['success']);

// 打开弹窗
const open = async (type: string, id?: number) => {
  dialogVisible.value = true;
  dialogTitle.value = type === 'create' ? '新增页面内容' : '编辑页面内容';
  resetForm();

  if (id) {
    formLoading.value = true;
    try {
      const data = await getPageContentsDetail(id);
      // 把接口返回的数据赋给 formData
      Object.assign(formData, data);
      // 确保 contents 存在
      formData.contents = data.contents || {};
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      formLoading.value = false;
    }
  }
};

const submitForm = async () => {
  // 表单校验
  const valid = await formRef.value?.validate();
  if (!valid) return;

  formLoading.value = true;
  try {
    if (formData.id) {
      await updatePageContents(formData.id, formData);
      message.success('更新成功');
    } else {
      await createPageContents(formData);
      message.success('创建成功');
    }
    dialogVisible.value = false;
    emit('success');
  } catch (error) {
    message.error('提交失败');
  } finally {
    formLoading.value = false;
  }
};

const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    pageName: '',
    code: '',
    description: '',
    contents: {},
    fileConfigId: undefined,
    encrypted: false,
  });
};

const loadFileConfigList = async () => {
  try {
    fileConfigList.value = await getSimpleFileConfigList();
  } catch (error) {
    console.error('加载文件配置列表失败', error);
  }
};

onMounted(loadFileConfigList);
defineExpose({ open });
</script>

<style scoped>
.mb-20 {
  margin-bottom: 20px;
}
</style>
