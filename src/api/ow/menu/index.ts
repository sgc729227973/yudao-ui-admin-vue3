import request from '@/config/axios'

// 定义菜单的接口类型
export interface OfficialWebsiteMenuVO {
  id?: number;
  name: string;
  path: string;
  description?: string;
  parent?: number;
  sort?: number;
  status?: number;
  createTime?: Date;
  updateTime?: Date;
  deleted?: boolean;
  visible?: boolean;
  isQuickLink?: boolean;
  tenantId?: number;
}


// 查询顶级菜单列表
export const getSimpleMenuList = () => {
  return request.get({ url: '/ow/menu/simple-list' }, true)
}

// 查询菜单列表
export const getMenuList = async (params: PageParam) => {
  return await request.get({ url: '/ow/menu/page', params }, true)
}

// 查询菜单详情
export const getMenuDetail = async (id: number) => {
  return await request.get({ url: '/ow/menu/get', params: { id } }, true)
}

// 新增菜单
export const createMenu = async (data: OfficialWebsiteMenuVO) => {
  return await request.post({ url: '/ow/menu/create', data }, true)
}

// 更新菜单
export const updateMenu = async (id: number, data: OfficialWebsiteMenuVO) => {
  return await request.put({ url: '/ow/menu/update', data: { ...data, id } }, true)
}

// 删除菜单
export const deleteMenu = async (id: number) => {
  return await request.delete({ url: '/ow/menu/delete', params: { id } }, true)
}
