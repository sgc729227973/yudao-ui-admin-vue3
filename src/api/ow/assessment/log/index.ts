
import request from '@/config/axios'

export interface OfficialWebAssessmentLogVO {
  id?: number
  userId: number
  assessmentId: number // Assessment ID
  assessmentTitle: string // Assessment ID
  score: number
  startTime?: Date
  endTime?: Date
  duration?: string
  completed: boolean
  feedback?: string
  ipAddress?: string
  deviceInfo?: string
  createTime?: Date
  updateTime?: Date
  deleted?: boolean
  tenantId?: number
}

// 查询日志列表
export const getAssessmentLogList = async (params: PageParam) => {
  return await request.get({ url: '/ow/assessment/logs/page', params }, true)
}
// 导出评估日志
export const exportAssessmentLog = (params: any) => {
  return request.download({ url: '/system/assessment/logs/export', params })
}
