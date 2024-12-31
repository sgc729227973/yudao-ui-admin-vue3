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
          <el-option :value="OwMediaTypeEnum.IMAGE" label="图片" />
          <el-option :value="OwMediaTypeEnum.VIDEO" label="视频" />
          <el-option :value="OwMediaTypeEnum.AUDIO" label="音频" />
        </el-select>
      </el-form-item>

      <!-- 如果是视频类型，显示 coverUrl 字段 -->
      <el-form-item
        v-if="formData.mediaType === OwMediaTypeEnum.VIDEO"
        label="封面URL"
        prop="coverUrl"
      >
        <el-input v-model="formData.coverUrl" placeholder="请输入封面 URL" />
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
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
      <!-- 跳转链接 -->
      <el-form-item label="跳转链接" prop="linkUrl">
        <el-input disabled v-model="formData.linkUrl" placeholder="自动构建无需输入" />
      </el-form-item>
      <!-- 是否加密 -->
      <el-form-item label="是否加密" prop="encrypted">
        <el-switch v-model="formData.encrypted" />
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
import { createMedia, updateMedia, getMediaDetail, OwMediaTypeEnum } from '@/api/ow/media-center/media';
import { ref, reactive, defineEmits, defineExpose } from 'vue';
import { getSimpleFileConfigList } from '@/api/infra/fileConfig';

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
  remark?: string;
  fileUrl: string;
  linkUrl: string;
  mediaType: number;
  fileConfigId?: number;
  encrypted?: boolean;
  coverUrl?: string;
}

const formData = reactive<MediaFormData>({
  id: undefined,
  name: '',
  code: '',
  remark: '',
  fileUrl: '',
  linkUrl: '',
  mediaType: 1,
  fileConfigId: undefined,
  encrypted: false,
  coverUrl: '',
});

// 表单验证规则
const formRules = reactive({
  name: [{ required: true, message: '媒体名称不能为空', trigger: 'blur' }],
  fileUrl: [{ required: true, message: '文件 URL 不能为空', trigger: 'blur' }],
  mediaType: [{ required: true, message: '媒体类型不能为空', trigger: 'change' }],
coverUrl: [
  {
    required: true,
    message: '视频类型必须填写封面 URL',
    trigger: 'blur',
    validator: (rule, value, callback) => {
      console.log('Validation rule:', rule); // 仅用于示例，实际可移除
      if (formData.mediaType === OwMediaTypeEnum.VIDEO && !value) {
        callback(new Error('封面 URL 不能为空'));
      } else {
        callback();
      }
    },
  },
],
});

const formRef = ref(); // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true;
  dialogTitle.value = type === 'create' ? '新增媒体' : '修改媒体';
  formType.value = type;
  resetForm();

  if (id) {
    formLoading.value = true;
    try {
      const media = await getMediaDetail(id);
      Object.assign(formData, media);
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
    if (formType.value === 'create') {
      await createMedia(formData);
      message.success('媒体新增成功');
    } else if (formData.id) {
      await updateMedia(formData.id, formData);
      message.success('媒体修改成功');
    }
    dialogVisible.value = false;
    emit('success');
  } catch (error) {
    console.error('提交表单失败:', error);
  } finally {
    formLoading.value = false;
  }
};

/** 重置表单 */
const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    name: '',
    code: '',
    remark: '',
    fileUrl: '',
    linkUrl: '',
    mediaType: 1,
    fileConfigId: undefined,
    encrypted: false,
    coverUrl: '',
  });
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
