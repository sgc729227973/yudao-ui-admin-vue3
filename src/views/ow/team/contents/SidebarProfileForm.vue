<template>
  <el-card shadow="never" class="mb-20">
    <template #header>
      <!-- 侧边栏个人资料标题和是否显示开关 -->
      <div class="flex justify-between items-center">
        <span>侧边栏个人资料</span>
        <el-switch v-model="sidebarProfile.show" active-text="显示" inactive-text="隐藏" />
      </div>
    </template>
    <el-form :model="sidebarProfile" label-width="120px">
      <!-- 年龄和城市 -->
      <el-form-item label="基本信息" prop="age">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-input v-model="sidebarProfile.age" placeholder="请输入年龄" />
          </el-col>
          <el-col :span="12">
            <el-input v-model="sidebarProfile.city" placeholder="请输入城市" />
          </el-col>
        </el-row>
      </el-form-item>
      <!-- 技能列表 -->
      <el-form-item label="技能列表" prop="skills">
        <el-table :data="sidebarProfile.skills" border style="width: 100%">
          <el-table-column label="图标" min-width="300">
            <template #default="{ row }">
              <el-input v-model="row.icon" placeholder="请输入图标路径" />
            </template>
          </el-table-column>
          <el-table-column label="标题" min-width="150">
            <template #default="{ row }">
              <el-input v-model="row.title" placeholder="请输入标题" />
            </template>
          </el-table-column>
          <el-table-column label="百分比" min-width="80">
            <template #default="{ row }">
              <el-input v-model="row.percentage" placeholder="例如：85%" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ $index }">
              <el-button type="danger" @click="removeSkill($index)" link>删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-row justify="center" class="mt-3">
          <el-button type="primary" @click="addSkill" round>+ 添加技能</el-button>
        </el-row>
      </el-form-item>
      <!-- 头像 -->
      <el-form-item label="头像" prop="avatar">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="暗色主题头像" prop="avatar.dark.fileUrl" label-width="100px">
              <el-input v-model="sidebarProfile.avatar.dark.fileUrl" placeholder="请输入图片 URL" />
            </el-form-item>
          </el-col>
          <el-col :span="24" class="mt-4">
            <el-form-item label="明亮主题头像" prop="avatar.light.fileUrl" label-width="100px">
              <el-input v-model="sidebarProfile.avatar.light.fileUrl" placeholder="请输入图片 URL" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps } from 'vue';

const props = defineProps<{ modelValue: any }>();
const emit = defineEmits(['update:modelValue']);

const sidebarProfile = ref<any>({});

watch(
  () => props.modelValue,
  (newVal) => {
    sidebarProfile.value = newVal || {
      show: true,
      age: '',
      city: '',
      stats: {},
      contacts: {},
      skills: [],
      avatar: {
        dark: { fileUrl: '' },
        light: { fileUrl: '' },
      },
    };
  },
  { immediate: true }
);

watch(
  () => sidebarProfile.value,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);

// 添加技能
const addSkill = () => {
  sidebarProfile.value.skills.push({
    icon: '',
    title: '',
    percentage: '',
  });
};

// 删除技能
const removeSkill = (index: number) => {
  sidebarProfile.value.skills.splice(index, 1);
};
</script>

<style scoped>
.mb-20 {
  margin-bottom: 20px;
}
.mt-2 {
  margin-top: 10px;
}
.mt-3 {
  margin-top: 15px;
}
</style>
