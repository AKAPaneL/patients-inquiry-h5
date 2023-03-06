import { ref } from 'vue'
import { followOrUnfollow } from '@/services/consult'
import type { FollowType } from '@/types/consult'
export const useFollow = (type: FollowType = 'doc') => {
  const loading = ref(false)
  const follow = async (item: { id: string; likeFlag: 0 | 1 }) => {
    // 节流阀? 组件自带
    // if (loading.value === true) return
    loading.value = true
    try {
      await followOrUnfollow(item.id, type)
      item.likeFlag = item.likeFlag ? 0 : 1
    } finally {
      loading.value = false
    }
  }
  return {
    loading,
    follow
  }
}
