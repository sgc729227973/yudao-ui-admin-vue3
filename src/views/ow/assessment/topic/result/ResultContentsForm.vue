<template>
  <div>
    <!-- 主表格 -->
    <el-table :data="riskLevels" border style="width: 100%">
      <el-table-column label="序号" type="index" width="50" align="center" />
      <el-table-column label="最小分数" width="200">
        <template #default="{ row }">
          <el-input-number v-model="row.minScore" :min="0" />
        </template>
      </el-table-column>
      <el-table-column label="最大分数" width="200">
        <template #default="{ row }">
          <el-input-number v-model="row.maxScore" :min="0" />
        </template>
      </el-table-column>
      <el-table-column label="风险级别" width="150">
        <template #default="{ row }">
          <el-input v-model="row.riskLevel" placeholder="请输入风险级别" />
        </template>
      </el-table-column>
      <el-table-column label="结果解释" min-width="300">
        <template #default="{ row }">
          <el-input v-model="row.explanation" placeholder="请输入结果解释" type="textarea" />
        </template>
      </el-table-column>
      <el-table-column label="建议" min-width="300">
        <template #default="{ row }">
          <el-input v-model="row.suggestion" placeholder="请输入建议" type="textarea" />
        </template>
      </el-table-column>
      <el-table-column label="媒体图片" min-width="300">
        <template #default="{ row }">
          <el-input v-model="row.fileUrl" placeholder="请输入媒体图片链接"/>
        </template>
      </el-table-column>
      <el-table-column label="右侧按钮文本" min-width="300">
        <template #default="{ row }">
          <el-input v-model="row.appointmentBtnText" placeholder="请输入右侧按钮文本"/>
        </template>
      </el-table-column>
      <el-table-column label="右侧按钮链接" min-width="300">
        <template #default="{ row }">
          <el-input v-model="row.appointmentUrl" placeholder="请输入右侧按钮链接"/>
        </template>
      </el-table-column>
      <el-table-column label="左侧按钮文本" min-width="300">
        <template #default="{ row }">
          <el-input v-model="row.linkBtnText" placeholder="请输入左侧按钮文本"/>
        </template>
      </el-table-column>
      <el-table-column label="左侧按钮链接" min-width="300">
        <template #default="{ row }">
          <el-input v-model="row.linkUrl" placeholder="请输入左侧按钮链接"/>
        </template>
      </el-table-column>
      <el-table-column label="服务流程" width="200" align="center">
        <template #default="{ row }">
          <el-button @click="openServiceDialog(row)" type="primary">编辑服务步骤</el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="60" align="center">
        <template #default="{ $index }">
          <el-button type="danger" @click="removeRiskLevel($index)" link>删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-row justify="center" class="mt-3">
      <el-button @click="addRiskLevel" round>+ 添加结果</el-button>
    </el-row>

    <!-- 服务步骤弹窗 -->
    <el-dialog v-model="serviceDialogVisible" title="编辑服务流程" width="600px">
      <div>
        <el-input v-model="currentService.title" placeholder="流程标题" />
        <el-input v-model="currentService.description" placeholder="流程描述" type="textarea" style="margin: 10px 0" />
        <el-input v-model="currentService.howItWorks" placeholder="流程概述" />

        <el-table :data="currentService.steps" style="margin-top: 10px;" border>
          <el-table-column label="步骤编号" width="100">
            <template #default="{ row: step }">
              <el-input v-model="step.step" placeholder="步骤编号" />
            </template>
          </el-table-column>
          <el-table-column label="标题" width="150">
            <template #default="{ row: step }">
              <el-input v-model="step.title" placeholder="步骤标题" />
            </template>
          </el-table-column>
          <el-table-column label="描述" min-width="300">
            <template #default="{ row: step }">
              <el-input v-model="step.description" placeholder="步骤描述" type="textarea" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="60" align="center">
            <template #default="{ $index }">
              <el-button type="danger" @click="removeStep($index)" link>删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-button type="primary" @click="addStep" round style="margin-top: 10px;">
          + 添加步骤
        </el-button>
      </div>
      <template #footer>
        <el-button @click="serviceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveServiceProcess">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps } from 'vue';
import { RiskLevel, AssessmentServiceProcessStep } from '@/api/ow/assessment/topic';

const props = defineProps<{ modelValue: RiskLevel[] }>();
const emit = defineEmits(['update:modelValue']);

const riskLevels = ref<RiskLevel[]>([]);
const serviceDialogVisible = ref(false);
const currentService = ref({
  title: '',
  description: '',
  howItWorks: '',
  steps: [] as AssessmentServiceProcessStep[],
});
let currentRow: RiskLevel | null = null;

watch(
  () => props.modelValue,
  (newVal) => {
    riskLevels.value = newVal;
  },
  { immediate: true }
);

watch(
  () => riskLevels.value,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);

const addRiskLevel = () => {
  riskLevels.value.push({
    fileUrl: '',
    linkUrl: '',
    maxScore: 0,
    minScore: 0,
    riskLevel: '',
    suggestion: '',
    explanation: '',
    linkBtnText: '',
    appointmentUrl: '',
    servicesProcess: {
      steps: [],
      title: '',
      description: '',
      howItWorks: '',
    },
    appointmentBtnText: '',
  });
};

const removeRiskLevel = (index: number) => {
  riskLevels.value.splice(index, 1);
};

const openServiceDialog = (row: RiskLevel) => {
  currentRow = row;
  serviceDialogVisible.value = true;

  // 提供默认值，确保类型一致
  currentService.value = {
    title: row.servicesProcess?.title || '',
    description: row.servicesProcess?.description || '',
    howItWorks: row.servicesProcess?.howItWorks || '',
    steps: row.servicesProcess?.steps?.map(step => ({
      step: step.step || '',
      title: step.title || '',
      description: step.description || '',
    })) || [],
  };
};

const saveServiceProcess = () => {
  if (currentRow) {
    currentRow.servicesProcess = { ...currentService.value };
  }
  serviceDialogVisible.value = false;
};

const addStep = () => {
  currentService.value.steps.push({
    step: '',
    title: '',
    description: '',
  });
};

const removeStep = (index: number) => {
  currentService.value.steps.splice(index, 1);
};
</script>

<style scoped>
.mt-3 {
  margin-top: 15px;
}
</style>
