import request from '@/config/axios'

export interface MpFunctionLogVO {
  id?: number
  userId: number
  functionCode: string // 功能编码
  trackId: string // 功能编码
  openid: string // 用户OpenID
  accountId: number // 微信公众号ID
  appId: string // 微信公众号appID
  ingredientNames?: string // 新增：成分名称
  ingredientIds: string[] // 成分ID
  createTime?: Date
  updateTime?: Date
  deleted?: boolean
  tenantId?: number
}

// 查询功能日志列表
export const getFunctionLogList = async (params: PageParam) => {
  return await request.get({ url: '/mp/function/additive/log/page', params }, true)
}

// 导出功能日志
export const exportFunctionLog = (params: any) => {
  return request.download({ url: '/mp/function/additive/log/export', params })
}