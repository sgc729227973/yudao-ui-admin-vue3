import request from '@/config/axios'

export interface AccountVO {
  id: number
  name: string
}

// 创建公众号账号
export const createAccount = async (data) => {
  return await request.post({ url: '/mp/account/create', data },true)
}

// 更新公众号账号
export const updateAccount = async (data) => {
  return request.put({ url: '/mp/account/update', data: data },true)
}

// 删除公众号账号
export const deleteAccount = async (id) => {
  return request.delete({ url: '/mp/account/delete?id=' + id, method: 'delete' },true)
}

// 获得公众号账号
export const getAccount = async (id) => {
  return request.get({ url: '/mp/account/get?id=' + id },true)
}

// 获得公众号账号分页
export const getAccountPage = async (query) => {
  return request.get({ url: '/mp/account/page', params: query },true)
}

// 获取公众号账号精简信息列表
export const getSimpleAccountList = async () => {
  return request.get({ url: '/mp/account/list-all-simple' },true)
}

// 生成公众号二维码
export const generateAccountQrCode = async (id) => {
  return request.put({ url: '/mp/account/generate-qr-code?id=' + id },true)
}

// 清空公众号 API 配额
export const clearAccountQuota = async (id) => {
  return request.put({ url: '/mp/account/clear-quota?id=' + id },true)
}
