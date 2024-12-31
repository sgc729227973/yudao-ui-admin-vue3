<template>
  <el-card shadow="never" class="mb-20">
    <template #header>
      <!-- 关于我们区域标题，右侧显示开关 -->
      <div class="flex justify-between items-center">
        <span>关于我们区域</span>
        <el-switch v-model="aboutSection.show" 
        active-text="显示" 
        inactive-text="隐藏" />
      </div>
    </template>
    <el-form :model="aboutSection" label-width="120px">
      <!-- 标签 -->
      <el-form-item label="标签" prop="tags">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-input
              v-model="tagInput"
              placeholder="输入标签并按回车"
              @keyup.enter="addTag"
              clearable
            />
          </el-col>
          <el-col :span="24" class="mt-2">
            <div>
              <el-tag
                v-for="(tag, index) in aboutSection.tags"
                :key="tag"
                closable
                @close="removeTag(index)"
              >
                {{ tag }}
              </el-tag>
            </div>
          </el-col>
        </el-row>
      </el-form-item>

      <!-- 标题 -->
      <el-form-item label="标题">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-input v-model="aboutSection.title1" placeholder="请输入标题一" />
          </el-col>
          <el-col :span="12">
            <el-input v-model="aboutSection.title2" placeholder="请输入标题二" />
          </el-col>
        </el-row>
      </el-form-item>

      <!-- 副标题 -->
      <el-form-item label="副标题">
        <el-row :gutter="20">
          <el-col :span="24" class="mb-2">
            <el-input v-model="aboutSection.subtitle1" placeholder="请输入副标题部分一" />
          </el-col>
          <el-col :span="24" class="mb-2">
            <el-input v-model="aboutSection.subtitle2" placeholder="请输入副标题部分二" />
          </el-col>
          <el-col :span="24">
            <el-input v-model="aboutSection.subtitle3" placeholder="请输入副标题部分三" />
          </el-col>
        </el-row>
      </el-form-item>

      <!-- 统计数据 -->
      <el-form-item label="统计数据" prop="stats">
        <div>
          <el-table :data="aboutSection.stats" border style="width: 100%">
            <el-table-column label="指标" prop="key" min-width="360">
              <template #default="{ row }">
                <el-input v-model="row.key" placeholder="请输入统计项名称" />
              </template>
            </el-table-column>
            <el-table-column label="值" prop="value" min-width="480">
              <template #default="{ row }">
                <el-input v-model="row.value" placeholder="请输入统计项值" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60" align="center">
              <template #default="{ $index }">
                <el-button type="danger" @click="removeStat($index)" link>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-row justify="center" class="mt-3">
            <el-button type="primary" @click="addStat" round>+ 添加统计项</el-button>
          </el-row>
        </div>
      </el-form-item>

      <!-- 联系方式 -->
      <el-form-item label="个人信息" prop="contacts">
        <div>
          <el-table :data="aboutSection.contacts" border style="width: 100%">
            <el-table-column label="类型" prop="key" min-width="360">
              <template #default="{ row }">
                <el-input v-model="row.key" placeholder="请输入联系方式类型" />
              </template>
            </el-table-column>
            <el-table-column label="内容" prop="value" min-width="480">
              <template #default="{ row }">
                <el-input v-model="row.value" placeholder="请输入联系方式内容" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60" align="center">
              <template #default="{ $index }">
                <el-button type="danger" @click="removeContact($index)" link>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-row justify="center" class="mt-3">
            <el-button type="primary" @click="addContact" round>+ 添加联系方式</el-button>
          </el-row>
        </div>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps } from 'vue';

const props = defineProps<{ modelValue: any }>();
const emit = defineEmits(['update:modelValue']);

const aboutSection = ref<any>({});
const tagInput = ref('');

watch(
  () => props.modelValue,
  (newVal) => {
    aboutSection.value = newVal || {
      show: true,
      tags: [],
      stats: [],
      title1: '',
      title2: '',
      subtitle1: '',
      subtitle2: '',
      subtitle3: '',
      contacts: [],
    };
  },
  { immediate: true }
);

watch(
  () => aboutSection.value,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);

// 标签逻辑
const addTag = () => {
  if (tagInput.value && !aboutSection.value.tags.includes(tagInput.value)) {
    aboutSection.value.tags.push(tagInput.value);
    tagInput.value = '';
  }
};
const removeTag = (index: number) => {
  aboutSection.value.tags.splice(index, 1);
};

// 统计数据逻辑
const addStat = () => {
  aboutSection.value.stats.push({ key: '', value: '' });
};
const removeStat = (index: number) => {
  aboutSection.value.stats.splice(index, 1);
};

// 联系方式逻辑
const addContact = () => {
  aboutSection.value.contacts.push({ key: '', value: '' });
};
const removeContact = (index: number) => {
  aboutSection.value.contacts.splice(index, 1);
};
</script>

<style scoped>
.mb-20 {
  margin-bottom: 20px;
}
.mb-2 {
  margin-bottom: 10px;
}
</style>
