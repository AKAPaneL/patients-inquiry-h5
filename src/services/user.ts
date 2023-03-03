import type { User, CodeType } from '@/types/user'
import { request } from '@/utils/request'
import type { UserInfo, PatientList } from '@/types/user'
// 用户登录--密码登录
export const loginByPassword = (mobile: string, password: string) => {
  return request<User>('/login/password', 'post', { mobile, password })
}
// 用户登录--验证码登录
export const loginByCode = (mobile: string, code: string) => {
  return request<User>('/login', 'post', { mobile, code })
}
// 验证码获取
export const sendMobileCode = (mobile: string, type: CodeType) => {
  return request<{ code: string }>('/code', 'get', { mobile, type })
}
// 获取用户个人信息
export const getUserInfo = () => request<UserInfo>('/patient/myUser')

// 获取患者列表
export function getPatientList() {
  return request<PatientList>('/patient/mylist')
}
