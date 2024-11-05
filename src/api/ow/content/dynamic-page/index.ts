import request from '@/config/axios'

// 定义 OfficialWebsiteDynamicPage 的接口类型
export interface OfficialWebsiteDynamicPageMediaVO {
  id?: number;
  media: {
    code: string;
  };
  position: string;
  order: number;
  customStyle?: Record<string, any>;
}

export interface OfficialWebsiteDynamicPageVO {
  id?: number;
  name: string;
  code: string;
  showMenu: boolean 
  showFooter: boolean
  createTime?: Date;
  updateTime?: Date;
  dynamicMedia?: OfficialWebsiteDynamicPageMediaVO[]; // 媒体关联
}

// 查询动态页面列表
export const getDynamicPageList = async (params: PageParam) => {
  return await request.get({ url: '/ow/content/dynamic-page/page', params }, true)
}

// 查询动态页面详情
export const getDynamicPageDetail = async (id: number) => {
  return await request.get({ url: '/ow/content/dynamic-page/get', params: { id } }, true)
}

// 新增动态页面
export const createDynamicPage = async (data: OfficialWebsiteDynamicPageVO) => {
  return await request.post({ url: '/ow/content/dynamic-page/create', data }, true)
}

// 更新动态页面
export const updateDynamicPage = async (id: number, data: OfficialWebsiteDynamicPageVO) => {
  return await request.put({ url: '/ow/content/dynamic-page/update', data: { ...data, id } }, true)
}

// 删除动态页面
export const deleteDynamicPage = async (id: number) => {
  return await request.delete({ url: '/ow/content/dynamic-page/delete', params: { id } }, true)
}
