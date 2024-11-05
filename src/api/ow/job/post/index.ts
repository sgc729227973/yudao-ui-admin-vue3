import request from '@/config/axios'

// 定义接口，和序列化器中的字段保持一致
export interface JobPostVO {
  id?: number
  title: string
  location: string
  experienceLevel: string 
  description: string
  status: number
  postId: number
  sortOrder?: number 
  createTime?: Date
}

// 查询岗位列表
export const getJobPostList = async (params: PageParam) => {
  return await request.get({ url: '/ow/job/post/page', params }, true)
}

// 查询岗位详情
export const getJobPostDetail = async (id: number) => {
  return await request.get({ url: '/ow/job/post/get', params: { id } }, true)
}

// 新增岗位
export const createJobPost = async (data: JobPostVO) => {
  return await request.post({ url: '/ow/job/post/create', data: data }, true)
}

// 更新岗位
export const updateJobPost = async (id: number, data: JobPostVO) => {
  return await request.put({ url: '/ow/job/post/update', data: { ...data, id } }, true)
}

// 删除岗位
export const deleteJobPost = async (id: number) => {
  return await request.delete({ url: '/ow/job/post/delete', params: { id } }, true)
}

// 导出岗位信息
export const exportJobPost = (params) => {
  return request.download({ url: '/ow/job/post/export', params }, true)
}
