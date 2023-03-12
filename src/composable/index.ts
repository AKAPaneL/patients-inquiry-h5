import { ref } from 'vue'
import { followOrUnfollow, getPrescriptionPic } from '@/services/consult'
import type { FollowType } from '@/types/consult'
import { showImagePreview, showLoadingToast } from 'vant'

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

// 显示处方单
export const useShowPrescription = () => {
  const showPrescription = async (id?: string) => {
    if (id) {
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
        message: '加载中...'
      })
      const res = await getPrescriptionPic(id)
      toast.close()
      showImagePreview([res.data.url])
    }
  }
  return { showPrescription }
}
