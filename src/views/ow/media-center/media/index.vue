<template>
  <!-- 搜索栏 -->
  <ContentWrap>
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <!-- 媒体名称 -->
      <el-form-item label="媒体名称" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入媒体名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <!-- 模版编码 -->
      <el-form-item label="模版编码" prop="code">
        <el-input
          v-model="queryParams.code"
          class="!w-240px"
          clearable
          placeholder="请输入模版编码"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="存储器" prop="fileConfigId">
        <el-select v-model="queryParams.fileConfigId" class="!w-240px">
          <el-option
            v-for="config in fileConfigList"
            :key="config.id"
            :label="config.name"
            :value="config.id"
          />
        </el-select>
      </el-form-item>
      <!-- 媒体类型 -->
      <el-form-item label="媒体类型" prop="mediaType">
        <el-select
          v-model="queryParams.mediaType"
          class="!w-240px"
          clearable
          placeholder="请选择媒体类型"
        >
          <el-option
            v-for="type in getIntDictOptions(DICT_TYPE.OW_MEDIA_TYPE)"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </el-form-item>
      <!-- 创建时间范围选择 -->
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <!-- 备注 -->
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="queryParams.remark"
          class="!w-240px"
          clearable
          placeholder="请输入媒体备注"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <!-- 操作按钮 -->
      <el-form-item>
        <el-button @click="handleQuery" v-hasPermi="['ow:content:media:query']">
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
        <el-button
          plain
          type="primary"
          @click="openForm('create')"
          v-hasPermi="['ow:content:media:create']"
        >
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="filteredData" stripe>
      <el-table-column align="center" label="媒体编号" prop="id" />
      <el-table-column align="center" label="媒体名称" prop="name" show-overflow-tooltip />
      <el-table-column align="center" label="模版编码" prop="code" width="240px" />
      <el-table-column label="媒体内容" align="center" prop="fileUrl" width="240px">
        <template #default="{ row }">
          <!-- 判断是否是视频 -->
          <template v-if="isVideo(row.fileUrl)">
            <div v-if="!row.isPlaying" class="video-cover-container" @click="playVideo(row)">
              <el-image
                class="h-160px w-240px"
                lazy
                :src="row.coverUrl"
                :preview-src-list="[row.coverUrl]"
                preview-teleported
                fit="cover"
              />
              <div class="play-button">
                <Icon icon="ep:video-play" :size='40' color="#ffffff" />
              </div>
            </div>
            <video
              v-show="row.isPlaying"
              class="w-240px h-160px"
              controls
              :src="row.fileUrlPreview"
              preload="metadata"
              style="object-fit: cover"
            >
              您的浏览器不支持视频播放。
            </video>
          </template>
          <!-- 判断是否是音频 -->
          <template v-else-if="isAudio(row.fileUrl)">
            <audio controls :src="row.fileUrlPreview" style="width: 100%">
              您的浏览器不支持音频播放。
            </audio>
          </template>
          <!-- 否则显示图片 -->
          <template v-else>
            <el-image
              class="h-80px w-120px"
              lazy
              :src="row.fileUrlPreview"
              :preview-src-list="[row.fileUrlPreview]"
              preview-teleported
              fit="cover"
            />
          </template>
        </template>
      </el-table-column>
      <el-table-column align="center" label="媒体类型" prop="mediaType">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.OW_MEDIA_TYPE" :value="scope.row.mediaType" />
        </template>
      </el-table-column>
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="创建时间"
        prop="createTime"
        width="180"
      />
      <el-table-column align="center" label="操作">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['ow:content:media:update']"
          >
            修改
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['ow:content:media:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <MediaForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as MediaApi from '@/api/ow/media-center/media/index'
import MediaForm from './MediaForm.vue'
import { getSimpleFileConfigList } from '@/api/infra/fileConfig';

defineOptions({ name: 'MediaList' })
interface fileConfigList {
  id: number;
  name: string;
}

interface MediaItem {
  id: number
  name: string
  code: string
  remark: string
  fileConfigId: number
  mediaType: number
  createTime: Date
  fileUrl: string
  fileUrlPreview: string
  coverUrl: string
  isPlaying?: boolean // 是否正在播放视频
}

const fileConfigList = ref<fileConfigList[]>([]);
const isVideo = (fileUrl: string) => ['.mp4', '.webm', '.ogg'].some(ext => fileUrl.toLowerCase().endsWith(ext));
const isAudio = (fileUrl: string) => ['.mp3', '.wav', '.ogg', '.flac', '.aac'].some(ext => fileUrl.toLowerCase().endsWith(ext));

const message = useMessage()
const { t } = useI18n()
const loading = ref(true)
const total = ref(0)
const list = ref<MediaItem[]>([])
const filteredData = ref<MediaItem[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
  remark: '',
  code: '',
  mediaType: undefined,
  fileConfigId: undefined,
  createTime: []
});
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await MediaApi.getMediaList(queryParams)
    list.value = data.list.map(item => ({ ...item, isPlaying: false }))
    total.value = data.total
    filteredData.value = list.value
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

const playVideo = (row: MediaItem) => {
  row.isPlaying = true
}

const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await MediaApi.deleteMedia(id)
    message.success(t('common.delSuccess'))
    getList()
  } catch {
    message.error(t('common.delError'))
  }
}

const loadFileConifgList = async () => {
  try {
    const data = await getSimpleFileConfigList()
    fileConfigList.value = data
  } catch {
    console.error('加载文件配置列表失败')
  }
}

onMounted(async () => {
  await loadFileConifgList()
  getList()
});
</script>

<style scoped>
.video-cover-container {
  position: relative;
  cursor: pointer;
  display: inline-block;
}
.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  padding: 10px;
}
.play-button:hover {
  background: rgba(0, 0, 0, 0.8);
}
</style>
