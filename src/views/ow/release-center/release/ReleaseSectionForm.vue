<template>
  <div>
    <el-table :data="comments" border style="width: 100%">
      <el-table-column label="序号" type="index" width="50" align="center" />
      <el-table-column label="评论者姓名" min-width="120">
        <template #default="{ row }">
          <el-input v-model="row.username" placeholder="请输入评论者姓名" />
        </template>
      </el-table-column>
      <el-table-column label="评论内容" min-width="260">
        <template #default="{ row }">
          <el-input v-model="row.content" placeholder="请输入评论内容" />
        </template>
      </el-table-column>
      <el-table-column label="评论日期" min-width="200">
        <template #default="{ row }">
          <el-date-picker
            v-model="row.date"
            type="datetime"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="选择评论日期"
          />
        </template>
      </el-table-column>
      <el-table-column label="头像 URL" min-width="200">
        <template #default="{ row }">
          <el-input v-model="row.avatarUrl" placeholder="请输入头像 URL" />
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
import { ref, watch, defineProps, defineEmits } from 'vue';

interface CommentItem {
  username: string;
  content: string;
  date: string;
  avatarUrl: string;
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
  comments.value.push({ username: '', content: '', date: '', avatarUrl: '' });
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
