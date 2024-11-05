<template>
  <Dialog v-model="dialogVisible" :max-height="500" :scroll="true" title="详情" width="800">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="日志编号" label-class="description-label" width="1">
        {{ detailData.id }}
      </el-descriptions-item>
      <el-descriptions-item label="用户编号" label-class="description-label">
        {{ detailData.userId }}
      </el-descriptions-item>
      <el-descriptions-item label="用户OpenID" label-class="description-label">
        {{ detailData.openid }}
      </el-descriptions-item>
      <el-descriptions-item label="微信公众号ID" label-class="description-label">
        {{ detailData.accountId }}
      </el-descriptions-item>
      <el-descriptions-item label="公众号名称" label-class="description-label">
        {{ accountName }}
      </el-descriptions-item>            
      <el-descriptions-item label="追踪链路ID" label-class="description-label">
        {{ detailData.trackId }}
      </el-descriptions-item>      
      <el-descriptions-item label="成分" label-class="description-label">
        {{ detailData.ingredientNames }}
      </el-descriptions-item>
      <el-descriptions-item label="成分ID" label-class="description-label">
        {{ detailData.ingredientIds.join(', ') }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间" label-class="description-label">
        {{ formatDate(detailData.createTime) }}
      </el-descriptions-item>
    </el-descriptions>
  </Dialog>
</template>

<script lang="ts" setup>
import { MpFunctionLogVO } from '@/api/mp/function/additive/log'
import * as AccountApi from '@/api/mp/account/index'

const dialogVisible = ref(false)
const detailData = ref({} as MpFunctionLogVO)
const accountName = ref<string>('') // 存储公众号名称

const formatDate = (timestamp?: number | Date) => {
  if (!timestamp) return '无'; // 如果时间戳或日期不存在，返回默认值
  const date = new Date(timestamp);
  return date.toLocaleString(); // 转换为可读的本地时间格式
};

/** 打开弹窗 */
const open = async (data: MpFunctionLogVO) => {
  dialogVisible.value = true;

  // 确保 createTime 是有效的时间戳或 Date 对象
  if (data.createTime) {
    data.createTime = new Date(data.createTime);
  }
  
  detailData.value = data;

  // 获取公众号名称
  if (data.accountId) {
    try {
      const response = await AccountApi.getAccount(data.accountId);
      if (response) {
        accountName.value = response.name; // 从响应中获取公众号名称
      }
    } catch (error) {
      accountName.value = '未知';
    }
  } else {
    accountName.value = '无';
  }
};

defineExpose({ open })
</script>

<style scoped>
.description-label {
  font-weight: bold;
  text-align: right; /* Align the label text to the right */
  padding-right: 10px; /* Add space between label and content */
}

.el-descriptions-item__content {
  text-align: left; /* Align the content to the left */
  font-size: 14px;
  padding: 5px 10px; /* Add padding around the content for spacing */
}

.el-descriptions-item__label {
  padding: 5px 10px; /* Add padding around the labels */
  font-size: 14px;
}

.el-descriptions {
  border: 1px solid #e6e6e6; /* Add a subtle border to separate items */
  padding: 20px;
  background-color: #f9f9f9;
}

.dialog-container {
  padding: 20px;
  background-color: white;
  border-radius: 8px; /* Add rounded corners */
}
</style>
