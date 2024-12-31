<template>
  <div>
    <el-table :data="questions" border style="width: 100%">
      <el-table-column label="序号" type="index" width="50" align="center" />
      <el-table-column label="问题内容" min-width="200">
        <template #default="{ row }">
          <el-input v-model="row.questionText" placeholder="请输入问题内容" />
        </template>
      </el-table-column>
      <el-table-column label="选项" min-width="400">
        <template #default="{ row, $index }">
          <el-table :data="row.options" size="small" border>
            <el-table-column label="选项内容" min-width="150">
              <template #default="{ row: optionRow }">
                <el-input v-model="optionRow.content" placeholder="请输入选项内容" />
              </template>
            </el-table-column>
            <el-table-column label="选项分数" width="180">
              <template #default="{ row: optionRow }">
                <el-input-number v-model="optionRow.score" :min="0" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template #default="{ $index: oIndex }">
                <el-button type="danger" @click="removeOption($index, oIndex)" link>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="primary" @click="addOption($index)" default="mini" class="mt-2">添加选项</el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="60" align="center">
        <template #default="{ $index }">
          <el-button type="danger" @click="removeQuestion($index)" link>删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-row justify="center" class="mt-3">
      <el-button @click="addQuestion" round>+ 添加问题</el-button>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps } from 'vue';

interface AssessmentOption {
  score: number;
  content: string;
}

interface AssessmentQuestion {
  questionText: string;
  options: AssessmentOption[];
}

const props = defineProps<{ modelValue: AssessmentQuestion[] }>();
const emit = defineEmits(['update:modelValue']);

const questions = ref<AssessmentQuestion[]>([]);

watch(
  () => props.modelValue,
  (newVal) => {
    questions.value = newVal;
  },
  { immediate: true }
);

watch(
  () => questions.value,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);

const addQuestion = () => {
  questions.value.push({
    questionText: '',
    options: [],
  });
};

const removeQuestion = (qIndex: number) => {
  questions.value.splice(qIndex, 1);
};

const addOption = (qIndex: number) => {
  questions.value[qIndex].options.push({
    content: '',
    score: 0,
  });
};

const removeOption = (qIndex: number, oIndex: number) => {
  questions.value[qIndex].options.splice(oIndex, 1);
};
</script>

<style scoped>
.mt-3 {
  margin-top: 15px;
}
.mt-2 {
  margin-top: 10px;
}
</style>
