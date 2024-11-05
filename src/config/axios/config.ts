const config: {
  django_base_url: any
  base_url: string
  result_code: number | string
  default_headers: AxiosHeaders
  request_timeout: number
} = {
  /**
   * api请求基础路径
   */
  base_url: import.meta.env.VITE_BASE_URL + import.meta.env.VITE_API_URL,

  /**
   * Django DRF 后端的 api请求基础路径
   */
  django_base_url: import.meta.env.VITE_DJANGO_BASE_URL + import.meta.env.VITE_API_URL, //irujia 添加 Django DRF 的基础路径

  /**
   * 接口成功返回状态码
   */
  result_code: 200,

  /**
   * 接口请求超时时间
   */
  request_timeout: 30000,

  /**
   * 默认接口请求类型
   * 可选值：application/x-www-form-urlencoded multipart/form-data
   */
  default_headers: 'application/json'
}

export { config }
