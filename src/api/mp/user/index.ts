import request from '@/config/axios'

// 更新公众号粉丝
export const updateUser = (data) => {
  return request.put({
    url: '/mp/user/update',
    data: data
  },true)
}

// 获得公众号粉丝
export const getUser = (id) => {
  return request.get({
    url: '/mp/user/get?id=' + id
  },true)
}

// 获得公众号粉丝分页
export const getUserPage = (query) => {
  return request.get({
    url: '/mp/user/page',
    params: query
  },true)
}

// 同步公众号粉丝
export const syncUser = (accountId) => {
  return request.post({
    url: '/mp/user/sync?accountId=' + accountId
  },true)
}
