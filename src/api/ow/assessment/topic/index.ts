// api/ow/assessment/topic/index.ts

import request from '@/config/axios';

export type OfficialWebAssessmentSimpleVO = {
  id: number;
  title: string;
};

export interface OfficialWebsiteTag {
  id: number;
  tagCode: string;
  name: string;
}

export interface AssessmentOption {
  score: number;
  content: string;
}

export interface AssessmentQuestion {
  questionText: string;
  options: AssessmentOption[];
}

export interface AssessmentInfo {
  duration: number;
  fileUrl: string;
  pageTitle: string;
  subheading: string;
  description: string;
  metaKeywords: string;
  numQuestions: number;
  metaDescription: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface CommentItem {
  name: string;
  comment: string;
}

export interface AssessmentServiceProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface AssessmentServiceProcess {
  steps: AssessmentServiceProcessStep[];
  title: string;
  description: string;
  howItWorks: string;
}

export interface RiskLevel {
  fileUrl: string;
  linkUrl?: string;
  maxScore: number;
  minScore: number;
  riskLevel: string;
  suggestion: string;
  explanation: string;
  linkBtnText?: string;
  appointmentUrl?: string;
  servicesProcess?: AssessmentServiceProcess;  // 改为可选
  appointmentBtnText?: string;
}

export interface ResultContents {
  riskLevels: RiskLevel[];
}

export interface OfficialWebAssessmentVO {
  id?: number;
  title: string;
  code: string;
  status: number;
  count?: number;
  tags?: OfficialWebsiteTag[];
  createTime?: number;
  assessmentInfo?: AssessmentInfo;
  faqSection?: FAQItem[];
  comments?: CommentItem[];
  questions?: AssessmentQuestion[];
  fileConfigId?: number;
  encrypted?: boolean;
  resultContents?: ResultContents; // 添加 resultContents 字段
}

// API 方法保持不变
export const getAssessmentList = async (params: PageParam) => {
  return await request.get({ url: '/ow/assessment/topic/page', params }, true);
};

export const getSimpleAssessmentList = () => {
  return request.get({ url: '/ow/assessment/topic/simple-list' }, true);
};

export const getAssessmentDetail = async (id: number) => {
  return await request.get({ url: '/ow/assessment/topic/get', params: { id } }, true);
};

export const createAssessment = async (data: OfficialWebAssessmentVO) => {
  return await request.post({ url: '/ow/assessment/topic/create', data }, true);
};

export const updateAssessment = async (id: number, data: OfficialWebAssessmentVO) => {
  return await request.put({ url: '/ow/assessment/topic/update', data: { ...data, id } }, true);
};

export const deleteAssessment = async (id: number) => {
  return await request.delete({ url: '/ow/assessment/topic/delete', params: { id } }, true);
};

export const exportAssessment = (params) => {
  return request.download({ url: '/ow/assessment/topic/export', params }, true);
};
