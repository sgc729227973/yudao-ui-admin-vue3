import { serviceSpring, serviceDjango } from './service'

import { config } from './config'

const { default_headers } = config

//irujia 如果 useDjango 为 true 则使用 django drf 为后端
const request = (option: any, useDjango = false) => {
  const service = useDjango ? serviceDjango : serviceSpring
  const { url, method, params, data, headersType, responseType, ...config } = option
  return service({
    url,
    method,
    params,
    data,
    ...config,
    responseType: responseType,
    headers: {
      ...(config.headers || {}), // 保留已有的 headers
      'Content-Type': headersType || default_headers
    }
  })
}

export default {
  get: async <T = any>(option: any, useDjango = false) => {
    const res = await request({ method: 'GET', ...option }, useDjango)
    return res.data as unknown as T
  },
  post: async <T = any>(option: any, useDjango = false) => {
    const res = await request({ method: 'POST', ...option }, useDjango)
    return res.data as unknown as T
  },
  delete: async <T = any>(option: any, useDjango = false) => {
    const res = await request({ method: 'DELETE', ...option }, useDjango)
    return res.data as unknown as T
  },
  put: async <T = any>(option: any, useDjango = false) => {
    const res = await request({ method: 'PUT', ...option }, useDjango)
    return res.data as unknown as T
  },
  postOriginal: async (option: any, useDjango = false) => {
    const res = await request({ method: 'POST', ...option }, useDjango)
    return res
  },
  download: async <T = any>(option: any, useDjango = false) => {
    const res = await request({ method: 'GET', responseType: 'blob', ...option }, useDjango)
    return res as unknown as Promise<T>
  },
  upload: async <T = any>(option: any, useDjango = false) => {
    option.headersType = 'multipart/form-data'
    const res = await request({ method: 'POST', ...option }, useDjango)
    return res as unknown as Promise<T>
  }
}
