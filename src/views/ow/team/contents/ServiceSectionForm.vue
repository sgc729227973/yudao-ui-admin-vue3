<template>
  <el-card shadow="never" class="mb-20">
    <template #header>
      <!-- 服务区域标题，右侧显示开关和按钮 -->
      <div class="flex justify-between items-center">
        <span>服务区域</span>
        <div class="flex gap-2 items-center">
          <el-switch v-model="serviceSection.show" active-text="显示" inactive-text="隐藏" />

        </div>
      </div>
    </template>
    <el-form :model="serviceSection" label-width="120px">
      <!-- 标题 -->
      <el-form-item label="标题">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-input v-model="serviceSection.title1" placeholder="请输入标题一" />
          </el-col>
          <el-col :span="12">
            <el-input v-model="serviceSection.title2" placeholder="请输入标题二" />
          </el-col>
        </el-row>
      </el-form-item>
      <!-- 副标题 -->
      <el-form-item label="副标题" prop="subtitle">
        <el-input v-model="serviceSection.subtitle" placeholder="请输入副标题" />
      </el-form-item>
      <!-- 服务列表 -->
      <el-form-item label="服务列表" prop="services">
        <el-table :data="serviceSection.services" border style="width: 100%">
          <el-table-column label="图标" min-width="60">
            <template #default="{ row }">
              <el-input v-model="row.icon" placeholder="请输入图标" />
            </template>
          </el-table-column>
          <el-table-column label="标题" min-width="60">
            <template #default="{ row }">
              <el-input v-model="row.title" placeholder="请输入标题" />
            </template>
          </el-table-column>
          <el-table-column label="编号" min-width="60">
            <template #default="{ row }">
              <el-input v-model="row.number" placeholder="请输入编号" />
            </template>
          </el-table-column>
          <el-table-column label="描述" min-width="200">
            <template #default="{ row }">
              <el-input v-model="row.description" placeholder="请输入描述" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ $index }">
              <el-button type="danger" @click="removeService($index)" link>删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-row justify="center" class="mt-3">
          <el-button type="primary" @click="addService" round>+ 添加服务</el-button>
          </el-row>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps } from 'vue';

const props = defineProps<{ modelValue: any }>();
const emit = defineEmits(['update:modelValue']);

const serviceSection = ref<any>({});

watch(
  () => props.modelValue,
  (newVal) => {
    serviceSection.value = newVal || {
      show: true,
      title1: '',
      title2: '',
      subtitle: '',
      services: [],
    };
  },
  { immediate: true }
);

watch(
  () => serviceSection.value,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);

// 添加服务
const addService = () => {
  serviceSection.value.services.push({
    icon: '',
    title: '',
    number: '',
    description: '',
  });
};

// 删除服务
const removeService = (index: number) => {
  serviceSection.value.services.splice(index, 1);
};
</script>

<style scoped>
.mb-20 {
  margin-bottom: 20px;
}
.mt-2 {
  margin-top: 10px;
}
.flex {
  display: flex;
}
.gap-2 {
  gap: 0.5rem;
}
</style>
