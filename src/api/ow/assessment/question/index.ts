import request from '@/config/axios'


export type OfficialWebAssessmentQuestionSimpleVO = {
  id: number
  questionText: string
}


export interface OfficialWebAssessmentQuestionVO {
  id?: number;
  assessment: number; 
  questionText: string;
  order: number;
  createTime?: Date;
  updateTime?: Date;
  deleted?: boolean;
  tenantId?: number;
}

// 查询字典（精简)列表
export const getSimpleAssessmentQuestionsList = () => {
  return request.get({ url: '/ow/assessment/questions/simple-list' }, true)
}

// 查询问题列表
export const getQuestionList = async (params: PageParam) => {
  return await request.get({ url: '/ow/assessment/questions/page', params }, true);
}

// 查询问题详情
export const getQuestionDetail = async (id: number) => {
  return await request.get({ url: '/ow/assessment/questions/get', params: { id } }, true);
}

// 新增问题
export const createQuestion = async (data: OfficialWebAssessmentQuestionVO) => {
  return await request.post({ url: '/ow/assessment/questions/create', data }, true);
}

// 更新问题
export const updateQuestion = async (id: number, data: OfficialWebAssessmentQuestionVO) => {
  return await request.put({ url: '/ow/assessment/questions/update', data: { ...data, id } }, true);
}

// 删除问题
export const deleteQuestion = async (id: number) => {
  return await request.delete({ url: `/ow/assessment/questions/delete`, params: { id } }, true);
}
