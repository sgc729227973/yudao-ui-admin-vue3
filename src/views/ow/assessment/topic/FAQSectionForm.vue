<template>
  <div>
    <el-table :data="faqSection" border style="width: 100%">
      <el-table-column label="序号" type="index" width="50" align="center" />
      <el-table-column label="问题" min-width="200">
        <template #default="{ row }">
          <el-input v-model="row.question" placeholder="请输入问题" />
        </template>
      </el-table-column>
      <el-table-column label="答案" min-width="200">
        <template #default="{ row }">
          <el-input v-model="row.answer" placeholder="请输入答案" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="60" align="center">
        <template #default="{ $index }">
          <el-button type="danger" @click="removeFAQ($index)" link>删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-row justify="center" class="mt-3">
      <el-button @click="addFAQ" round>+ 添加 FAQ</el-button>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps } from 'vue';

interface FAQItem {
  question: string;
  answer: string;
}

const props = defineProps<{ modelValue: FAQItem[] }>();
const emit = defineEmits(['update:modelValue']);

const faqSection = ref<FAQItem[]>([]);

watch(
  () => props.modelValue,
  (newVal) => {
    faqSection.value = newVal;
  },
  { immediate: true }
);

watch(
  () => faqSection.value,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);

const addFAQ = () => {
  faqSection.value.push({ question: '', answer: '' });
};

const removeFAQ = (index: number) => {
  faqSection.value.splice(index, 1);
};
</script>

<style scoped>
.mt-3 {
  margin-top: 15px;
}
</style>
