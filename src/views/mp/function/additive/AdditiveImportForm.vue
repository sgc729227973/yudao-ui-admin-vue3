<template>
  <Dialog v-model="dialogVisible" title="食品添加剂导入" width="400">
    <div class="flex items-center my-10px">
      <span class="mr-10px">负责人</span>
      <el-select v-model="ownerUserId" class="!w-240px" clearable>
        <el-option
          v-for="item in userOptions"
          :key="item.id"
          :label="item.nickname"
          :value="item.id"
        />
      </el-select>
    </div>
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :auto-upload="false"
      :disabled="formLoading"
      :limit="1"
      :on-exceed="handleExceed"
      accept=".xlsx, .xls"
      action="none"
      drag
    >
      <Icon icon="ep:upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip text-center">
          <div class="el-upload__tip">
            <el-checkbox v-model="updateSupport" />
            是否更新已经存在的添加剂数据（“名称”重复）
          </div>
          <span>仅允许导入 xls、xlsx 格式文件。</span>
          <el-link
            :underline="false"
            style="font-size: 12px; vertical-align: baseline"
            type="primary"
            @click="importTemplate"
          >
            下载模板
          </el-link>
        </div>
      </template>
    </el-upload>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import * as AdditiveApi from '@/api/mp/function/additive/index'
import download from '@/utils/download'
import type { UploadUserFile } from 'element-plus'
import * as UserApi from '@/api/system/user'
import { useUserStore } from '@/store/modules/user'

const message = useMessage()

const dialogVisible = ref(false) // 弹窗是否展示
const formLoading = ref(false) // 表单加载中
const uploadRef = ref()
const fileList = ref<UploadUserFile[]>([]) // 上传文件列表
const updateSupport = ref(false) // 是否更新已存在的数据
const ownerUserId = ref<undefined | number>() // 负责人
const userOptions = ref<UserApi.UserVO[]>([]) // 用户列表

/** 打开弹窗 */
const open = async () => {
  dialogVisible.value = true
  await resetForm()
  // 加载用户列表
  userOptions.value = await UserApi.getSimpleUserList()
  ownerUserId.value = useUserStore().getUser.id
}
defineExpose({ open }) // 提供 open 方法

/** 提交表单 */
const submitForm = async () => {
  if (fileList.value.length === 0) {
    message.error('请上传文件')
    return
  }

  formLoading.value = true
  try {
    const formData = new FormData()
    formData.append('updateSupport', String(updateSupport.value))
    formData.append('file', fileList.value[0].raw as Blob)
    formData.append('ownerUserId', String(ownerUserId.value))
    const res = await AdditiveApi.handleImport(formData)
    handleSuccess(res)
  } catch {
    handleError()
  } finally {
    formLoading.value = false
  }
}

/** 文件上传成功处理 */
const emits = defineEmits(['success'])
const handleSuccess = (response: any) => {
  if (response.code !== 0) {
    message.error(response.msg)
    formLoading.value = false
    return
  }
  const data = response.data
  let text = `上传成功数量：${data.createAdditiveNames.length}; `
  data.createAdditiveNames.forEach((name: string) => {
    text += `< ${name} >`
  })
  text += `更新成功数量：${data.updateAdditiveNames.length}; `
  data.updateAdditiveNames.forEach((name: string) => {
    text += `< ${name} >`
  })
  text += `更新失败数量：${Object.keys(data.failureAdditiveNames).length}; `
  for (const name in data.failureAdditiveNames) {
    text += `< ${name}: ${data.failureAdditiveNames[name]} >`
  }
  message.alert(text)
  formLoading.value = false
  dialogVisible.value = false
  emits('success')
}

/** 上传失败处理 */
const handleError = () => {
  message.error('上传失败，请重新上传！')
  formLoading.value = false
}

/** 重置表单 */
const resetForm = async () => {
  fileList.value = []
  updateSupport.value = false
  ownerUserId.value = undefined
  await nextTick()
  uploadRef.value?.clearFiles()
}

/** 文件数量超出提示 */
const handleExceed = () => {
  message.error('最多只能上传一个文件！')
}

/** 下载模板操作 */
const importTemplate = async () => {
  const res = await AdditiveApi.importTemplate()
  download.excel(res, '食品添加剂导入模版.xls')
}
</script>

<style scoped>
.el-upload__tip {
  text-align: center;
}
</style>
