<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <!-- SDK名称 -->
      <el-form-item label="SDK名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入SDK渠道名称" />
      </el-form-item>

      <!-- SDK ID -->
      <el-form-item label="SDK ID" prop="sdkId">
        <el-input v-model="formData.sdkId" placeholder="请输入SDK应用ID" />
      </el-form-item>

      <!-- SDK Secret -->
      <el-form-item label="SDK密钥" prop="sdkSecret">
        <el-input v-model="formData.sdkSecret" placeholder="请输入SDK应用密钥" />
      </el-form-item>

      <!-- SDK类型 -->
      <el-form-item label="SDK类型" prop="sdkType">
        <el-select v-model="formData.sdkType" placeholder="请选择SDK类型" clearable class="!w-240px">
          <el-option v-for="type in getStrDictOptions(DICT_TYPE.SYSTEM_SDK_TYPE)" :key="type.value" :label="type.label" :value="type.value" />
        </el-select>
      </el-form-item>

      <!-- SDK AppID -->
      <el-form-item label="SDK AppID" prop="sdkAppId">
        <el-input v-model="formData.sdkAppId" placeholder="请输入SDK AppID" />
      </el-form-item>

      <!-- API Key -->
      <el-form-item label="API Key" prop="apiKey">
        <el-input v-model="formData.apiKey" placeholder="请输入API Key" />
      </el-form-item>

      <!-- API Secret -->
      <el-form-item label="API Secret" prop="apiSecret">
        <el-input v-model="formData.apiSecret" placeholder="请输入API Secret" />
      </el-form-item>

      <!-- 状态 -->
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择状态">
          <el-option v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :value="dict.value" :label="dict.label" />
        </el-select>
      </el-form-item>

      <!-- 描述 -->
      <el-form-item label="描述" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入描述" />
      </el-form-item>

      <!-- 动态配置项 (键值对) -->
      <el-form-item label="配置项" prop="extraConfig">
        <div v-for="(config, index) in extraConfigList" :key="index" class="mb-2">
          <div class="flex items-center mb-2">
            <!-- 每个键值对占据整行 -->
            <el-input v-model="config.key" placeholder="请输入键" class="flex-2 !mr-50px" />
            <el-input v-model="config.value" placeholder="请输入值" class="flex-2 !mr-50px" />
            <el-button type="danger" @click="removeConfig(index)" class="flex-none" style="width: 80px;">删除</el-button>
          </div>
        </div>

        <!-- 按钮单独放在一行 -->
        <div class="mt-4">
          <el-button type="primary" @click="addConfig">添加新配置项</el-button>
        </div>
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
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict';
import { createSDK, updateSDK, getSDKDetail, SDKVO } from '@/api/system/sdk/index';
import { ref, reactive } from 'vue';

const message = useMessage();
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formLoading = ref(false);
const formType = ref('');

const { t } = useI18n();

interface SDKFormData {
  id?: number;
  name: string;
  sdkId: string;
  sdkSecret: string;
  sdkAppId: string;
  apiKey: string;
  apiSecret?: string;
  status?: number;
  remark?: string;
  sdkType?: string;
  master?: boolean;
  extraConfig?: { [key: string]: string };  // 动态配置字段
}

const formData = ref<SDKFormData>({
  id: undefined,
  name: '',
  sdkId: '',
  sdkSecret: '',
  sdkAppId: '',
  apiKey: '',
  apiSecret: '',
  status: undefined,
  remark: '',
  sdkType: '',
  master: false,
  extraConfig: {},  // 初始化为空对象
});

const extraConfigList = ref<Array<{ key: string; value: string }>>([]);

const formRules = reactive({
  name: [{ required: true, message: 'SDK名称不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
});

const formRef = ref();

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true;
  dialogTitle.value = type === 'create' ? '新增SDK渠道' : '修改SDK渠道';
  formType.value = type;
  resetForm();

  if (id) {
    formLoading.value = true;
    try {
      const sdk = await getSDKDetail(id);
      formData.value = { ...sdk };
      // 将 extraConfig 对象转换为键值对列表
      extraConfigList.value = Object.entries(formData.value.extraConfig || {}).map(([key, value]) => ({
        key,
        value,
      }));
      console.log('SDK详情:', formData.value);
    } catch (error) {
      console.error('获取SDK详情失败:', error);
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
    // 将 extraConfigList 转换为字典对象存储在 formData 中
    formData.value.extraConfig = extraConfigList.value.reduce((acc, { key, value }) => {
      if (key && value) { // 确保 key 和 value 都存在
        acc[key] = value;
      }
      return acc;
    }, {} as { [key: string]: string });

    const data: SDKVO = { ...formData.value };

    if (formType.value === 'create') {
      await createSDK(data);
      message.success(t('common.createSuccess'));
    } else if (data.id) {
      await updateSDK(data.id, data);
      message.success(t('common.updateSuccess'));
    }
    dialogVisible.value = false;
    emit('success');
  } finally {
    formLoading.value = false;
  }
};

/** 添加新配置项 */
const addConfig = () => {
  extraConfigList.value.push({ key: '', value: '' });  // 添加新的空键值对
};

/** 删除配置项 */
const removeConfig = (index: number) => {
  extraConfigList.value.splice(index, 1);  // 删除指定索引的键值对
};

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: '',
    sdkId: '',
    sdkSecret: '',
    sdkAppId: '',
    apiKey: '',
    apiSecret: '',
    status: undefined,
    remark: '',
    sdkType: '',
    master: false,
    extraConfig: {},  // 重置配置项
  };
  extraConfigList.value = [];
  formRef.value?.resetFields();
};
</script>
