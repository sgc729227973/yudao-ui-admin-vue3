<template>
  <el-select v-model="account.id" placeholder="请选择公众号" class="!w-240px" @change="onChanged">
    <el-option v-for="item in accountList" :key="item.id" :label="item.name" :value="item.id" />
  </el-select>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import * as MpAccountApi from '@/api/mp/account'

defineOptions({ name: 'WxAccountSelect' })

const account = reactive({
  id: null as number | null,  // 设置初始值为 null
  name: ''
})

const accountList = ref<MpAccountApi.AccountVO[]>([])

const emit = defineEmits<{
  (e: 'change', id: number | null, name: string): void
}>()

// 获取公众号列表
const handleQuery = async () => {
  accountList.value = await MpAccountApi.getSimpleAccountList()
  
  // 默认选中第一个公众号，如果有数据，否则保持 null
  if (accountList.value.length > 0) {
    account.id = accountList.value[0].id
    account.name = accountList.value[0].name
    emit('change', account.id, account.name)
  } else {
    account.id = null  // 没有公众号时保持为 null
    account.name = ''
    emit('change', account.id, account.name)  // 通知父组件账号为空
  }
}

// 处理账号变更
const onChanged = (id: number | null) => {
  const found = accountList.value.find((v) => v.id === id)
  if (found) {
    account.name = found.name
    emit('change', account.id, account.name)
  }
}

// 初始化获取公众号列表
onMounted(() => {
  handleQuery()
})
</script>
