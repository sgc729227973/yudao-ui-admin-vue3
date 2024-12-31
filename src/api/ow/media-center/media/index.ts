import request from '@/config/axios'

// 定义 MediaVO 接口类型
export interface MediaVO {
  id?: number;
  name: string;
  code?: string;
  fileUrl: string;
  coverUrl?: string;
  linkUrl?: string;
  mediaType: number;
  fileConfigId?: number;
  encrypted?: boolean;
  createTime?: number;
  fileUrlPreview?: string;
}

export enum OwMediaTypeEnum {
  IMAGE = 1, // 图片
  VIDEO = 2, // 视频
  AUDIO = 3, // 音频
}

// 查询媒体列表
export const getMediaList = async (params: PageParam) => {
  return await request.get({ url: '/ow/media/media/page', params }, true)
}

// 查询媒体详情
export const getMediaDetail = async (id: number) => {
  return await request.get({ url: '/ow/media/media/get', params: { id } }, true)
}

// 新增媒体
export const createMedia = async (data: MediaVO) => {
  return await request.post({ url: '/ow/media/media/create', data }, true)
}

// 更新媒体
export const updateMedia = async (id: number, data: MediaVO) => {
  return await request.put({ url: '/ow/media/media/update', data: { ...data, id } }, true)
}

// 删除媒体
export const deleteMedia = async (id: number) => {
  return await request.delete({ url: '/ow/media/media/delete', params: { id } }, true)
}

