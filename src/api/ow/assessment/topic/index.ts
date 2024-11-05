import request from '@/config/axios'

export interface OfficialWebsiteTag {
  id: number
  name: string
}

export type OfficialWebAssessmentSimpleVO = {
  id: number
  title: string
}

export interface OfficialWebAssessmentVO {
  id?: number;
  title: string;
  code: string;
  mediaCode: string; 
  description: string;
  numQuestions: number; 
  duration: number;
  status: number;
  count?: number;
  showParentId?: number;
  averageScore?: number;
  tags?: OfficialWebsiteTag[]; // Tag objects
  createTime?: Date;
  updateTime?: Date;
  deleted?: boolean;
  showMenu?: boolean;
  tenantId?: number;
}

// 查询字典（精简)列表
export const getSimpleAssessmentList = () => {
  return request.get({ url: '/ow/assessment/topic/simple-list' }, true)
}

// 查询评估列表
export const getAssessmentList = async (params: PageParam) => {
  return await request.get({ url: '/ow/assessment/topic/page', params }, true)
}

// 查询评估详情
export const getAssessmentDetail = async (id: number) => {
  return await request.get({ url: '/ow/assessment/topic/get', params: { id } }, true)
}

// 新增评估
export const createAssessment = async (data: OfficialWebAssessmentVO) => {
  return await request.post({ url: '/ow/assessment/topic/create', data }, true)
}

// 更新评估
export const updateAssessment = async (id: number, data: OfficialWebAssessmentVO) => {
  return await request.put({ url: '/ow/assessment/topic/update', data: { ...data, id } }, true);
}

// 删除评估
export const deleteAssessment = async (id: number) => {
  return await request.delete({ url: '/ow/assessment/topic/delete', params: { id } }, true)
}

// 导出评估信息
export const exportAssessment = (params) => {
  return request.download({ url: '/ow/assessment/topic/export', params }, true)
}
