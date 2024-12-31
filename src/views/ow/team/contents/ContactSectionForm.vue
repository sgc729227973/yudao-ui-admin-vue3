<template>
  <el-card shadow="never" class="mb-20">
    <template #header>
      <!-- 联系区域标题，右侧显示开关 -->
      <div class="flex justify-between items-center">
        <span>联系区域</span>
        <el-switch v-model="contactSection.show" active-text="显示" inactive-text="隐藏" />
      </div>
    </template>
    <el-form :model="contactSection" label-width="120px">
      <!-- 标题 -->
      <el-form-item label="标题">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-input v-model="contactSection.title1" placeholder="请输入标题一" />
          </el-col>
          <el-col :span="12">
            <el-input v-model="contactSection.title2" placeholder="请输入标题二" />
          </el-col>
        </el-row>
      </el-form-item>
      <!-- 段落 -->
      <el-form-item label="段落" prop="paragraph">
        <el-input
          type="textarea"
          v-model="contactSection.paragraph"
          placeholder="请输入段落"
        />
      </el-form-item>
      <!-- 联系数据 -->
      <el-form-item label="联系数据" prop="contactData">
        <el-table :data="contactSection.contactData" border style="width: 100%">
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
              <el-button type="danger" @click="removeContactData($index)" link>删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-row justify="center" class="mt-3">
          <el-button type="primary" @click="addContactData" round>+ 添加联系数据</el-button>
        </el-row>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps } from 'vue';

const props = defineProps<{ modelValue: any }>();
const emit = defineEmits(['update:modelValue']);

const contactSection = ref<any>({});

watch(
  () => props.modelValue,
  (newVal) => {
    contactSection.value = newVal || {
      show: true,
      title1: '',
      title2: '',
      paragraph: '',
      contactData: [],
    };
  },
  { immediate: true }
);

watch(
  () => contactSection.value,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);

// 添加联系数据
const addContactData = () => {
  contactSection.value.contactData.push({
    title: '',
    description: '',
  });
};

// 删除联系数据
const removeContactData = (index: number) => {
  contactSection.value.contactData.splice(index, 1);
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
