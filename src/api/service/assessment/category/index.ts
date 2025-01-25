import request from '@/config/axios'

export type AssessmentSimpleVO = {
  id: number;
  name: string;
};

// 定义 AssessmentCategoryVO 接口
export interface AssessmentCategoryVO {
  id?: number; // 分类 ID
  name: string; // 分类名
  code: string; // 分类编码
  description: string; // 分类描述
  status: number; // 状态
  sort: number; // 排序
  createTime?: Date; // 创建时间
}

// 查询评估分类列表
export const getAssessmentCategoryList = async (params: PageParam) => {
  return await request.get({ url: '/service/assessment/category/page', params }, true)
}

// 查询简单评估分类列表
export const getAssessmentCategorySimpleList = async () => {
  return await request.get({ url: '/service/assessment/category/simple-list' }, true)
}

// 查询评估分类详情
export const getAssessmentCategoryDetail = async (id: number) => {
  return await request.get({ url: '/service/assessment/category/get', params: { id } }, true)
}

// 新增评估分类
export const createAssessmentCategory = async (data: AssessmentCategoryVO) => {
  return await request.post({ url: '/service/assessment/category/create', data }, true)
}

// 更新评估分类
export const updateAssessmentCategory = async (id: number, data: AssessmentCategoryVO) => {
  return await request.put({ url: '/service/assessment/category/update', data: { ...data, id } }, true)
}

// 删除评估分类
export const deleteAssessmentCategory = async (id: number) => {
  return await request.delete({ url: '/service/assessment/category/delete', params: { id } }, true)
}