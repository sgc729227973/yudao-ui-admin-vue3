
import request from '@/config/axios'

export interface OfficialWebAssessmentLogVO {
  id?: number;
  userId: number;
  assessmentId: number;
  score: number;
  duration?: string;
  contents: {
    answers: {
      score: number;
      answer: string;
      question: string;
    }[];
    fileUrl?: string;
    linkUrl?: string;
    identifier: string;
    riskLevel: string;
    suggestion: string;
    explanation: string;
    totalScore: number;
    linkBtnText?: string;
    appointmentUrl?: string;
    servicesProcess: {
      steps: {
        step: string;
        title: string;
        description: string;
      }[];
      title: string;
      description: string;
      howItWorks: string;
    };
    appointmentBtnText?: string;
  };
  ipAddress?: string;
  deviceInfo?: string;
  createTime: Date;
  updateTime?: Date;
  tenantId?: number;
}

// 定义日志内容的接口
export interface AssessmentLogContents {
  answers: AssessmentAnswer[]
  fileUrl?: string
  linkUrl?: string
  riskLevel: string
  suggestion: string
  explanation: string
  totalScore: number
  linkBtnText?: string
  appointmentUrl?: string
  servicesProcess: ServicesProcess
  appointmentBtnText?: string
}

// 定义单个答案的接口
export interface AssessmentAnswer {
  score: number
  answer: string
  question: string
}

// 定义服务流程步骤的接口
export interface ServiceProcessStep {
  step: string
  title: string
  description: string
}

// 定义服务流程的接口
export interface ServicesProcess {
  steps: ServiceProcessStep[]
  title: string
  description: string
  howItWorks: string
}

// 查询日志列表
export const getAssessmentLogList = async (params: PageParam) => {
  return await request.get({ url: '/ow/assessment/logs/page', params }, true)
}
// 导出评估日志
export const exportAssessmentLog = (params: any) => {
  return request.download({ url: '/system/assessment/logs/export', params },true)
}
