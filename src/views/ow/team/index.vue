<template>
  <ContentWrap>
    <!-- 查询表单部分 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <!-- 成员姓名 -->
      <el-form-item label="姓名" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入姓名"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <!-- 成员职位 -->
      <el-form-item label="职位" prop="position">
        <el-input
          v-model="queryParams.position"
          class="!w-240px"
          clearable
          placeholder="请输入职位"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <!-- 团队类型 -->
      <el-form-item label="团队类型" prop="teamType">
        <el-select
          v-model="queryParams.teamType"
          class="!w-240px"
          clearable
          placeholder="请选择团队类型"
        >
          <el-option
            v-for="type in getIntDictOptions(DICT_TYPE.OW_TEAM_TYPE)"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </el-form-item>
      <!-- 关联用户 -->
      <el-form-item label="关联用户" prop="userId" label-width="100">
        <el-select v-model="queryParams.userId" class="!w-240px" clearable placeholder="请选择关联用户">
          <el-option
            v-for="user in userOptions"
            :key="user.id"
            :label="user.nickname"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
      <!-- 创建时间范围选择 -->
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          class="!w-240px"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <!-- 操作按钮 -->
      <el-form-item>
        <el-button @click="handleQuery" v-hasPermi="['ow:team:query']">
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
        <el-button plain type="primary" @click="openForm('create')" v-hasPermi="['ow:team:create']">
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <!-- 列表显示部分 -->
    <el-table v-loading="loading" :data="filteredData" stripe>
      <el-table-column align="center" label="编号" prop="id" />
      <el-table-column align="center" label="姓名" prop="name" show-overflow-tooltip />
      <el-table-column align="center" label="职位" prop="position" />
      <el-table-column label="头像" align="center" prop="avatarUrl" width="160px">
        <template #default="{ row }">
          <el-image
            :src="row.avatarUrl"
            fit="cover"
            style="width: 80px; height: 80px; cursor: pointer;"
            :preview-src-list="[row.avatarUrl]"
            preview-teleported
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="团队类型" prop="teamType">
        <template #default="scope">
          <dict-tag
            :type="DICT_TYPE.OW_TEAM_TYPE"
            :value="scope.row.teamType"
            class="mr-4px"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序" prop="sortOrder" />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="创建时间"
        prop="createTime"
        width="180"
      />
      <el-table-column align="center" label="操作">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('update', scope.row.id)" v-hasPermi="['ow:team:update']">
            修改
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)" v-hasPermi="['ow:team:delete']">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <TeamForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict';
import { dateFormatter } from '@/utils/formatTime';
import * as TeamApi from '@/api/ow/team/index';
import TeamForm from './TeamForm.vue';
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import * as UserApi from '@/api/system/user';
import { UserVO } from '@/api/system/user';

defineOptions({ name: 'TeamList' });

interface TeamItem {
  id: number;
  name: string;
  position: string;
  avatarUrl: string;
  teamType: number;
  sortOrder: number;
  createTime: Date;
}

const message = useMessage();
const { t } = useI18n();
const userOptions = ref<UserVO[]>([]);
const loading = ref(true);
const total = ref(0);
const list = ref<TeamItem[]>([]);
const filteredData = ref<TeamItem[]>([]);
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
  userId: '',
  position: '',
  teamType: '',
  createTime: []
});
const queryFormRef = ref();

/** 获取团队成员列表 */
const getList = async () => {
  loading.value = true;
  try {
    const response = await TeamApi.getTeamList(queryParams);
    list.value = response.list.map((item) => ({
      ...item,
      avatarUrl: item.avatarUrl || '',
      teamType: item.teamType || '',
    }));
    total.value = response.total;
    filteredData.value = list.value;
  } finally {
    loading.value = false;
  }
};

/** 搜索操作 */
const handleQuery = () => {
  queryParams.pageNo = 1;
  getList();
};

/** 重置搜索表单 */
const resetQuery = () => {
  queryFormRef.value.resetFields();
  handleQuery();
};

/** 添加/修改操作 */
const formRef = ref();
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id);
};

/** 删除操作 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm();
    await TeamApi.deleteTeamMember(id);
    message.success(t('common.delSuccess'));
    getList();
  } catch (error) {
    message.error(t('common.delError'));
  }
};

/** 加载用户列表 */
const loadUserOptions = async () => {
  try {
    userOptions.value = await UserApi.getSimpleUserList();
  } catch (error) {
    console.error('加载用户列表失败:', error);
  }
};

/** 初始化时获取数据 */
onMounted(async() => {
  await loadUserOptions(); // 加载用户列表
  getList();
});
</script>
