<template>
  <el-card shadow="never" class="mb-20">
    <template #header>
      <!-- 履历区域标题，右侧显示开关 -->
      <div class="flex justify-between items-center">
        <span>履历区域</span>
        <el-switch v-model="resumeSection.show" active-text="显示" inactive-text="隐藏" />
      </div>
    </template>
    <el-form :model="resumeSection" label-width="120px">
      <!-- 标题：教育 -->
      <el-form-item label="教育标题">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-input v-model="resumeSection.titleEducation1" placeholder="请输入教育标题一" />
          </el-col>
          <el-col :span="12">
            <el-input v-model="resumeSection.titleEducation2" placeholder="请输入教育标题二" />
          </el-col>
        </el-row>
      </el-form-item>
      <!-- 教育段落 -->
      <el-form-item label="教育段落" prop="educationParagraph">
        <el-input
          type="textarea"
          v-model="resumeSection.educationParagraph"
          placeholder="请输入教育段落"
        />
      </el-form-item>
      <!-- 教育经历 -->
      <el-form-item label="教育经历" prop="education">
        <el-table :data="resumeSection.education" border style="width: 100%">
          <el-table-column label="学位" min-width="150">
            <template #default="{ row }">
              <el-input v-model="row.degree" placeholder="请输入学位" />
            </template>
          </el-table-column>
          <el-table-column label="时间" min-width="150">
            <template #default="{ row }">
              <el-input v-model="row.duration" placeholder="请输入时间段" />
            </template>
          </el-table-column>
          <el-table-column label="描述" min-width="200">
            <template #default="{ row }">
              <el-input v-model="row.description" placeholder="请输入描述" />
            </template>
          </el-table-column>
          <el-table-column label="机构" min-width="150">
            <template #default="{ row }">
              <el-input v-model="row.institution" placeholder="请输入机构名称" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ $index }">
              <el-button type="danger" @click="removeEducation($index)" link>删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-row justify="center" class="mt-3">
          <el-button type="primary" @click="addEducation" round>+ 添加教育经历</el-button>
        </el-row>
      </el-form-item>
      <!-- 标题：经历 -->
      <el-form-item label="经历标题">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-input v-model="resumeSection.titleExperience1" placeholder="请输入经历标题一" />
          </el-col>
          <el-col :span="12">
            <el-input v-model="resumeSection.titleExperience2" placeholder="请输入经历标题二" />
          </el-col>
        </el-row>
      </el-form-item>
      <!-- 经历段落 -->
      <el-form-item label="经历段落" prop="resumeParagraph">
        <el-input
          type="textarea"
          v-model="resumeSection.resumeParagraph"
          placeholder="请输入经历段落"
        />
      </el-form-item>
      <!-- 工作经历 -->
      <el-form-item label="工作经历" prop="experience">
        <el-table :data="resumeSection.experience" border style="width: 100%">
          <el-table-column label="职位" min-width="150">
            <template #default="{ row }">
              <el-input v-model="row.position" placeholder="请输入职位" />
            </template>
          </el-table-column>
          <el-table-column label="时间" min-width="150">
            <template #default="{ row }">
              <el-input v-model="row.duration" placeholder="请输入时间段" />
            </template>
          </el-table-column>
          <el-table-column label="描述" min-width="200">
            <template #default="{ row }">
              <el-input v-model="row.description" placeholder="请输入描述" />
            </template>
          </el-table-column>
          <el-table-column label="机构" min-width="150">
            <template #default="{ row }">
              <el-input v-model="row.institution" placeholder="请输入机构名称" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ $index }">
              <el-button type="danger" @click="removeExperience($index)" link>删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-row justify="center" class="mt-3">
          <el-button type="primary" @click="addExperience" round>+ 添加工作经历</el-button>
        </el-row>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps } from 'vue';

const props = defineProps<{ modelValue: any }>();
const emit = defineEmits(['update:modelValue']);

const resumeSection = ref<any>({});

watch(
  () => props.modelValue,
  (newVal) => {
    resumeSection.value = newVal || {
      show: true,
      titleEducation1: '',
      titleEducation2: '',
      titleExperience1: '',
      titleExperience2: '',
      educationParagraph: '',
      education: [],
      resumeParagraph: '',
      experience: [],
    };
  },
  { immediate: true }
);

watch(
  () => resumeSection.value,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);

// 添加教育经历
const addEducation = () => {
  resumeSection.value.education.push({
    degree: '',
    duration: '',
    description: '',
    institution: '',
  });
};

// 删除教育经历
const removeEducation = (index: number) => {
  resumeSection.value.education.splice(index, 1);
};

// 添加工作经历
const addExperience = () => {
  resumeSection.value.experience.push({
    position: '',
    duration: '',
    description: '',
    institution: '',
  });
};

// 删除工作经历
const removeExperience = (index: number) => {
  resumeSection.value.experience.splice(index, 1);
};
</script>

<style scoped>
.mb-20 {
  margin-bottom: 20px;
}
.mt-3 {
  margin-top: 15px;
}
</style>
