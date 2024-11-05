import request from '@/config/axios'

// 定义团队成员的接口类型
export interface OfficialWebsiteTeamMemberVO {
  id?: number;
  name: string;
  title: string;
  teamType: number;
  description: string;
  sortOrder: number;
  mediaCode?: string; // 媒体资源使用 mediaCode
  createTime?: Date;
  updateTime?: Date;
  deleted?: boolean;
  tenantId?: number;
}

// 查询团队列表
export const getTeamList = async (params: PageParam) => {
  return await request.get({ url: '/ow/team/page', params }, true)
}

// 查询团队详情
export const getTeamDetail = async (id: number) => {
  return await request.get({ url: '/ow/team/get', params: { id } }, true)
}

// 新增团队成员
export const createTeamMember = async (data: OfficialWebsiteTeamMemberVO) => {
  return await request.post({ url: '/ow/team/create', data }, true)
}

// 更新团队成员
export const updateTeamMember = async (id: number, data: OfficialWebsiteTeamMemberVO) => {
  return await request.put({ url: `/ow/team/update`, data: { ...data, id } }, true)
}

// 删除团队成员
export const deleteTeamMember = async (id: number) => {
  return await request.delete({ url: `/ow/team/delete`, params: { id } }, true)
}

// 导出团队信息
export const exportTeam = (params) => {
  return request.download({ url: '/ow/team/export', params }, true)
}

