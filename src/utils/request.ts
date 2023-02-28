import axios from 'axios'
import type { Method } from 'axios'
import { useUserStroe } from '@/stores/user'
import { showToast } from 'vant'
import router from '@/router'

const baseURL = 'https://consult-api.itheima.net/'
const instance = axios.create({
  baseURL,
  timeout: 10000
})

// 添加请求拦截器
instance.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    const store = useUserStroe()
    if (store.user?.token && config.headers) {
      config.headers.Authorization = `Bear ${store.user.token}`
    }
    return config
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 添加响应拦截器
instance.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    if (response.data?.code !== 10000) {
      showToast('请求失败')
      return Promise.reject(new Error(response.data))
    }
    // 对响应数据做点什么
    return response.data
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    if (error.response.status === 401) {
      const store = useUserStroe()
      store.delUser()
      router.push('/login')
    }
    // 对响应错误做点什么
    return Promise.reject(error)
  }
)

export interface RootObject<T> {
  code: number
  message: string
  data: T
}
const request = <T>(url: string, method: Method = 'GET', submitData?: {}) => {
  return instance<T, RootObject<T>>({
    url,
    method,
    [method.toLocaleLowerCase() === 'get' ? 'params' : 'data']: submitData
  })
}
export { baseURL, instance, request }
