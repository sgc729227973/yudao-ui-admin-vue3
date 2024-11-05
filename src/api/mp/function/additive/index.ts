import request from '@/config/axios'

export interface FunctionAdditiveVO {
  id: number
  accountId: number
  name: string
  introduce: string
  categories: number[]
  consumptionAdvice: number
  score: number
  dataSource: string
  ADI: string
  longTermIngestionRisk: string
  healthBenefits: string
  carcinogenicRisk: string
  carcinogenicIntroduce: string
  createTime: string
}

// 创建食品添加剂
export const createFunctionAdditive = async (data) => {
  return await request.post({ url: '/mp/function/additive/additive/create', data }, true)
}

// 更新食品添加剂
export const updateFunctionAdditive = async (data) => {
  return request.put({ url: '/mp/function/additive/additive/update', data: data }, true)
}

// 下载客户食品添加剂模板
export const importTemplate = () => {
  return request.download({ url: '/mp/function/additive/additive/get-import-template' }, true)
}

// 食品添加剂客户
export const handleImport = async (formData) => {
  return await request.upload({ url: `/mp/function/additive/additive/import`, data: formData }, true)
}

// 删除食品添加剂
export const deleteFunctionAdditive = async (id) => {
  return request.delete({ url: '/mp/function/additive/additive/delete?id=' + id }, true)
}

// 获得食品添加剂详情
export const getFunctionAdditive = async (id) => {
  return request.get({ url: '/mp/function/additive/additive/get?id=' + id }, true)
}

// 获得食品添加剂分页
export const getFunctionAdditivePage = async (query) => {
  return request.get({ url: '/mp/function/additive/additive/page', params: query }, true)
}

// 获取食品添加剂精简信息列表
export const getSimpleFunctionAdditiveList = async () => {
  return request.get({ url: '/mp/function/additive/additive/simple-list' }, true)
}

// 计算未评分的成分的评分
export const calculateScores = async () => {
  return await request.post({ url: '/mp/function/additive/additive/calculate-scores' }, true)
}