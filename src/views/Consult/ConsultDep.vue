<script setup lang="ts">
import { ref, computed } from 'vue'
import { getAllDep } from '@/services/consult'
import type { TopDep } from '@/types/consult'
import cpNavBar from '@/components/cp-nav-bar.vue'
import { useConsultStore } from '@/stores/modules/consult'
const active = ref(0)
const allDep = ref<TopDep[]>([])
const consultStore = useConsultStore()
const subDep = computed(() => {
  return allDep.value[active.value]?.child
})
const loadAllDep = async () => {
  const res = await getAllDep()
  console.log(res)
  allDep.value = res.data
}
loadAllDep()
</script>

<template>
  <div class="consult-dep-page">
    <cp-nav-bar title="选择科室" />
    <div class="wrapper">
      <van-sidebar v-model="active">
        <van-sidebar-item
          :title="item.name"
          v-for="item in allDep"
          :key="item.id"
        />
      </van-sidebar>
      <div class="sub-dep">
        <router-link
          to="/consult/illness"
          v-for="item in subDep"
          :key="item.id"
          @click="consultStore.setDep(item.id)"
          >{{ item.name }}</router-link
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.van-sidebar {
  width: 114px;
  &-item {
    padding: 14px;
    color: var(--cp-tag);
    &--select {
      color: var(--cp-main);
      font-weight: normal;
      &::before {
        display: none;
      }
    }
  }
}
.consult-dep-page {
  .wrapper {
    height: calc(100vh - 46px);
    overflow: hidden;
    display: flex;
    .sub-dep {
      flex: 1;
      height: 100%;
      overflow-y: auto;
      > a {
        display: block;
        padding: 14px 30px;
        color: var(--cp-dark);
      }
    }
  }
}
</style>
