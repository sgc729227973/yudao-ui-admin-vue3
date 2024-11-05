<template>
  <Dialog v-model="dialogVisible" :max-height="500" :scroll="true" title="详情" width="800">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="日志编号" label-class="description-label" width="1">
        {{ detailData.id }}
      </el-descriptions-item>
      <el-descriptions-item label="用户编号" label-class="description-label">
        {{ detailData.userId }}
      </el-descriptions-item>
      <el-descriptions-item label="评估编号" label-class="description-label">
        {{ detailData.assessmentId }}
      </el-descriptions-item>
      <el-descriptions-item label="评估标题" label-class="description-label">
        {{ detailData.assessmentTitle }}
      </el-descriptions-item>
      <el-descriptions-item label="得分" label-class="description-label">
        {{ detailData.score }}
      </el-descriptions-item>
      <el-descriptions-item label="开始时间" label-class="description-label">
        {{ formatDate(detailData.startTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="结束时间" label-class="description-label">
        {{ formatDate(detailData.endTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="持续时间" label-class="description-label">
        {{ detailData.duration }}
      </el-descriptions-item>
      <el-descriptions-item label="IP地址" label-class="description-label">
        {{ detailData.ipAddress }}
      </el-descriptions-item>
      <el-descriptions-item label="设备信息" label-class="description-label">
        {{ detailData.deviceInfo }}
      </el-descriptions-item>
      <el-descriptions-item label="用户反馈" label-class="description-label">
        {{ detailData.feedback || '无' }}
      </el-descriptions-item>
    </el-descriptions>
  </Dialog>
</template>

<script lang="ts" setup>
import { OfficialWebAssessmentLogVO } from '@/api/ow/assessment/log'

const dialogVisible = ref(false)
const detailData = ref({} as OfficialWebAssessmentLogVO)

const formatDate = (timestamp?: number | Date) => {
  if (!timestamp) return '无'; // 如果时间戳或日期不存在，返回默认值
  const date = new Date(timestamp);
  return date.toLocaleString(); // 转换为可读的本地时间格式
};

/** 打开弹窗 */
const open = (data: OfficialWebAssessmentLogVO) => {
  dialogVisible.value = true;

  // 确保 startTime 和 endTime 是有效的时间戳或 Date 对象
  if (data.startTime) {
    data.startTime = new Date(data.startTime);
  }
  if (data.endTime) {
    data.endTime = new Date(data.endTime);
  }
  
  detailData.value = data;
};

defineExpose({ open })
</script>

<style scoped>
.description-label {
  font-weight: bold;
  text-align: right; /* Align the label text to the right */
  padding-right: 10px; /* Add space between label and content */
}

.el-descriptions-item__content {
  text-align: left; /* Align the content to the left */
  font-size: 14px;
  padding: 5px 10px; /* Add padding around the content for spacing */
}

.el-descriptions-item__label {
  padding: 5px 10px; /* Add padding around the labels */
  font-size: 14px;
}

.el-descriptions {
  border: 1px solid #e6e6e6; /* Add a subtle border to separate items */
  padding: 20px;
  background-color: #f9f9f9;
}

.dialog-container {
  padding: 20px;
  background-color: white;
  border-radius: 8px; /* Add rounded corners */
}
</style>
