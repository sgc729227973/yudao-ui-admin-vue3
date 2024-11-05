import request from '@/config/axios'

// 定义 MediaVO 接口类型
export interface MediaVO {
  id?: number
  name: string
  code?: string
  description?: string
  fileUrl: string
  mediaType: number
  subheading?: string
  fileConfigId?: number
  encrypted?: boolean
  createTime?: Date
  title?: string
  coverUrl?: string
  linkUrl?: string
  htmlName?: string
  cssClass?: string
}

// 查询媒体列表
export const getMediaList = async (params: PageParam) => {
  return await request.get({ url: '/ow/content/media/page', params }, true)
}

// 查询媒体详情
export const getMediaDetail = async (id: number) => {
  return await request.get({ url: '/ow/content/media/get', params: { id } }, true)
}

// 新增媒体
export const createMedia = async (data: MediaVO) => {
  return await request.post({ url: '/ow/content/media/create', data }, true)
}

// 更新媒体
export const updateMedia = async (id: number, data: MediaVO) => {
  return await request.put({ url: '/ow/content/media/update', data: { ...data, id } }, true)
}

// 删除媒体
export const deleteMedia = async (id: number) => {
  return await request.delete({ url: '/ow/content/media/delete', params: { id } }, true)
}

