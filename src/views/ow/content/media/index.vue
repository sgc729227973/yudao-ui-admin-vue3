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
      <!-- 模版名称 -->
      <el-form-item label="模版名称" prop="htmlName">
        <el-input
          v-model="queryParams.htmlName"
          class="!w-240px"
          clearable
          placeholder="请输入HTML模版名称"
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

      <!-- 操作按钮 -->
      <el-form-item>
        <el-button @click="handleQuery"
        v-hasPermi="['ow:content:media:query']"	
        >
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
      <el-table-column align="center" label="模版名称" prop="htmlName" />
      <el-table-column align="center" label="模版编码" prop="code" width="240px"/>
      <el-table-column label="媒体内容" align="center" prop="fileUrl" width="240px">
        <template #default="{ row }">
          <!-- 判断是否是视频 -->
          <template v-if="isVideo(row.fileUrl)">
            <video
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
      <el-table-column label="封面图片" align="center" prop="coverUrlPreview">
        <template #default="{ row }">
          <el-image
            class="h-80px w-120px"
            lazy
            :src="row.coverUrlPreview"
            :preview-src-list="[row.coverUrlPreview]"
            preview-teleported
            fit="cover"
          />
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
import * as MediaApi from '@/api/ow/content/media/index'
import MediaForm from './MediaForm.vue'

defineOptions({ name: 'MediaList' })

interface MediaItem {
  id: number
  name: string
  code: string
  mediaType: number
  createTime: Date
}

// 判断媒体类型的方法
const isVideo = (fileUrl: string) => {
  const videoExtensions = ['.mp4', '.webm', '.ogg'];
  return videoExtensions.some(ext => fileUrl.toLowerCase().endsWith(ext));
};

// 判断是否为音频文件
const isAudio = (fileUrl: string) => {
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.aac'];
  return audioExtensions.some(ext => fileUrl.toLowerCase().endsWith(ext));
};

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表加载状态
const total = ref(0) // 列表总记录数
const list = ref<MediaItem[]>([]) // 原始表格数据
const filteredData = ref<MediaItem[]>([]) // 过滤后的表格数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
  code: '',
  htmlName: '',
  mediaType: undefined,
  createTime: [] // 创建时间范围
})
const queryFormRef = ref() // 搜索表单引用

/** 获取列表数据 */
const getList = async () => {
  loading.value = true
  try {
    const data = await MediaApi.getMediaList(queryParams)
    list.value = data.list
    total.value = data.total
    filteredData.value = list.value
  } finally {
    loading.value = false
  }
}

/** 搜索操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置搜索表单 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除操作 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await MediaApi.deleteMedia(id)
    message.success(t('common.delSuccess'))
    getList()
  } catch (error) {
    message.error(t('common.delError'))
  }
}


/** 初始化时获取数据 */
onMounted(() => {
  getList()
})
</script>
