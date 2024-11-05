import request from '@/config/axios'

// 获得公众号消息分页
export const getMessagePage = (query: PageParam) => {
  return request.get({
    url: '/mp/message/page',
    params: query
  },true)
}

// 给粉丝发送消息
export const sendMessage = (data) => {
  return request.post({
    url: '/mp/message/send',
    data: data
  },true)
}

// 获取新消息 irujia
export const getNewMessages = (query: { accountId: number, userId: number, lastMessageId: number }) => {
  return request.get({
    url: '/mp/message/new-messages',
    params: query
  },true)
}
