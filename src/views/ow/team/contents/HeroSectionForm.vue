<template>
  <el-card shadow="never" class="mb-20">
    <template #header>
      <!-- 介绍区域设置标题，右侧显示开关 -->
      <div class="flex justify-between items-center">
        <span>介绍区域设置</span>
        <el-switch v-model="introSection.show" active-text="显示" inactive-text="隐藏" />
      </div>
    </template>
    <el-form :model="introSection" label-width="120px" class="w-full">
      <!-- 状态 -->
      <el-form-item label="我的状态" prop="status">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-input
              v-model="statusInput"
              placeholder="输入状态并按回车"
              @keyup.enter="addStatus"
              clearable
            />
          </el-col>
          <el-col :span="24" class="mt-2">
            <div>
              <el-tag
                v-for="(status, index) in introSection.status"
                :key="status"
                closable
                @close="removeStatus(index)"
              >
                {{ status }}
              </el-tag>
            </div>
          </el-col>
        </el-row>
      </el-form-item>

      <!-- 介绍标题 -->
      <el-form-item label="介绍标题">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-input v-model="introSection.heroTitle1" placeholder="请输入标题一" />
          </el-col>
          <el-col :span="12">
            <el-input v-model="introSection.heroTitle2" placeholder="请输入标题二" />
          </el-col>
        </el-row>
      </el-form-item>

      <!-- 技能轮播 -->
      <el-form-item label="技能轮播" prop="skillsSlider">
        <div>
          <el-table :data="introSection.skillsSlider" border style="width: 100%">
            <el-table-column label="图标" prop="icon" min-width="600">
              <template #default="{ row }">
                <el-input v-model="row.icon" placeholder="请输入图标路径" />
              </template>
            </el-table-column>
            <el-table-column label="标题" prop="title" min-width="180">
              <template #default="{ row }">
                <el-input v-model="row.title" placeholder="请输入技能标题" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ $index }">
                <el-button type="danger" @click="removeSkill($index)" link>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-row justify="center" class="mt-3">
            <el-button type="primary" @click="addSkill" round>+ 添加技能</el-button>
          </el-row>
        </div>
      </el-form-item>

      <!-- 介绍图片 -->
      <el-form-item label="介绍图片" prop="heroImages">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="暗色主题图片" prop="heroImages.dark.fileUrl" label-width="120px">
              <el-input
                v-model="introSection.heroImages.dark.fileUrl"
                placeholder="请输入图片 URL"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" class="mt-4">
            <el-form-item label="明亮主题图片" prop="heroImages.light.fileUrl" label-width="120px">
              <el-input
                v-model="introSection.heroImages.light.fileUrl"
                placeholder="请输入图片 URL"
              />
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

const introSection = ref<any>({});
const statusInput = ref('');

watch(
  () => props.modelValue,
  (newVal) => {
    introSection.value = newVal || {
      show: true,
      status: [],
      heroTitle1: '',
      heroTitle2: '',
      heroParagraph1: '',
      heroParagraph2: '',
      heroParagraph3: '',
      skillsSlider: [],
      heroImages: {
        dark: { fileUrl: '' },
        light: { fileUrl: '' },
      },
    };
  },
  { immediate: true }
);

watch(
  () => introSection.value,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);

// 添加状态
const addStatus = () => {
  if (statusInput.value && !introSection.value.status.includes(statusInput.value)) {
    introSection.value.status.push(statusInput.value);
    statusInput.value = '';
  }
};

// 删除状态
const removeStatus = (index: number) => {
  introSection.value.status.splice(index, 1);
};

// 添加技能
const addSkill = () => {
  introSection.value.skillsSlider.push({
    icon: '',
    title: '',
  });
};

// 删除技能
const removeSkill = (index: number) => {
  introSection.value.skillsSlider.splice(index, 1);
};
</script>

<style scoped>
.mb-20 {
  margin-bottom: 20px;
}
.mt-3 {
  margin-top: 15px;
}
.mt-4 {
  margin-top: 20px;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
