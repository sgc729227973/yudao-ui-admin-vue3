import request from '@/config/axios'

// SDKVO接口对应的字段
export interface SDKVO {
  id?: number
  name: string
  sdkId: string
  sdkSecret: string
  sdkAppId: string
  apiKey: string
  apiSecret?: string
  status?: number
  callbackUrl?: string
  createTime?: Date
  remark?: string
  sdkType?: string
  master?: boolean
  extraConfig?: { [key: string]: string } 
}

// 查询SDK渠道列表
export const getSDKPage = async (params: PageParam) => {
  return await request.get({ url: '/system/sdk/page', params }, true)
}

// 查询SDK渠道详情
export const getSDKDetail = async (id: number) => {
  return await request.get({ url: '/system/sdk/get?id=' + id }, true)
}

// 更新SDK为主配置
export const updateSDKMaster = (id: number, sdkType: string) => {
  return request.put({ url: `/system/sdk/update-master?id=${id}&sdkType=${sdkType}` }, true)
}

// 新增SDK渠道
export const createSDK = async (data: SDKVO) => {
  return await request.post({ url: '/system/sdk/create', data }, true)
}

// 修改SDK渠道
export const updateSDK = async (id: number, data: SDKVO) => {
  return await request.put({ url: '/system/sdk/update', data: { ...data, id } }, true)
}

// 删除SDK渠道
export const deleteSDK = async (id: number) => {
  return await request.delete({ url: '/system/sdk/delete?id=' + id }, true)
}
