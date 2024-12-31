import request from '@/config/axios'

export interface TagVO {
  id?: number
  tagCode?: string 
  name: string
  status: number
  creator?: string
  createTime?: Date
  updater?: string
  updateTime?: Date 
  deleted?: boolean
  tenantId?: number 
}


// 查询标签列表
export const getTagList = async (params: PageParam) => {
  return await request.get({ url: '/ow/media/tag/page', params }, true)
}

// 查询简单标签列表
export const getSimpleTagList = async () => {
  return await request.get({ url: '/ow/media/tag/simple-list' }, true)
}

// 查询标签详情
export const getTagDetail = async (id: number) => {
  return await request.get({ url: '/ow/media/tag/get', params: { id } }, true)
}

// 新增标签
export const createTag = async (data: TagVO) => {
  return await request.post({ url: '/ow/media/tag/create', data }, true)
}

// 更新标签
export const updateTag = async (id: number, data: TagVO) => {
  return await request.put({ url: '/ow/media/tag/update', data: { ...data, id } }, true)
}

// 删除标签
export const deleteTag = async (id: number) => {
  return await request.delete({ url: '/ow/media/tag/delete', params: { id } }, true)
}