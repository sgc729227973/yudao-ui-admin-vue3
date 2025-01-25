import request from '@/config/axios'

// 定义 AssessmentFormDataVO 接口
export interface AssessmentFormDataVO {
  id?: number; // 表单数据 ID
  assessmentFormId: number; // 关联的表单 ID
  userInfo: Record<string, any>; // 用户信息
  formData: Record<string, any>; // 动态表单数据
  ownerUserId: number; // 负责人 ID
  customerId: number; // 客户 ID
  aiAnalysis?: string; // AI 分析结果
  creator: string; // 创建者
  createTime?: Date; // 创建时间
  updater?: string; // 更新者
  updateTime?: Date; // 更新时间
  deleted?: boolean; // 是否删除
  tenantId?: number; // 租户编号
}

// 查询表单数据列表
export const getAssessmentFormDataList = async (params: PageParam) => {
  return await request.get({ url: '/service/assessment/form-data/page', params }, true)
}

// 查询表单数据详情
export const getAssessmentFormDataDetail = async (id: number) => {
  return await request.get({ url: '/service/assessment/form-data/get', params: { id } }, true)
}

// 更新表单数据
export const updateAssessmentFormData = async (id: number, data: AssessmentFormDataVO) => {
  return await request.put({ url: '/service/assessment/form-data/update', data: { ...data, id } }, true)
}

// 删除表单数据
export const deleteAssessmentFormData = async (id: number) => {
  return await request.delete({ url: '/service/assessment/form-data/delete', params: { id } }, true)
}