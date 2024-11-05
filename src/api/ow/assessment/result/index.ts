import request from '@/config/axios'

export interface OfficialWebAssessmentResultRangeVO {
  id?: number
  assessment: number // Assessment ID
  minValue: number
  maxValue: number
  mediaCode: string; 
  level: number
  resultDescription: string
  redirectUrl?: string
  suggestion?: string
  startTime?: Date
  endTime?: Date
  deleted?: boolean
  tenantId?: number
}

// 查询评估结果列表
export const getAssessmentResultList = async (params: PageParam) => {
  return await request.get({ url: '/ow/assessment/result/page', params }, true)
}

// 查询评估结果详情
export const getAssessmentResultDetail = async (id: number) => {
  return await request.get({ url: '/ow/assessment/result/get', params: { id } }, true)
}

// 新增评估结果
export const createAssessmentResult = async (data: OfficialWebAssessmentResultRangeVO) => {
  return await request.post({ url: '/ow/assessment/result/create', data }, true)
}

// 更新评估结果
export const updateAssessmentResult = async (id: number, data: OfficialWebAssessmentResultRangeVO) => {
  return await request.put({ url: '/ow/assessment/result/update', data: { ...data, id } }, true);
}

// 删除评估结果
export const deleteAssessmentResult = async (id: number) => {
  return await request.delete({ url: '/ow/assessment/result/delete', params: { id } }, true)
}

