import request from '@/config/axios'

// 定义 JobApplicationVO 接口
export interface JobApplicationVO {
  id?: number
  postId: number
  name: string
  email: string
  phone: string
  encryptedResume: string
  otherFiles?: string
  questions: { [key: string]: string } // 问题字典
  createTime?: number // 时间戳，使用 number 类型
}

// 查询岗位申请列表
export const getJobApplicationList = async (params: PageParam) => {
  return await request.get({ url: '/ow/job/application/page', params }, true)
}

// 查询岗位申请详情
export const getJobApplicationDetail = async (id: number) => {
  return await request.get({ url: '/ow/job/application/get', params: { id } }, true)
}

// 导出岗位申请数据
export const exportJobApplication = (params: any) => {
  return request.download({ url: '/ow/job/application/export', params }, true)
}