<!-- AdvantagesSectionForm.vue -->

<template>
  <el-card shadow="never" class="mb-20">
    <template #header>
      <!-- 标题和显示开关 -->
      <div class="flex justify-between items-center">
        <span>优势区域</span>
        <el-switch v-model="advantagesSection.show" active-text="显示" inactive-text="隐藏" />
      </div>
    </template>
    <el-form :model="advantagesSection" label-width="120px">
      <!-- 标题 -->
      <el-form-item label="标题">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-input v-model="advantagesSection.title1" placeholder="请输入标题一" />
          </el-col>
          <el-col :span="12">
            <el-input v-model="advantagesSection.title2" placeholder="请输入标题二" />
          </el-col>
        </el-row>
      </el-form-item>
      <!-- 副标题 -->
      <el-form-item label="副标题" prop="subtitle">
        <el-input v-model="advantagesSection.subtitle" placeholder="请输入副标题" />
      </el-form-item>
      <!-- 优势列表 -->
      <el-form-item label="优势列表" prop="advantages">
        <el-table :data="advantagesSection.advantages" border style="width: 100%">
          <el-table-column label="标题" min-width="150">
            <template #default="{ row }">
              <el-input v-model="row.title" placeholder="请输入标题" />
            </template>
          </el-table-column>
          <el-table-column label="描述" min-width="200">
            <template #default="{ row }">
              <el-input v-model="row.description" placeholder="请输入描述" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ $index }">
              <el-button type="danger" @click="removeAdvantage($index)" link>删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-row justify="center" class="mt-3">
          <el-button type="primary" @click="addAdvantage" round>+ 添加优势</el-button>
        </el-row>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps } from 'vue';

const props = defineProps<{ modelValue: any }>();
const emit = defineEmits(['update:modelValue']);

const advantagesSection = ref<any>({});

watch(
  () => props.modelValue,
  (newVal) => {
    advantagesSection.value = newVal || {
      show: true,
      title1: '',
      title2: '',
      subtitle: '',
      advantages: [],
    };
  },
  { immediate: true }
);

watch(
  () => advantagesSection.value,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);

// 添加优势
const addAdvantage = () => {
  advantagesSection.value.advantages.push({
    title: '',
    description: '',
  });
};

// 删除优势
const removeAdvantage = (index: number) => {
  advantagesSection.value.advantages.splice(index, 1);
};
</script>

<style scoped>
.mb-20 {
  margin-bottom: 20px;
}
.mt-3 {
  margin-top: 15px;
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
