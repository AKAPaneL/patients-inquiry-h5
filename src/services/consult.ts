//首页文章接口
import type {
  KnowledgeParams,
  KnowledgePage,
  DoctorPage,
  PageParams,
  FollowType,
  TopDep,
  Image,
  PartialConsult,
  ConsultOrderPreData,
  ConsultOrderPreParams,
  ConsultOrderItem
} from '@/types/consult'
import { IllnessTime } from '@/enums'

import { request } from '@/utils/request'
// 获取百科文章列表
export function getKnowledgePage(data: KnowledgeParams) {
  return request<KnowledgePage>('/patient/home/knowledge', 'get', data)
}
// 获取关注的医生列表
export function getDoctor(data: PageParams) {
  return request<DoctorPage>('/home/page/doc', 'get', data)
}
// 关注操作--关注或者取消
export function followOrUnfollow(id: string, type: FollowType) {
  return request('/like', 'post', { id, type })
}
//找医生--查询所有科室-层级
export function getAllDep() {
  return request<TopDep[]>('/dep/all')
}
/**上传文件接口 */
export function uploadImage(data: File) {
  const formData = new FormData()
  formData.append('file', data)
  return request<Image>('/upload', 'post', formData)
}

// 支付页-急速问诊订单信息获取
export function getConsultOrderPre(data: ConsultOrderPreParams) {
  return request<ConsultOrderPreData>('/patient/consult/order/pre', 'get', data)
}

// 保存成支付订单
export function createConsultOrder(data: PartialConsult) {
  return request<{ id: string }>('/patient/consult/order', 'post', data)
}

//支付接口
export function getConsultOrderPayUrl(data: {
  paymentMethod: 0 | 1
  orderId: string
  payCallback: string
}) {
  return request<{ payUrl: 'string' }>('/patient/consult/pay', 'post', data)
}

// 枚举类型
export const timeOptions = [
  { label: '一周内', value: IllnessTime.Week },
  { label: '一月内', value: IllnessTime.Month },
  { label: '半年内', value: IllnessTime.HalfYear },
  { label: '大于半年', value: IllnessTime.More }
]
export const flagOptions = [
  { label: '就诊过', value: 0 },
  { label: '没就诊过', value: 1 }
]

// 根据订单id:orderId查询对应订单详情和状态
export function getConsultOrderDetail(orderId: string) {
  return request<ConsultOrderItem>('/patient/consult/order/detail', 'get', {
    orderId
  })
}

// 根据处方ID查询处方单
export function getPrescriptionPic(id: string) {
  return request<{ url: string }>(`/patient/consult/prescription/${id}`, 'get')
}
