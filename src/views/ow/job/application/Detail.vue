<template>
  <Dialog v-model="dialogVisible" :max-height="500" :scroll="true" title="申请详情" width="800">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="申请编号" label-class="description-label">
        {{ detailData.id }}
      </el-descriptions-item>
      <el-descriptions-item label="岗位编号" label-class="description-label">
        {{ detailData.postId }}
      </el-descriptions-item>
      <el-descriptions-item label="申请人姓名" label-class="description-label">
        {{ detailData.firstName }} {{ detailData.lastName }}
      </el-descriptions-item>
      <el-descriptions-item label="电子邮件" label-class="description-label">
        {{ detailData.email }}
      </el-descriptions-item>
      <el-descriptions-item label="电话" label-class="description-label">
        {{ detailData.phone }}
      </el-descriptions-item>
      <el-descriptions-item label="简历" label-class="description-label">
        <a :href="detailData.encryptedResume" target="_blank">查看简历</a>
      </el-descriptions-item>
      <el-descriptions-item label="申请时间" label-class="description-label">
        {{ formatDate(detailData.createTime) }}
      </el-descriptions-item>
      <!-- 问题详情展示 -->
      <el-descriptions-item label="问题 1" label-class="description-label">
        {{ detailData.question1 }}
      </el-descriptions-item>
      <el-descriptions-item label="问题 2" label-class="description-label">
        {{ detailData.question2 }}
      </el-descriptions-item>
      <el-descriptions-item label="问题 3" label-class="description-label">
        {{ detailData.question3 }}
      </el-descriptions-item>
      <el-descriptions-item label="问题 4" label-class="description-label">
        {{ detailData.question4 }}
      </el-descriptions-item>
      <el-descriptions-item label="问题 5" label-class="description-label">
        {{ detailData.question5 }}
      </el-descriptions-item>
      <el-descriptions-item label="问题 6" label-class="description-label">
        {{ detailData.question6 }}
      </el-descriptions-item>
    </el-descriptions>
  </Dialog>
</template>

<script lang="ts" setup>
import { JobApplicationVO } from '@/api/ow/job/application'

const dialogVisible = ref(false)
const detailData = ref({} as JobApplicationVO)

const formatDate = (timestamp?: Date) => {
  if (!timestamp) return '无'; // 如果时间戳不存在，返回默认值
  const date = new Date(timestamp);
  return date.toLocaleString(); // 转换为可读的本地时间格式
};

/** 打开详情弹窗 */
const open = (data: JobApplicationVO) => {
  dialogVisible.value = true;
  detailData.value = data;
};

defineExpose({ open }) // 暴露 open 方法供外部调用
</script>

<style scoped>
.description-label {
  font-weight: bold;
  text-align: right; /* 右对齐标签文本 */
  padding-right: 5px; /* 增加标签与内容之间的空白 */
}

.el-descriptions-item__content {
  text-align: left; /* 左对齐内容 */
  font-size: 14px;
  padding: 5px 10px; /* 增加内容周围的填充 */
}

.el-descriptions-item__label {
  padding: 5px 10px; /* 增加标签的填充 */
  font-size: 14px;
}

.el-descriptions {
  border: 1px solid #e6e6e6; /* 添加边框以区分项目 */
  padding: 20px;
  background-color: #f9f9f9;
}

.dialog-container {
  padding: 20px;
  background-color: white;
  border-radius: 8px; /* 添加圆角 */
}
</style>