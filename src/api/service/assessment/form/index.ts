import request from '@/config/axios'

// 定义 AssessmentFormVO 接口
export interface AssessmentFormVO {
  id?: number; // 表单 ID
  name: string; // 表单名
  status: number; // 状态
  category?: number; // 分类
  conf: string; // 表单配置
  fields: string[]; // 表单项数组
  remark?: string; // 备注
  createTime?: Date; // 创建时间
  code: string; // 表单编码
  count: number; // 评估次数
  description: string; // 描述
  version: number; // 版本号
}

export interface AssessmentSimpleFormVO {
  id: number; // 表单 ID
  name: string; // 表单名
  version: number;
}
// 查询表单数据列表
export const getAssessmentFormList = async (params: PageParam) => {
  return await request.get({ url: '/service/assessment/form/page', params }, true)
}

// 查询简单表单数据列表
export const getAssessmentFormSimpleList = async () => {
  return await request.get({ url: '/service/assessment/form/simple-list' }, true)
}

// 查询表单数据详情
export const getAssessmentFormDetail = async (id: number) => {
  return await request.get({ url: '/service/assessment/form/get', params: { id } }, true)
}

// 新增表单数据
export const createAssessmentForm = async (data: AssessmentFormVO) => {
  return await request.post({ url: '/service/assessment/form/create', data }, true)
}

// 更新表单数据
export const updateAssessmentForm = async (id: number, data: AssessmentFormVO) => {
  return await request.put({ url: '/service/assessment/form/update', data: { ...data, id } }, true)
}

// 删除表单数据
export const deleteAssessmentForm = async (id: number) => {
  return await request.delete({ url: '/service/assessment/form/delete', params: { id } }, true)
}

export const submitAssessmentForm = async (data: { formId: number; data: any }) => {
  return await request.post({ url: '/service/assessment/form/submit', data }, true)
}