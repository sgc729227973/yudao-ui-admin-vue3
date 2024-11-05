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
      <!-- 菜单名称 -->
      <el-form-item label="菜单名称" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入菜单名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <!-- 顶级菜单目录 -->
      <el-form-item label="顶级目录" prop="parent">
        <el-select
          v-model="queryParams.parent"
          class="!w-240px"
          clearable
          placeholder="请选择顶级菜单目录"
        >
          <el-option
            v-for="menu in topMenus"
            :key="menu.id"
            :label="menu.name"
            :value="menu.id"
          />
        </el-select>
      </el-form-item>

      <!-- 菜单类型 -->
      <el-form-item label="菜单类型" prop="type">
        <el-select
          v-model="queryParams.type"
          class="!w-240px"
          clearable
          placeholder="请选择菜单类型"
        >
          <el-option
            v-for="type in getIntDictOptions(DICT_TYPE.SYSTEM_MENU_TYPE)"
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
        <el-button @click="handleQuery"
        v-hasPermi="['ow:menu:query']"	
        >
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
        <el-button plain type="primary" @click="openForm('create')"
        v-hasPermi="['ow:menu:create']"	
        >
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="filteredData" stripe>
      <el-table-column align="center" label="菜单编号" prop="id" />
      <el-table-column align="center" label="菜单名称" prop="name" show-overflow-tooltip />
      <el-table-column align="center" label="菜单路径" prop="path" show-overflow-tooltip />
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
          <el-button link type="primary" @click="openForm('update', scope.row.id)"
          v-hasPermi="['ow:menu:update']"	
          >
            修改
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)"
          v-hasPermi="['ow:menu:delete']"	
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页保持不变 -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <MenuForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict';
import { dateFormatter } from '@/utils/formatTime';
import * as MenuApi from '@/api/ow/menu/index';
import MenuForm from './MenuForm.vue';
import { getSimpleMenuList } from '@/api/ow/menu/index';

defineOptions({ name: 'MenuList' });

interface MenuItem {
  id: number;
  name: string;
  code: string;
  status: number;
  createTime: Date;
}

const message = useMessage();
const { t } = useI18n();

const loading = ref(true);
const total = ref(0);
const list = ref<MenuItem[]>([]);
const filteredData = ref<MenuItem[]>([]);
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
  parent: undefined,  // 添加了父菜单ID作为过滤参数
  type: undefined,
  status: undefined,
  createTime: []
});
const queryFormRef = ref();

interface MenuItem {
  id: number;
  name: string;
}

const topMenus = ref<MenuItem[]>([]); // 用于存储顶级菜单的列表

// 获取顶级菜单列表
const getTopMenuList = async () => {
  try {
    const data = await getSimpleMenuList();
    topMenus.value = data;
  } catch (error) {
    console.error('获取顶级菜单列表失败:', error);
  }
};

const getList = async () => {
  loading.value = true;
  try {
    const data = await MenuApi.getMenuList(queryParams);
    list.value = data.list;
    total.value = data.total;
    filteredData.value = list.value;
  } finally {
    loading.value = false;
  }
};

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
    await MenuApi.deleteMenu(id);
    message.success(t('common.delSuccess'));
    getList();
  } catch (error) {
    message.error(t('common.delError'));
  }
};

onMounted(() => {
  getTopMenuList();  // 初始化时获取顶级菜单列表
  getList();
});
</script>
