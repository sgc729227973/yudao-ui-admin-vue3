<template>
  <div>
    <!-- 1. 封面 URL -->
    <el-form-item label="封面 URL" class="mb-20">
      <el-input
        v-model="contents.coverUrl.fileUrl"
        placeholder="请输入封面 URL"
        clearable
      />
    </el-form-item>

    <!-- 2. 页面标题 -->
    <el-form-item label="页面标题" class="mb-20">
      <el-input
        v-model="contents.pageTitle"
        placeholder="请输入页面标题"
        clearable
      />
    </el-form-item>

    <!-- 4. 墙面内容 WallSection -->
    <el-card shadow="never" class="mb-20">
      <template #header>墙面内容（WallSection）</template>
      <el-table :data="contents.wallSection" border style="width: 100%">
        <el-table-column label="序号" type="index" width="50" align="center" />
        <el-table-column label="标题" min-width="120">
          <template #default="{ row }">
            <el-input v-model="row.title" placeholder="请输入标题" />
          </template>
        </el-table-column>
        <el-table-column label="文件 URL" min-width="200">
          <template #default="{ row }">
            <el-input v-model="row.fileUrl" placeholder="请输入文件 URL" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ $index }">
            <el-button type="danger" @click="removeWallItem($index)" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-row justify="center" class="mt-3">
        <el-button @click="addWallItem" round>+ 添加内容</el-button>
      </el-row>
    </el-card>

    <!-- 5. 项目信息 ProjectInfoSection -->
    <el-card shadow="never" class="mb-20">
      <template #header>项目信息（ProjectInfoSection）</template>
      <el-table :data="contents.projectInfoSection" border style="width: 100%">
        <el-table-column label="序号" type="index" width="50" align="center" />
        <el-table-column label="标签" min-width="120">
          <template #default="{ row }">
            <el-input v-model="row.label" placeholder="请输入标签" />
          </template>
        </el-table-column>
        <el-table-column label="值" min-width="200">
          <template #default="{ row }">
            <el-input v-model="row.value" placeholder="请输入值" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ $index }">
            <el-button type="danger" @click="removeProjectInfo($index)" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-row justify="center" class="mt-3">
        <el-button @click="addProjectInfo" round>+ 添加项目信息</el-button>
      </el-row>
    </el-card>

    <!-- 6. 动态内容 DynamicContent -->
    <el-card shadow="never" class="mb-20">
      <template #header>动态内容（DynamicContent）</template>
      <el-table :data="contents.dynamicContent" border stripe>
        <!-- sort -->
        <el-table-column label="排序" width="180">
          <template #default="scope">
            <el-input-number v-model="scope.row.sort" :min="1" @change="sortDynamicContent" />
          </template>
        </el-table-column>
        <!-- type -->
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            <el-select v-model="scope.row.type" placeholder="选择类型">
              <el-option label="文本" value="content" />
              <el-option label="图片" value="image" />
              <el-option label="视频" value="video" />
              <el-option label="音频" value="audio" />
              <el-option label="超链接" value="link" />
            </el-select>
          </template>
        </el-table-column>
        <!-- 数据内容 -->
        <el-table-column label="数据" min-width="400">
          <template #default="scope">
            <div v-if="scope.row.type === 'content'">
              <el-input
                type="textarea"
                v-model="scope.row.data.text"
                placeholder="文本内容"
              />
            </div>
            <div v-else-if="scope.row.type === 'image'">
              <el-input v-model="scope.row.data.fileUrl" placeholder="图片URL" class="mb-2" />
              <el-input v-model="scope.row.data.description" placeholder="图片描述" class="mb-2" />
              <el-input v-model="scope.row.data.imageLinkUrl" placeholder="图片跳转链接" />
            </div>
            <div v-else-if="scope.row.type === 'video'">
              <el-input v-model="scope.row.data.fileUrl" placeholder="视频URL" class="mb-2" />
              <el-input v-model="scope.row.data.coverUrl.fileUrl" placeholder="封面URL" />
            </div>
            <div v-else-if="scope.row.type === 'audio'">
              <el-input v-model="scope.row.data.fileUrl" placeholder="音频URL" />
            </div>
            <div v-else-if="scope.row.type === 'link'">
              <el-input v-model="scope.row.data.linkText" placeholder="链接文字" class="mb-2" />
              <el-input v-model="scope.row.data.linkUrl" placeholder="超链接地址" />
            </div>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ $index }">
            <el-button type="danger" @click="removeDynamicItem($index)" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-row justify="center" class="mt-3">
        <el-button type="primary" @click="addDynamicItem" round>+ 添加内容</el-button>
      </el-row>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps, defineEmits } from 'vue'

/** 定义 contents 的数据结构 */
interface WallItem {
  title: string;
  fileUrl: string;
}
interface ProjectInfo {
  label: string;
  value: string;
}
interface DynamicContentItem {
  sort: number;
  type: string;
  data: Record<string, any>;
}

interface PageTitleThree {
  header: string;
  infoColumn: { title: string };
  contentColumn: { text: string; title: string };
}

/** contents 结构 */
interface Contents {
  coverUrl: { fileUrl: string };
  pageTitle: string;
  pageTitleThree: PageTitleThree;
  wallSection: WallItem[];
  projectInfoSection: ProjectInfo[];
  dynamicContent: DynamicContentItem[];
}

const props = defineProps<{ modelValue: Partial<Contents> | Contents }>()
const emit = defineEmits(['update:modelValue'])

/** 初始化默认值 */
function initContents(data: Partial<Contents>): Contents {
  return {
    coverUrl: data.coverUrl || { fileUrl: '' },
    pageTitle: data.pageTitle || '',
    pageTitleThree: data.pageTitleThree || {
      header: '',
      infoColumn: { title: '' },
      contentColumn: { text: '', title: '' }
    },
    wallSection: data.wallSection || [],
    projectInfoSection: data.projectInfoSection || [],
    dynamicContent: data.dynamicContent || []
  };
}

/** 响应式 contents */
const contents = ref<Contents>(initContents(props.modelValue || {}))

// 监听父组件传入的 modelValue
watch(
  () => props.modelValue,
  (newVal) => {
    contents.value = initContents(newVal || {})
  },
  { deep: true, immediate: true }
)

// 监听 contents => emit 回父组件
let isUpdating = false
watch(
  () => contents.value,
  (val) => {
    if (isUpdating) return
    isUpdating = true
    emit('update:modelValue', JSON.parse(JSON.stringify(val)))
    setTimeout(() => {
      isUpdating = false
    }, 0)
  },
  { deep: true }
)

/** 方法：墙面内容 */
function addWallItem() {
  contents.value.wallSection.push({
    title: '',
    fileUrl: ''
  })
}
function removeWallItem(index: number) {
  contents.value.wallSection.splice(index, 1)
}

/** 方法：项目信息 */
function addProjectInfo() {
  contents.value.projectInfoSection.push({
    label: '',
    value: ''
  })
}
function removeProjectInfo(index: number) {
  contents.value.projectInfoSection.splice(index, 1)
}

/** 方法：动态内容管理 */
function addDynamicItem() {
  contents.value.dynamicContent.push({
    sort: contents.value.dynamicContent.length + 1,
    type: 'content', // 默认类型
    data: {
      text: '',
      fileUrl: '', // 初始化文件URL
      coverUrl: { fileUrl: '' } // 初始化封面URL
    }
  });
}
function removeDynamicItem(index: number) {
  contents.value.dynamicContent.splice(index, 1)
  contents.value.dynamicContent.forEach((item, idx) => {
    item.sort = idx + 1
  })
}
/** 根据sort重新排序 */
function sortDynamicContent() {
  contents.value.dynamicContent.sort((a, b) => a.sort - b.sort)
}
</script>

<style scoped>
.mb-20 {
  margin-bottom: 20px;
}
.mt-3 {
  margin-top: 15px;
}
</style>
