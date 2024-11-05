<template>
  <div>
    <div class="select-item2" v-if="reply.url">
      <p class="item-name">{{ reply.name }}</p>
      <el-row class="ope-row" justify="center">
        <WxVoicePlayer :url="reply.url" />
      </el-row>
      <el-row class="ope-row" justify="center">
        <el-button type="danger" circle @click="onDelete"><Icon icon="ep:delete" /></el-button>
      </el-row>
    </div>
    <el-row v-else style="text-align: center">
      <!-- 选择素材 -->
      <el-col :span="12" class="col-select">
        <el-button type="success" @click="showDialog = true">
          素材库选择<Icon icon="ep:circle-check" />
        </el-button>
        <el-dialog
          title="选择语音"
          v-model="showDialog"
          width="90%"
          append-to-body
          destroy-on-close
        >
          <WxMaterialSelect
            type="voice"
            :account-id="reply.accountId"
            @select-material="selectMaterial"
          />
        </el-dialog>
      </el-col>
      <!-- 文件上传 -->
      <el-col :span="12" class="col-add">
        <el-upload
          :action="UPLOAD_URL"
          :headers="HEADERS"
          multiple
          :limit="1"
          :file-list="fileList"
          :data="uploadData"
          :before-upload="beforeVoiceUpload"
          :on-success="onUploadSuccess"
        >
          <el-button type="primary">点击上传</el-button>
          <template #tip>
            <div class="el-upload__tip">
              格式支持 mp3/wma/wav/amr，文件大小不超过 2M，播放长度不超过 60s。临时素材格式仅支持 mp3/amr。
            </div>
          </template>
        </el-upload>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { watch, ref, reactive, computed } from 'vue'
import WxMaterialSelect from '@/views/mp/components/wx-material-select'
import WxVoicePlayer from '@/views/mp/components/wx-voice-play'
import { UploadType, useBeforeUpload } from '@/views/mp/hooks/useUpload'
import type { UploadRawFile } from 'element-plus'
import { getAccessToken } from '@/utils/auth'
import { Reply } from './types'
const message = useMessage()

const UPLOAD_URL = import.meta.env.VITE_DJANGO_BASE_URL + '/admin-api/mp/material/upload-temporary'
const HEADERS = { Authorization: 'Bearer ' + getAccessToken() } // 设置上传的请求头部

const props = defineProps<{
  modelValue: Reply
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: Reply)
}>()
const reply = computed<Reply>({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const showDialog = ref(false)
const fileList = ref([])
const uploadData = reactive({
  accountId: reply.value.accountId,
  type: 'voice',
  title: '',
  introduction: ''
})

// 监听 reply 变化并更新 uploadData 的 accountId
watch(() => reply.value.accountId, (newVal) => {
  uploadData.accountId = newVal
})

const convertFileToUploadRawFile = (file: File): UploadRawFile => {
  const uid = Date.now();
  const rawFile = {
    ...file,
    uid,
    lastModified: file.lastModified,
    name: file.name,
    size: file.size,
    type: file.type,
    webkitRelativePath: file.webkitRelativePath
  }
  return rawFile as UploadRawFile;
}

const beforeVoiceUpload = (rawFile: UploadRawFile) => {
  console.log('文件类型:', rawFile.type || '未检测到类型');
  console.log('文件名称:', rawFile.name);

  const isAmr = rawFile.type === 'audio/amr' || rawFile.name.endsWith('.amr');
  const isMp3 = rawFile.type === 'audio/mpeg' || rawFile.name.endsWith('.mp3');
  if (!isAmr && !isMp3) {
    message.error('仅支持mp3/amr格式的音频文件');
    return false;
  }

  if (!rawFile.type) {
    if (rawFile.name.endsWith('.amr')) {
      rawFile = convertFileToUploadRawFile(new File([rawFile], rawFile.name, { type: 'audio/amr' }));
    } else if (rawFile.name.endsWith('.mp3')) {
      rawFile = convertFileToUploadRawFile(new File([rawFile], rawFile.name, { type: 'audio/mpeg' }));
    }
  }

  return useBeforeUpload(UploadType.Voice, 10)(rawFile);
}

const onUploadSuccess = (res: any) => {
  if (res.code !== 0) {
    message.error('上传出错：' + res.msg)
    return false
  }

  // 清空上传时的各种数据
  fileList.value = []
  uploadData.title = ''
  uploadData.introduction = ''

  // 上传好的文件，本质是个素材，所以可以进行选中
  selectMaterial(res.data)
}

const onDelete = () => {
  reply.value.mediaId = null
  reply.value.url = null
  reply.value.name = null
}

const selectMaterial = (item: Reply) => {
  showDialog.value = false

  reply.value.mediaId = item.mediaId
  reply.value.url = item.url
  reply.value.name = item.name
}
</script>

<style lang="scss" scoped>
.select-item2 {
  padding: 10px;
  margin: 0 auto 10px;
  border: 1px solid #eaeaea;

  .item-name {
    overflow: hidden;
    font-size: 12px;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;

    .ope-row {
      width: 100%;
      padding-top: 10px;
      text-align: center;
    }
  }

  .col-select {
    width: 49.5%;
    height: 160px;
    padding: 50px 0;
    border: 1px solid rgb(234 234 234);
  }

  .col-add {
    float: right;
    width: 49.5%;
    height: 160px;
    padding: 50px 0;
    border: 1px solid rgb(234 234 234);

    .el-upload__tip {
      line-height: 18px;
      text-align: center;
    }
  }
}
</style>
