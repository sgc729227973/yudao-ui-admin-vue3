<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <!-- 文本名称 -->
      <el-form-item label="文本名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入文本名称" />
      </el-form-item>

      <!-- 文本编码 -->
      <el-form-item label="文本编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入文本编码" />
      </el-form-item>

      <!-- 模版名称 -->
      <el-form-item label="模版名称" prop="belongToHtml">
        <el-input v-model="formData.belongToHtml" placeholder="请输入模版名称" />
      </el-form-item>

      <!-- 文本描述 -->
      <el-form-item label="文本描述" prop="description">
        <el-input v-model="formData.description" type="textarea" placeholder="请输入文本描述" />
      </el-form-item>

      <!-- 文本内容（使用Editor组件） -->
      <el-form-item label="文本内容" prop="content">
        <Editor v-model="formData.content" height="300px" placeholder="请输入文本内容" />
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
import { createTextResource, updateTextResource, getTextResourceDetail } from '@/api/ow/content/text';
import { ref, reactive, defineExpose, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n(); // 国际化
const message = useMessage(); // 消息弹窗

const dialogVisible = ref(false); // 弹窗的是否展示
const dialogTitle = ref(''); // 弹窗的标题
const formLoading = ref(false); // 表单的加载中
const formType = ref(''); // 表单的类型：create - 新增；update - 修改

// 定义表单数据接口
interface TextFormData {
  id?: number;
  name: string;
  code: string;
  belongToHtml: string;
  description: string;
  content: string; // 作为Editor中的文本内容
}

const formData = ref<TextFormData>({
  id: undefined,
  name: '',
  code: '',
  belongToHtml: '',
  description: '',
  content: '', // 初始化为空字符串
});

// 表单验证规则
const formRules = reactive({
  name: [{ required: true, message: '文本名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '文本编码不能为空', trigger: 'blur' }],
  description: [{ required: true, message: '文本描述不能为空', trigger: 'blur' }],
  content: [{ required: true, message: '文本内容不能为空', trigger: 'blur' }], // 验证文本内容
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
      const textResource = await getTextResourceDetail(id);
      formData.value = { 
        ...textResource,
        content: textResource.content || '', // 确保文本内容为字符串
      };
    } catch (error) {
      console.error('获取文本资源详情失败:', error);
    } finally {
      formLoading.value = false;
    }
  }
};

defineExpose({ open }); // 提供 open 方法，用于打开弹窗
const emit = defineEmits(['success']); // 事件用于回调
/** 提交表单 */
const submitForm = async () => {
  const valid = await formRef.value?.validate(); // 验证表单
  if (!valid) return;

  formLoading.value = true; // 开启表单加载状态

  try {
    // 根据类型处理表单提交逻辑
    if (formType.value === 'create') {
      await createTextResource(formData.value); // 新增文本资源
      message.success(t('common.createSuccess')); // 显示成功提示
    } else if (formData.value.id) {
      await updateTextResource(formData.value.id, formData.value); // 更新文本资源
      message.success(t('common.updateSuccess')); // 显示成功提示
    }
    dialogVisible.value = false; // 关闭弹窗
    emit('success'); // 触发成功事件，通知父组件刷新列表
  } finally {
    formLoading.value = false; // 关闭表单加载状态
  }
};

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: '',
    code: '',
    belongToHtml: '',
    description: '',
    content: '', // 重置内容为字符串
  }; // 重置表单字段
  formRef.value?.resetFields(); // 重置表单验证
};
</script>
