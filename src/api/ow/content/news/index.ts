import request from '@/config/axios'

// 定义 OfficialWebsiteNews 的接口类型
export interface OfficialWebsiteNewsVO {
  id?: number;
  status:number;
  title: string;
  description: string;
  isTop: boolean;
  author: string;
  mediaCode?: string; 
  datePublished?: string // 改为 string 格式
  createTime?: Date;
  updateTime?: Date;
  deleted?: boolean;
  tenantId?: number;
}

// 查询新闻列表
export const getNewsList = async (params: PageParam) => {
  return await request.get({ url: '/ow/content/news/page', params }, true)
}

// 查询简单新闻列表
export const getSimpleNewsList = () => {
  return request.get({ url: '/ow/content/news/simple-list' }, true)
}

// 查询新闻详情
export const getNewsDetail = async (id: number) => {
  return await request.get({ url: '/ow/content/news/get', params: { id } }, true)
}

// 新增新闻
export const createNews = async (data: OfficialWebsiteNewsVO) => {
  return await request.post({ url: '/ow/content/news/create', data }, true)
}

// 更新新闻
export const updateNews = async (id: number, data: OfficialWebsiteNewsVO) => {
  return await request.put({ url: '/ow/content/news/update', data: { ...data, id } }, true)
}

// 删除新闻
export const deleteNews = async (id: number) => {
  return await request.delete({ url: '/ow/content/news/delete', params: { id } }, true)
}

// 导出新闻信息
export const exportNews = (params) => {
  return request.download({ url: '/ow/content/news/export', params }, true)
}
