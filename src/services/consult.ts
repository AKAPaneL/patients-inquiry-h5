//首页文章接口
import type {
  KnowledgeParams,
  KnowledgePage,
  DoctorPage,
  PageParams,
  FollowType,
  TopDep
} from '@/types/consult'
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
