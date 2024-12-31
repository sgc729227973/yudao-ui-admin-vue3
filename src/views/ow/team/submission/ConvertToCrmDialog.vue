<template>
  <Dialog v-model="visible" title="选择负责人" width="400">
    <el-form :model="formData" ref="formRef">
      <el-form-item
        label="负责人"
        prop="ownerUserId"
        :rules="{ required: true, message: '请选择负责人', trigger: 'change' }"
      >
        <el-select v-model="formData.ownerUserId" placeholder="请选择负责人">
          <el-option
            v-for="user in userOptions"
            :key="user.id"
            :label="user.nickname"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onSubmit">确定</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useMessage } from '@/hooks/web/useMessage';
import { UserVO } from '@/api/system/user';
import * as UserApi from '@/api/system/user';
import { convertToCRM } from '@/api/ow/team/submission';

const { error: showError, success: showSuccess } = useMessage();
const emit = defineEmits(['success']); // 定义父组件事件

interface FormData {
  id: number;
  ownerUserId: number | undefined;
}

const visible = ref(false);
const formData = reactive<FormData>({
  id: 0,
  ownerUserId: undefined,
});
const formRef = ref();
const userOptions = ref<UserVO[]>([]);

/** 打开对话框 */
const open = async (id: number) => {
  formData.id = id;
  formData.ownerUserId = undefined;
  visible.value = true;
  try {
    userOptions.value = await UserApi.getSimpleUserList(); // 获取用户列表
  } catch (error) {
    showError('加载负责人列表失败');
  }
};

/** 提交表单 */
const onSubmit = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        // 调用 API 提交数据
        const success = await convertToCRM(formData.id, formData.ownerUserId!);
        if (success) {
          showSuccess('成功转化为CRM客户'); // 成功提示
          visible.value = false; // 关闭弹窗
          emit('success'); // 通知父组件刷新列表
        } else {
          showError('转化失败');
        }
      } catch (error) {
        showError('转化失败');
      }
    }
  });
};

defineExpose({ open });
</script>
