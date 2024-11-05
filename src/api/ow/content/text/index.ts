import request from '@/config/axios'

// 定义文本资源的接口类型
export interface TextResourceVO {
  id?: number
  name: string
  content: string
  code?: string
  description?: string
  belongToHtml?: string
  creator?: string
  createTime?: Date  // 修改字段为 createTime
  updater?: string
  updateTime?: Date  // 修改字段为 updateTime
  deleted?: boolean
  tenantId?: number  // 修改字段为 tenantId
}

// 查询文本资源列表
export const getTextResourceList = async (params: PageParam) => {
  return await request.get({ url: '/ow/content/text/page', params }, true)
}

// 查询文本资源详情
export const getTextResourceDetail = async (id: number) => {
  return await request.get({ url: '/ow/content/text/get', params: { id } }, true)
}

// 新增文本资源
export const createTextResource = async (data: TextResourceVO) => {
  return await request.post({ url: '/ow/content/text/create', data }, true)
}

// 更新文本资源
export const updateTextResource = async (id: number, data: TextResourceVO) => {
  return await request.put({ url: '/ow/content/text/update', data: { ...data, id } }, true)
}

// 删除文本资源
export const deleteTextResource = async (id: number) => {
  return await request.delete({ url: '/ow/content/text/delete', params: { id } }, true)
}

// 导出文本资源
export const exportTextResource = (params) => {
  return request.download({ url: '/ow/content/text/export', params }, true)
}
