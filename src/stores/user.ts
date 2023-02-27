import type { User } from '../types/user'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStroe = defineStore(
  'cp-user',
  () => {
    // 用户数据
    const user = ref<User | null>(null)
    //修改用户信息 函数
    const setUser = (u: User) => {
      user.value = u
    }

    //重置用户数据方法
    const delUser = () => {
      user.value = null
    }
    return { user, setUser, delUser }
  },
  {
    persist: true
  }
)
