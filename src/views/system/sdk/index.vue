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
      <!-- SDK名称 -->
      <el-form-item label="渠道名称" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入SDK渠道名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <!-- 状态 -->
      <el-form-item label="SDK类型" prop="sdkType">
        <el-select
          v-model="queryParams.sdkType"
          class="!w-240px"
          clearable
          placeholder="请选择SDK类型"
        >
          <el-option
            v-for="type in getStrDictOptions(DICT_TYPE.SYSTEM_SDK_TYPE)"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </el-form-item>

      <!-- 状态 -->
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          class="!w-240px"
          clearable
          placeholder="请选择状态"
        >
          <el-option
            v-for="status in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="status.value"
            :label="status.label"
            :value="status.value"
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
        <el-button @click="handleQuery" v-hasPermi="['system:sdk:query']">
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
        v-hasPermi="['system:sdk:create']"
        >
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="filteredData" stripe>
      <el-table-column align="center" label="SDK编号" prop="id" />
      <el-table-column align="center" label="SDK名称" prop="name" show-overflow-tooltip />
      <el-table-column align="center" label="SDK AppID" prop="sdkAppId" show-overflow-tooltip />
      <el-table-column label="主配置" align="center" prop="primary">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="scope.row.master" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
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
            :disabled="scope.row.master"
            @click="handleMaster(scope.row.id,scope.row.sdkType)"
            v-hasPermi="['system:sdk:update']"
          >
            主配置
          </el-button>

          <el-button link type="primary" @click="openForm('update', scope.row.id)" v-hasPermi="['system:sdk:update']">
            修改
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)" v-hasPermi="['system:sdk:delete']">
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
  <SDKForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions,getStrDictOptions} from '@/utils/dict';
import { dateFormatter } from '@/utils/formatTime';
import * as SDKApi from '@/api/system/sdk/index';
import SDKForm from './SDKForm.vue';

interface SDKItem {
  id: number;
  name: string;
  sdkAppId: string;
  status: number;
  createTime: Date;
}

const message = useMessage();
const { t } = useI18n() // 国际化
const loading = ref(true);
const total = ref(0);
const list = ref<SDKItem[]>([]);
const filteredData = ref<SDKItem[]>([]);
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
  sdkType: '',
  status: undefined,
  createTime: []
});
const queryFormRef = ref();

const getList = async () => {
  loading.value = true;
  try {
    const data = await SDKApi.getSDKPage(queryParams);
    list.value = data.list;
    total.value = data.total;
    filteredData.value = list.value;
  } finally {
    loading.value = false;
  }
};

/** 主配置按钮操作 */
const handleMaster = async (id,sdkType) => {
  try {
    await message.confirm('是否确认修改编号为"' + id + '"的配置为 ' + sdkType + ' 主配置?')
    await SDKApi.updateSDKMaster(id,sdkType)
    message.success(t('common.updateSuccess'))
    await getList()
  } catch {}
}

const handleQuery = () => {
  queryParams.pageNo = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value.resetFields();
  handleQuery();
};

const formRef = ref();
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id);
};

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm();
    await SDKApi.deleteSDK(id);
    message.success('删除成功');
    getList();
  } catch (error) {
    message.error('删除失败');
  }
};

onMounted(() => {
  getList();
});
</script>
