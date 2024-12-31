<template>
  <Dialog v-model="dialogVisible" title="申请详情" width="800">
    <div class="content-container">
      <!-- 基础信息 -->
      <h3 class="section-title">基础信息</h3>
      <el-descriptions border column=2>
        <el-descriptions-item label="申请编号">
          {{ detailData.id }}
        </el-descriptions-item>
        <el-descriptions-item label="岗位编号">
          {{ detailData.postId }}
        </el-descriptions-item>
        <el-descriptions-item label="申请人姓名">
          {{ detailData.name }}
        </el-descriptions-item>
        <el-descriptions-item label="电子邮件">
          {{ detailData.email }}
        </el-descriptions-item>
        <el-descriptions-item label="电话">
          {{ detailData.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="简历">
          <a :href="detailData.encryptedResume" target="_blank">查看简历</a>
        </el-descriptions-item>
        <el-descriptions-item label="申请时间">
          {{ formatDate(detailData.createTime) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 动态问题 -->
      <h3 class="section-title">申请问题及回答</h3>
      <el-descriptions border column=1>
        <template v-for="(answer, question) in detailData.questions" :key="question">
          <el-descriptions-item :label="String(question)">
            <div class="answer-container">{{ answer }}</div>
          </el-descriptions-item>
        </template>
      </el-descriptions>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { JobApplicationVO } from '@/api/ow/job/application';
import { ref } from 'vue';

const dialogVisible = ref(false);
const detailData = ref({} as JobApplicationVO);

const formatDate = (timestamp?: number) => {
  if (!timestamp) return '无'; // 如果时间戳不存在，返回默认值
  const date = new Date(timestamp);
  return date.toLocaleString(); // 转换为可读的本地时间格式
};

/** 打开详情弹窗 */
const open = (data: JobApplicationVO) => {
  dialogVisible.value = true;
  detailData.value = data;
};

defineExpose({ open }); // 暴露 open 方法供外部调用
</script>

<style scoped>
.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.answer-container {
  word-wrap: break-word;
  white-space: pre-wrap;
}
</style>


<style scoped>
.content-container {
  padding: 20px;
}

.section-title {
  margin-top: 20px;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.el-descriptions {
  margin-bottom: 20px;
}

.el-descriptions-item__label {
  font-weight: bold;
  text-align: left;
}

.el-descriptions-item__content {
  word-break: break-word; /* 处理长文本换行 */
  white-space: pre-wrap; /* 保留换行 */
}

.answer-container {
  min-height: 24px; /* 最小一行高度 */
}
</style>
