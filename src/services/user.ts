import type { User, CodeType } from '@/types/user'
import { request } from '@/utils/request'
import type { UserInfo, PatientList, Patient } from '@/types/user'
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
// 添加患者
export function addPatient(patient: Patient) {
  return request('/patient/add', 'post', patient)
}
// 根据id获取对应患者详情
export function getPatientById(id: string) {
  return request<Patient>(`/patient/info/${id}`)
}
// 编辑患者信息
export function editPatientPort(patient: Patient) {
  return request('/patient/update', 'put', patient)
}
// 根据id删除患者
export function deletPatient(id: string) {
  return request(`/patient/del/${id}`, 'delete')
}
