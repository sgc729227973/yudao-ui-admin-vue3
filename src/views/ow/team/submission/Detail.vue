<template>
  <Dialog v-model="dialogVisible" title="联系提交详情" width="800">
    <div class="content-container">
      <!-- 基础信息 -->
      <h3 class="section-title">基础信息</h3>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="提交编号">
          {{ detailData.id }}
        </el-descriptions-item>
        <el-descriptions-item label="提交人姓名">
          {{ detailData.name }}
        </el-descriptions-item>
        <el-descriptions-item label="电子邮件">
          {{ detailData.email }}
        </el-descriptions-item>
        <el-descriptions-item label="电话">
          {{ detailData.phoneNumber }}
        </el-descriptions-item>
        <el-descriptions-item label="消息主题">
          {{ detailData.msgSubject }}
        </el-descriptions-item>
        <!-- 媒体类型 -->
        <el-descriptions-item label="状态" prop="status">
          <dict-tag :type="DICT_TYPE.OW_SUBMISSION_STATUS" :value="detailData.status" />
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">
          {{ formatDate(detailData.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="目标人">
          {{ detailData.ownerName }}
        </el-descriptions-item>
        <el-descriptions-item label="留言内容">
          <div class="message-container">{{ detailData.message }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { OfficialWebContactSubmissionVO } from '@/api/ow/team/submission';
import { DICT_TYPE } from '@/utils/dict';

const dialogVisible = ref(false);
const detailData = ref({} as OfficialWebContactSubmissionVO & { ownerName?: string });

/** 格式化时间 */
const formatDate = (timestamp?: number) => {
  if (!timestamp) return '无';
  const date = new Date(timestamp);
  return date.toLocaleString();
};

/** 打开详情弹窗 */
const open = (data: OfficialWebContactSubmissionVO & { ownerName?: string }) => {
  dialogVisible.value = true;
  detailData.value = data;
};

defineExpose({ open });
</script>
