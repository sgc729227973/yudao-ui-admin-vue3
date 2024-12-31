import request from '@/config/axios'

// 定义 PageContentsVO 接口
export interface PageContentsVO {
  id?: number
  code?: string
  pageName: string
  description?: string
  contents?: Record<string, any>
  fileConfigId?: number
  encrypted?: boolean
  createTime?: Date
  creator?: string
  updateTime?: Date
  updater?: string
  deleted?: boolean
  tenantId?: number
}

// 查询页面内容列表
export const getPageContentsList = async (params: PageParam) => {
  return await request.get({ url: '/ow/content/page-contents/page', params }, true)
}

// 查询简单页面内容列表
export const getSimplePageContentsList = async () => {
  return await request.get({ url: '/ow/content/page-contents/simple-list' }, true)
}

// 查询页面内容详情
export const getPageContentsDetail = async (id: number) => {
  return await request.get({ url: '/ow/content/page-contents/get', params: { id } }, true)
}

// 新增页面内容
export const createPageContents = async (data: PageContentsVO) => {
  return await request.post({ url: '/ow/content/page-contents/create', data }, true)
}

// 更新页面内容
export const updatePageContents = async (id: number, data: PageContentsVO) => {
  return await request.put({ url: '/ow/content/page-contents/update', data: { ...data, id } }, true)
}

// 删除页面内容
export const deletePageContents = async (id: number) => {
  return await request.delete({ url: '/ow/content/page-contents/delete', params: { id } }, true)
}