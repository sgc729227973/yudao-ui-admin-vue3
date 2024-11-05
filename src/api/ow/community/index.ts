import request from '@/config/axios'

export interface OfficialWebsiteTag {
  id: number
  name: string
}

export interface CommunityVO {
  id?: number
  title: string
  description: string
  author?: string
  isTop?: boolean
  status: number
  coverMediaCode:string
  videoCoverMediaCode:string
  tags?: OfficialWebsiteTag[] // Tag objects
  createTime?: Date
  datePublished?: string // 改为 string 格式
  mediaCode?: string
}


// 查询社区列表
export const getCommunityList = async (params: PageParam) => {
  return await request.get({ url: '/ow/community/page', params }, true)
}

// 查询社区详情
export const getCommunityDetail = async (id: number) => {
  return await request.get({ url: '/ow/community/get', params: { id } }, true)
}

// 新增社区
export const createCommunity = async (data: CommunityVO) => {
  return await request.post({ url: '/ow/community/create', data }, true)
}

// 更新社区
export const updateCommunity = async (id: number, data: CommunityVO) => {
  return await request.put({ url: '/ow/community/update', data: { ...data, id } }, true)
}

// 删除社区
export const deleteCommunity = async (id: number) => {
  return await request.delete({ url: '/ow/community/delete', params: { id } }, true)
}

// 导出社区信息
export const exportCommunity = (params) => {
  return request.download({ url: '/ow/community/export', params }, true)
}