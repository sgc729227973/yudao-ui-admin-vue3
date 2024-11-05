<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="80%">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="80px">

      <!-- 页面名称和页面编码在同一行 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="页面名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入页面名称" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="页面编码" prop="code">
            <el-input v-model="formData.code" placeholder="请输入页面编码" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="显示菜单" prop="showMenu">
            <el-switch v-model="formData.showMenu" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="显示脚页" prop="showFooter">
            <el-switch v-model="formData.showFooter" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 媒体关联 -->
      <el-form-item label="媒体关联" prop="dynamicMedia" class="media-table">
        <el-table :data="formData.dynamicMedia" style="width: 100%" stripe>
          <!-- 媒体编码列 -->
          <el-table-column label="媒体编码">
            <template #default="scope">
              <el-input v-model="scope.row.media.code" placeholder="请输入媒体编码" />
            </template>
          </el-table-column>

          <!-- 位置列 -->
          <el-table-column label="位置">
            <template #default="scope">
              <el-select v-model="scope.row.position" placeholder="请选择位置">
                <el-option
                  v-for="position in getStrDictOptions(DICT_TYPE.OW_DYNAMIC_PAGE_POSITION)"
                  :key="position.value"
                  :value="position.value"
                  :label="position.label"
                />
              </el-select>
            </template>
          </el-table-column>

          <!-- 排序列 -->
          <el-table-column label="排序">
            <template #default="scope">
              <el-input-number v-model.number="scope.row.order" :min="1" />
            </template>
          </el-table-column>

          <!-- 自定义样式列 -->
          <el-table-column label="自定义样式 (JSON)">
            <template #default="scope">
              <el-input
                v-model="scope.row.customStyle"
                placeholder="请输入自定义样式"
                type="textarea"
              />
            </template>
          </el-table-column>

          <!-- 操作列 -->
          <el-table-column label="操作" width="80">
            <template #default="scope">
              <el-button size="default" type="danger" @click="removeMedia(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 添加媒体按钮 -->
        <el-button type="primary" @click="addMedia">添加媒体</el-button>
      </el-form-item>

    </el-form>
    <!-- 表单按钮 -->
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { DICT_TYPE, getStrDictOptions } from '@/utils/dict';
import { createDynamicPage, updateDynamicPage, getDynamicPageDetail, OfficialWebsiteDynamicPageVO, OfficialWebsiteDynamicPageMediaVO } from '@/api/ow/content/dynamic-page/index'
import { ref, reactive, defineEmits, defineExpose } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载状态
const formType = ref('') // 表单的类型：create - 新增；update - 修改

// 定义表单数据接口
interface DynamicPageFormData {
  id?: number
  name: string
  code: string
  showMenu: boolean
  showFooter: boolean
  dynamicMedia: OfficialWebsiteDynamicPageMediaVO[] // 媒体关联信息
}

const formData = ref<DynamicPageFormData>({
  id: undefined,
  showMenu: true,
  showFooter: true,
  name: '',
  code: '',
  dynamicMedia: []
})

// 表单验证规则
const formRules = reactive({
  name: [{ required: true, message: '页面名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '页面编码不能为空', trigger: 'blur' }],
})

const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()

  if (id) {
    formLoading.value = true
    try {
      const dynamicPage = await getDynamicPageDetail(id) // 获取动态页面详细信息
      formData.value = { ...dynamicPage }
      console.log('动态页面详情:', formData.value)
    } catch (error) {
      console.error('获取动态页面详情失败:', error)
    } finally {
      formLoading.value = false
    }
  }
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗

// 添加媒体
const addMedia = () => {
  formData.value.dynamicMedia.push({
    media: { code: '' },
    position: '',
    order: formData.value.dynamicMedia.length + 1,
    customStyle: undefined
  })
}

// 删除媒体
const removeMedia = (index: number) => {
  formData.value.dynamicMedia.splice(index, 1)
}

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  formLoading.value = true

  try {
    const data: OfficialWebsiteDynamicPageVO = { ...formData.value }

    if (formType.value === 'create') {
      await createDynamicPage(data) // 创建动态页面
      message.success(t('common.createSuccess'))
    } else if (data.id) {
      await updateDynamicPage(data.id, data) // 更新动态页面
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    showMenu: true,
    showFooter: true,
    name: '',
    code: '',
    dynamicMedia: []
  }
  formRef.value?.resetFields()
}
</script>
