
import request from '@/config/axios'

export interface OfficialWebAssessmentOptionVO {
  id?: number
  question: number // Question ID
  optionText: string
  value: number
  optionOrder: number
  createTime?: Date
  updateTime?: Date
  deleted?: boolean
  tenantId?: number
}

// 查询选项列表（分页）
export const getOptionList = async (params: PageParam) => {
  return await request.get({ url: '/ow/assessment/options/page', params }, true)
}

// 查询选项详情
export const getOptionDetail = async (id: number) => {
  return await request.get({ url: '/ow/assessment/options/get', params: { id } }, true)
}

// 新增选项
export const createOption = async (data: OfficialWebAssessmentOptionVO) => {
  return await request.post({ url: '/ow/assessment/options/create', data }, true)
}

// 更新选项
export const updateOption = async (id: number, data: OfficialWebAssessmentOptionVO) => {
  return await request.put({ url: '/ow/assessment/options/update', params: { id }, data }, true)
}

// 删除选项
export const deleteOption = async (id: number) => {
  return await request.delete({ url: '/ow/assessment/options/delete', params: { id } }, true)
}