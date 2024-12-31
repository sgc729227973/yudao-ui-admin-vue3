<template>
  <div>
    <el-table :data="comments" border style="width: 100%">
      <el-table-column label="序号" type="index" width="50" align="center" />
      <el-table-column label="评论者姓名" min-width="150">
        <template #default="{ row }">
          <el-input v-model="row.name" placeholder="请输入评论者姓名" />
        </template>
      </el-table-column>
      <el-table-column label="评论内容" min-width="300">
        <template #default="{ row }">
          <el-input v-model="row.comment" placeholder="请输入评论内容" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="60" align="center">
        <template #default="{ $index }">
          <el-button type="danger" @click="removeComment($index)" link>删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-row justify="center" class="mt-3">
      <el-button @click="addComment" round>+ 添加评论</el-button>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps } from 'vue';

interface CommentItem {
  name: string;
  comment: string;
}

const props = defineProps<{ modelValue: CommentItem[] }>();
const emit = defineEmits(['update:modelValue']);

const comments = ref<CommentItem[]>([]);

watch(
  () => props.modelValue,
  (newVal) => {
    comments.value = newVal;
  },
  { immediate: true }
);

watch(
  () => comments.value,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);

const addComment = () => {
  comments.value.push({ name: '', comment: '' });
};

const removeComment = (index: number) => {
  comments.value.splice(index, 1);
};
</script>

<style scoped>
.mt-3 {
  margin-top: 15px;
}
</style>
