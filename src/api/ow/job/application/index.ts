import request from '@/config/axios'

// 定义 JobApplicationVO 接口，和序列化器中的字段保持一致
export interface JobApplicationVO {
  id?: number
  postId: number
  firstName: string
  lastName: string
  email: string
  phone: string
  encryptedResume: string
  otherFiles?: string
  question1: string
  question2: string
  question3: string
  question4: string
  question5: string
  question6: string
  createTime?: Date
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
  return request.download({ url: '/ow/job/application/export', params })
}
