<!-- CommunitySectionForm.vue -->

<template>
  <el-card shadow="never" class="mb-20">
    <template #header>
      <!-- 标题和显示开关 -->
      <div class="flex justify-between items-center">
        <span>社区区域</span>
        <el-switch v-model="communitySection.show" 
        active-text="显示" 
        inactive-text="隐藏" 
        />
      </div>
    </template>
    <el-form :model="communitySection" label-width="120px">
      <!-- 标题 -->
      <el-form-item label="标题">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-input v-model="communitySection.title1" placeholder="请输入标题一" />
          </el-col>
          <el-col :span="12">
            <el-input v-model="communitySection.title2" placeholder="请输入标题二" />
          </el-col>
        </el-row>
      </el-form-item>
      <!-- 段落 -->
      <el-form-item label="段落" prop="paragraph">
        <el-input
          type="textarea"
          v-model="communitySection.paragraph"
          placeholder="请输入段落"
        />
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps } from 'vue';

const props = defineProps<{ modelValue: any }>();
const emit = defineEmits(['update:modelValue']);

const communitySection = ref<any>({});

watch(
  () => props.modelValue,
  (newVal) => {
    communitySection.value = newVal || {
      show: true,
      title1: '',
      title2: '',
      paragraph: '',
    };
  },
  { immediate: true }
);

watch(
  () => communitySection.value,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);
</script>

<style scoped>
.mb-20 {
  margin-bottom: 20px;
}
.flex {
  display: flex;
}
.justify-between {
  justify-content: space-between;
}
.items-center {
  align-items: center;
}
</style>
