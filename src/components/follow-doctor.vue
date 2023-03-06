<script setup lang="ts">
// 引入类型---
import type { DoctorList, PageParams } from '@/types/consult'
// 组件---
import DoctorCard from './doctor-card.vue'
// 第三方插件---
import { useWindowSize } from '@vueuse/core'
// 引入接口api---
import { getDoctor } from '@/services/consult'
// 引入vue组合式API---
import { ref } from 'vue'
// 使用 VueUse--
const { width } = useWindowSize()
// ----手写监听---
// const width = ref(window.innerWidth)
// window.onresize = () => {
//   width.value = window.innerWidth
// }
const doctorList = ref<DoctorList>()
const loadDoctorList = async (data: PageParams) => {
  const res = await getDoctor(data)
  doctorList.value = res.data.rows
}
loadDoctorList({ current: 1, pageSize: 5 })
</script>

<template>
  <div class="follow-doctor">
    <div className="head">
      <p>推荐关注</p>
      <a href="javascript:;"> 查看更多<i class="van-icon van-icon-arrow" /></a>
    </div>
    <div class="body">
      <!-- swipe 组件 -->
      <van-swipe
        :width="(145 / 375) * width"
        :show-indicators="false"
        :loop="false"
      >
        <van-swipe-item v-for="item in doctorList" :key="item.id">
          <doctor-card :item="item" />
        </van-swipe-item>
      </van-swipe>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.follow-doctor {
  background-color: var(--cp-bg);
  height: 250px;
  .head {
    display: flex;
    justify-content: space-between;
    height: 45px;
    align-items: center;
    padding: 0 15px;
    font-size: 13px;
    > a {
      color: var(--cp-tip);
    }
  }
  .body {
    width: 100%;
    overflow: hidden;
  }
}
</style>
