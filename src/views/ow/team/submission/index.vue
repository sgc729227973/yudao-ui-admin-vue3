<template>
  <ContentWrap>
    <!-- 搜索栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="姓名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入提交人姓名"
          clearable
          class="!w-240px"
        />
      </el-form-item>

      <!-- 状态 -->
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" class="!w-240px" clearable placeholder="请选择状态">
          <el-option
            v-for="status in getIntDictOptions(DICT_TYPE.OW_SUBMISSION_STATUS)"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>
      </el-form-item>

      <!-- 提交目标人 -->
      <el-form-item label="提交目标人" prop="memberId" label-width="100">
        <el-select v-model="queryParams.memberId" class="!w-240px" clearable placeholder="请选择提交目标人">
          <el-option
            v-for="member in memberList"
            :key="member.id"
            :label="member.name"
            :value="member.id"
          />
        </el-select>
      </el-form-item>

      <!-- 负责人 -->
      <el-form-item label="负责人" prop="ownerUserId" label-width="100">
        <el-select v-model="queryParams.ownerUserId" class="!w-240px" clearable placeholder="请选择负责人">
          <el-option
            v-for="user in userOptions"
            :key="user.id"
            :label="user.nickname"
            :value="user.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="提交时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="!w-240px"
        />
      </el-form-item>

      <el-form-item>
        <el-button @click="handleQuery" v-hasPermi="['ow:team:submission:query']">
          <Icon icon="ep:search" class="mr-5px" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px" /> 重置
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 联系提交列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="提交编号" align="center" prop="id" />
      <el-table-column label="提交人姓名" align="center" prop="name" />
      <el-table-column label="电子邮件" align="center" prop="email" />
      <el-table-column align="center" label="状态" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.OW_SUBMISSION_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="电话" align="center" prop="phoneNumber" />
      <el-table-column align="center" label="提交目标人" prop="memberId">
        <template #default="scope">
          <span>
            {{memberList.find((member) => member.id === scope.row.memberId)?.name || '未指定提交'}}
          </span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="负责人" prop="ownerUserId">
        <template #default="scope">
          <span>
            {{userOptions.find((user) => user.id === scope.row.ownerUserId)?.nickname || '无负责人'}}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="提交主题" align="center" prop="msgSubject" />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="提交时间"
        prop="createTime"
        width="180"
      />
      <!-- 修改部分：操作列 -->
      <el-table-column label="操作" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openDetail(scope.row)">
            详情
          </el-button>
          <el-button
            v-if="scope.row.status === OwSubmissionStatusEnum.UNRESPONDED"
            link
            type="success"
            @click="convertSubmissionToCRM(scope.row.id)"
            v-hasPermi="['ow:team:submission:convert-to-crm']"
          >
            转化为CRM客户
          </el-button>
          <el-button
            v-if="scope.row.status === OwSubmissionStatusEnum.ENTERED_CRM"
            link
            type="primary"
            @click="navigateTo(scope.row.customerId)"
          >
            跳转客户管理
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 详情弹窗 -->
  <ContactDetail ref="detailRef" />

  <ConvertToCrmDialog ref="convertToCrmDialogRef" @success="onConvertSuccess" />
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { dateFormatter } from '@/utils/formatTime';
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict';
import {
  getOfficialWebContactSubmissionList,
  OfficialWebContactSubmissionVO,
  OwSubmissionStatusEnum,
} from '@/api/ow/team/submission/index';
import { getTeamSimpleList } from '@/api/ow/team'; // 新增简单列表接口
import * as UserApi from '@/api/system/user';
import ContactDetail from './Detail.vue';
import ConvertToCrmDialog from './ConvertToCrmDialog.vue';
import { UserVO } from '@/api/system/user';

interface Member {
  id: number;
  name: string;
}

const memberList = ref<Member[]>([]); // 存储简单团队列表
const userOptions = ref<UserVO[]>([]); // 存储用户列表
const router = useRouter();
const loading = ref(true);
const total = ref(0);
const list = ref<OfficialWebContactSubmissionVO[]>([]);
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  status: undefined,
  memberId: '',
  ownerUserId: '',
  createTime: [],
});
const queryFormRef = ref();

/** 查询列表 */
const getList = async () => {
  loading.value = true;
  try {
    const data = await getOfficialWebContactSubmissionList(queryParams);
    list.value = data.list;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
};

/** 加载简单列表 */
const loadmemberList = async () => {
  try {
    const data = await getTeamSimpleList();
    memberList.value = data.map((item: any) => ({
      id: item.id,
      name: item.name,
    }));
  } catch (error) {
    console.error('加载简单列表失败:', error);
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

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields();
  queryParams.name = undefined;
  queryParams.memberId = '';
  queryParams.ownerUserId = '';
  queryParams.createTime = [];
  queryParams.pageNo = 1;
  getList();
};

/** 详情操作 */
const detailRef = ref();
const openDetail = (data: OfficialWebContactSubmissionVO) => {
  const targetPerson = memberList.value.find((member) => member.id === data.ownerUserId);
  const detailDataWithOwner = {
    ...data,
    ownerName: targetPerson?.name || '未指定目标人',
  };
  detailRef.value.open(detailDataWithOwner);
};

/** 转化为CRM操作 */
const convertToCrmDialogRef = ref();
const convertSubmissionToCRM = (id: number) => {
  convertToCrmDialogRef.value.open(id);
};

/** 转化成功回调 */
const onConvertSuccess = () => {
  getList(); // 刷新列表
};

/** 跳转到CRM客户管理 */
const navigateTo = (customerId: number) => {
  if (customerId) {
    router.push({ name: 'CrmCustomerDetail', params: { id: customerId } });
  }
};

/** 初始化 */
onMounted(async () => {
  await loadmemberList(); // 加载简单列表
  await loadUserOptions(); // 加载用户列表
  getList();
});
</script>
