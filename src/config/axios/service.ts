import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios'

import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import qs from 'qs'
import { config } from '@/config/axios/config'
import { getAccessToken, getRefreshToken, getTenantId, removeToken, setToken } from '@/utils/auth'
import errorCode from './errorCode'

import { resetRouter } from '@/router'
import { deleteUserCache } from '@/hooks/web/useCache'

const tenantEnable = import.meta.env.VITE_APP_TENANT_ENABLE
const { result_code, base_url, request_timeout } = config

// 需要忽略的提示。忽略后，自动 Promise.reject('error')
const ignoreMsgs = [
  '无效的刷新令牌', // 刷新令牌被删除时，不用提示
  '刷新令牌已过期' // 使用刷新令牌，刷新获取新的访问令牌时，结果因为过期失败，此时需要忽略。否则，会导致继续 401，无法跳转到登出界面
]
// 是否显示重新登录
export const isRelogin = { show: false }
// Axios 无感知刷新令牌，参考 https://www.dashingdog.cn/article/11 与 https://segmentfault.com/a/1190000020210980 实现
// 请求队列
let requestList: any[] = []
// 是否正在刷新中
let isRefreshToken = false
// 请求白名单，无须token的接口
const whiteList: string[] = ['/login', '/refresh-token']

// 创建axios实例
const serviceSpring: AxiosInstance = axios.create({
  baseURL: base_url, // api 的 base_url
  timeout: request_timeout, // 请求超时时间
  withCredentials: false // 禁用 Cookie 等信息
})

//irujia 创建axios实例 Django DRF
const serviceDjango: AxiosInstance = axios.create({
  baseURL: config.django_base_url, // Django DRF 后端的 base_url
  timeout: config.request_timeout, // 请求超时时间
  withCredentials: false // 禁用 Cookie 等信息
});

//irujia 请求拦截器和响应拦截器的通用逻辑可以复用
const setupInterceptors = (service: AxiosInstance) => {
  service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      //irujia 添加通用的请求拦截逻辑
      let isToken = (config!.headers || {}).isToken === false
      whiteList.some((v) => {
        if (config.url) {
          config.url.indexOf(v) > -1
          return (isToken = false)
        }
      })
      if (getAccessToken() && !isToken) {
        (config as Recordable).headers.Authorization = 'Bearer ' + getAccessToken() // 让每个请求携带自定义token
      }

    // 设置租户
    if (tenantEnable && tenantEnable === 'true') {
      const tenantId = getTenantId()
      if (tenantId) (config as Recordable).headers['tenant-id'] = tenantId
    }
      const params = config.params || {}
      const data = config.data || false
      if (
        config.method?.toUpperCase() === 'POST' &&
        (config.headers as AxiosRequestHeaders)['Content-Type'] ===
          'application/x-www-form-urlencoded'
      ) {
        config.data = qs.stringify(data)
      }
      // get请求参数编码
      if (config.method?.toUpperCase() === 'GET' && params) {
        config.params = {}
        const paramsStr = qs.stringify(params, { allowDots: true })
        if (paramsStr) {
          config.url = config.url + '?' + paramsStr
        }
      }
      return config
    },
    (error: AxiosError) => {
      console.error(error)
      return Promise.reject(error)
    }
  )

  //irujia 为两个 axios 实例设置通用的响应拦截器
  service.interceptors.response.use(
    async (response: AxiosResponse<any>) => {
      let { data } = response
      const config = response.config
      if (!data) {
        // 返回“[HTTP]请求没有返回值”;
        throw new Error()
      }
      const { t } = useI18n()
      // 未设置状态码则默认成功状态
      if (
        response.request.responseType === 'blob' ||
        response.request.responseType === 'arraybuffer'
      ) {
        if (response.data.type !== 'application/json') {
          return response.data
        }
        data = await new Response(response.data).json()
      }
      const code = data.code || result_code
      const msg = data.msg || errorCode[code] || errorCode['default']
      if (ignoreMsgs.indexOf(msg) !== -1) {
        return Promise.reject(msg)
      } else if (code === 401) {
        if (!isRefreshToken) {
          isRefreshToken = true
          if (!getRefreshToken()) {
            return handleAuthorized()
          }
          try {
            const refreshTokenRes = await refreshToken()
            setToken((await refreshTokenRes).data.data)
            config.headers!.Authorization = 'Bearer ' + getAccessToken()
            requestList.forEach((cb: any) => {
              cb()
            })
            requestList = []
            return service(config)
          } catch (e) {
            requestList.forEach((cb: any) => {
              cb()
            })
            return handleAuthorized()
          } finally {
            requestList = []
            isRefreshToken = false
          }
        } else {
          return new Promise((resolve) => {
            requestList.push(() => {
              config.headers!.Authorization = 'Bearer ' + getAccessToken()
              resolve(service(config))
            })
          })
        }
      } else if (code === 500) {
        ElMessage.error(t('sys.api.errMsg500'))
        return Promise.reject(new Error(msg))
      } else if (code === 901) {
        ElMessage.error({
          offset: 300,
          dangerouslyUseHTMLString: true,
          message:
            '<div>' +
            t('sys.api.errMsg901') +
            '</div>'
        })
        return Promise.reject(new Error(msg))
      } else if (code !== 200) {
        if (msg === '无效的刷新令牌') {
          console.log(msg)
          return handleAuthorized()
        } else {
          ElNotification.error({ title: msg })
        }
        return Promise.reject('error')
      } else {
        return data
      }
    },
    (error: AxiosError) => {
      console.log('err' + error)
      let { message } = error
      const { t } = useI18n()
      if (message === 'Network Error') {
        message = t('sys.api.errorMessage')
      } else if (message.includes('timeout')) {
        message = t('sys.api.apiTimeoutMessage')
      } else if (message.includes('Request failed with status code')) {
        message = t('sys.api.apiRequestFailed') + message.substr(message.length - 3)
      }
      ElMessage.error(message)
      return Promise.reject(error)
    }
  )
}

//irujia 为Spring和Django两个服务都设置拦截器
setupInterceptors(serviceSpring);
setupInterceptors(serviceDjango);

const refreshToken = async () => {
  axios.defaults.headers.common['tenant-id'] = getTenantId()
  return await axios.post(base_url + '/system/auth/refresh-token?refreshToken=' + getRefreshToken())
}
const handleAuthorized = () => {
  const { t } = useI18n()
  if (!isRelogin.show) {
    isRelogin.show = true
    ElMessageBox.confirm(t('sys.api.timeoutMessage'), t('common.confirmTitle'), {
      showCancelButton: false,
      closeOnClickModal: false,
      showClose: false,
      closeOnPressEscape: false,
      confirmButtonText: t('login.relogin'),
      type: 'warning'
    }).then(() => {
      resetRouter() // 重置静态路由表
      deleteUserCache() // 删除用户缓存
      removeToken()
      isRelogin.show = false
      // 干掉token后再走一次路由让它过router.beforeEach的校验
      window.location.href = window.location.href
    })
  }
  return Promise.reject(t('sys.api.timeoutMessage'))
}
export { serviceSpring, serviceDjango } //irujia 导出两个服务
