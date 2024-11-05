import request from '@/config/axios'

// 定义 OfficialWebsiteDynamicMedia 的接口类型
export interface OfficialWebsiteDynamicMediaVO {
  id?: number;
  name: string;
  code: string;
  title: string;
  description: string;
  dynamicContent: string;
  fileConfigId?: number;
  encrypted?: boolean;
  createTime?: Date;
  mediaType: number;
  subheading?: string;
  fileUrl?: string;
  coverUrl?: string;
  linkUrl?: string;
}

// 查询动态媒体列表
export const getDynamicMediaList = async (params: PageParam) => {
  return await request.get({ url: '/ow/content/dynamic-media/page', params }, true)
}

// 查询动态媒体详情
export const getDynamicMediaDetail = async (id: number) => {
  return await request.get({ url: '/ow/content/dynamic-media/get', params: { id } }, true)
}

// 新增动态媒体
export const createDynamicMedia = async (data: OfficialWebsiteDynamicMediaVO) => {
  return await request.post({ url: '/ow/content/dynamic-media/create', data }, true)
}

// 更新动态媒体
export const updateDynamicMedia = async (id: number, data: OfficialWebsiteDynamicMediaVO) => {
  return await request.put({ url: '/ow/content/dynamic-media/update', data: { ...data, id } }, true)
}

// 删除动态媒体
export const deleteDynamicMedia = async (id: number) => {
  return await request.delete({ url: '/ow/content/dynamic-media/delete', params: { id } }, true)
}
