<template>
  <Dialog v-model="dialogVisible"  :scroll="true" title="详情" width="900">
    <el-descriptions :column="3" border>
  <el-descriptions-item label="日志编号" label-class="description-label">
    {{ detailData.id }}
  </el-descriptions-item>
  <el-descriptions-item label="用户编号" label-class="description-label">
    {{ detailData.userId }}
  </el-descriptions-item>
  <el-descriptions-item label="评估编号" label-class="description-label">
    {{ detailData.assessmentId }}
  </el-descriptions-item>
  <el-descriptions-item label="得分" label-class="description-label">
    {{ detailData.score }}
  </el-descriptions-item>
  <el-descriptions-item label="持续时间" label-class="description-label">
    {{ detailData.duration }}
  </el-descriptions-item>
  <el-descriptions-item label="IP地址" label-class="description-label">
    {{ detailData.ipAddress }}
  </el-descriptions-item>
  <el-descriptions-item label="评估时间" label-class="description-label">
    {{ formatDate(detailData.createTime) }}
  </el-descriptions-item>
  <el-descriptions-item label="设备信息" label-class="description-label">
    {{ detailData.deviceInfo || '无' }}
  </el-descriptions-item>

</el-descriptions>


    <el-divider>评估内容</el-divider>

    <el-descriptions :column="1" border>
      <el-descriptions-item label="总分">
        {{ detailData.contents.totalScore }}
      </el-descriptions-item>
      <el-descriptions-item label="风险等级">
        {{ detailData.contents.riskLevel }}
      </el-descriptions-item>
      <el-descriptions-item label="建议">
        {{ detailData.contents.suggestion }}
      </el-descriptions-item>
      <el-descriptions-item label="解释">
        {{ detailData.contents.explanation }}
      </el-descriptions-item>
      <el-descriptions-item label="服务流程">
        <template v-for="step in detailData.contents.servicesProcess.steps" :key="step.step">
          <p><strong>{{ step.step }}:</strong> {{ step.title }} - {{ step.description }}</p>
        </template>
      </el-descriptions-item>
      <el-descriptions-item label="回答">
        <template v-for="answer in detailData.contents.answers" :key="answer.question">
          <p><strong>{{ answer.question }}:</strong> {{ answer.answer }} (得分: {{ answer.score }})</p>
        </template>
      </el-descriptions-item>
    </el-descriptions>
  </Dialog>
</template>

<script lang="ts" setup>
import { OfficialWebAssessmentLogVO } from '@/api/ow/assessment/log';
import { ElDescriptions } from 'element-plus';
import { formatDate } from '@/utils/formatTime'

const dialogVisible = ref(false);
const detailData = ref({} as OfficialWebAssessmentLogVO);

/** 打开弹窗 */
const open = (data: OfficialWebAssessmentLogVO) => {
  dialogVisible.value = true;
  detailData.value = data;
};

defineExpose({ open });
</script>

<style scoped>
.description-label {
  font-weight: bold;
  text-align: right;
  padding-right: 10px;
}

.el-descriptions-item__content {
  font-size: 13px; /* 字体略小 */
  line-height: 1.5; /* 更紧凑的行高 */
  padding: 5px;
}

.el-descriptions {
  margin-top: 10px; /* 增加与上方的间距 */
}

.el-descriptions-item__content {
  text-align: left;
  font-size: 14px;
  padding: 5px 10px;
}

.el-descriptions-item__label {
  padding: 5px 10px;
  font-size: 14px;
}

.el-descriptions {
  border: 1px solid #e6e6e6;
  padding: 20px;
  background-color: #f9f9f9;
}
</style>
