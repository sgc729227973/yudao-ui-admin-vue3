import request from '@/config/axios'

// 定义 AutoReplyVO 接口
export interface AutoReplyVO {
  id?: number
  question: string
  reply: string
  keywords: string[] // 关键词列表
  preloaded?: boolean
  createTime?: Date
  updateTime?: Date
}

// 查询自动回复列表
export const getAutoReplyList = async (params: PageParam) => {
  return await request.get({ url: '/ow/content/auto-reply/page', params }, true)
}

// 查询自动回复详情
export const getAutoReplyDetail = async (id: number) => {
  return await request.get({ url: '/ow/content/auto-reply/get', params: { id } }, true)
}

// 新增自动回复
export const createAutoReply = async (data: AutoReplyVO) => {
  return await request.post({ url: '/ow/content/auto-reply/create', data }, true)
}

// 更新自动回复
export const updateAutoReply = async (id: number, data: AutoReplyVO) => {
  return await request.put({ url: '/ow/content/auto-reply/update', data: { ...data, id } }, true)
}

// 删除自动回复
export const deleteAutoReply = async (id: number) => {
  return await request.delete({ url: '/ow/content/auto-reply/delete', params: { id } }, true)
}
