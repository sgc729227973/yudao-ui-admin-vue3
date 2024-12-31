import request from '@/config/axios'

// 定义 OfficialWebContactSubmissionVO 接口
export interface OfficialWebContactSubmissionVO {
  id?: number;
  name: string;
  email: string;
  phoneNumber: string;
  msgSubject: string;
  message: string;
  status: number;
  ownerUserId?: number;
  customerId?: number;
  createTime?: number;
  updateTime?: number;
}

export enum OwSubmissionStatusEnum {
  UNRESPONDED = 1, // 未回应
  ENTERED_CRM = 2, // 已录入CRM
}

export const OwSubmissionStatusEnumLabels = {
  [OwSubmissionStatusEnum.UNRESPONDED]: '未回应',
  [OwSubmissionStatusEnum.ENTERED_CRM]: '已录入CRM',
}

interface PageParam {
  pageSize?: number;
  pageNo?: number;
  name?: string;
  id?: string | number; // 新增 id 字段
}


// 查询联系提交列表
export const getOfficialWebContactSubmissionList = async (params: PageParam) => {
  return await request.get({ url: '/ow/team/submission/page', params }, true)
}

// 查询联系提交详情
export const getOfficialWebContactSubmissionDetail = async (id: number) => {
  return await request.get({ url: '/ow/team/submission/get', params: { id } }, true)
}

// 转化为CRM客户
export const convertToCRM = async (id: number, ownerUserId: number) => {
  return await request.post({ url: '/ow/team/submission/convert-to-crm', data: { id, ownerUserId } }, true);
};