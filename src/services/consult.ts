//首页文章接口
import type { KnowledgeParams, KnowledgePage } from '@/types/consult'
import { request } from '@/utils/request'
// 获取百科文章列表
export function getKnowledgePage(data: KnowledgeParams) {
  return request<KnowledgePage>('/patient/home/knowledge', 'get', data)
}
// 获取关注的医生列表
export function getLikeDoctor() {
  return request('/page/doc')
}
