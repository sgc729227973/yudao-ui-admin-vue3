import request from '@/config/axios';
// 修改后的接口类型定义
export interface OfficialWebsiteTeamMemberVO {
  id?: number;
  name: string;
  position: string;
  avatarUrl: string;
  teamType: number[]; // 修改为数组类型
  sortOrder: number;
  createTime?: Date;
  updateTime?: Date;
  deleted?: boolean;
  tenantId?: number;
  contents: any; // 新增：内容字段
  fileConfigId?: number;
  encrypted?: boolean;
  linkUrl?: string;
  userId?: number;
}

// 查询团队列表
export const getTeamList = async (params: Record<string, any>) => {
  return await request.get({ url: '/ow/team/member/page', params }, true);
};

// 查询团队详情
export const getTeamDetail = async (id: number) => {
  return await request.get({ url: '/ow/team/member/get', params: { id } }, true);
};

// 新增团队成员
export const createTeamMember = async (data: OfficialWebsiteTeamMemberVO) => {
  return await request.post({ url: '/ow/team/member/create', data }, true);
};

// 更新团队成员
export const updateTeamMember = async (id: number, data: OfficialWebsiteTeamMemberVO) => {
  return await request.put({ url: `/ow/team/member/update`, data: { ...data, id } }, true);
};

// 删除团队成员
export const deleteTeamMember = async (id: number) => {
  return await request.delete({ url: `/ow/team/member/delete`, params: { id } }, true);
};

// 导出团队信息
export const exportTeam = (params: Record<string, any>) => {
  return request.download({ url: '/ow/team/member/export', params }, true);
}

// 查询团队简单列表
export const getTeamSimpleList = async (params?: { teamType?: number }) => {
  return await request.get({
    url: '/ow/team/member/simple-list',
    params,
  }, true);
};