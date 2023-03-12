<script setup lang="ts">
import type { ConsultType } from '@/enums'
import type { ConsultOrderItem, ConsultOrderListParams } from '@/types/consult'
import { OrderType } from '@/enums'
import { getConsultOrderList } from '@/services/consult'
import ConsultItem from './ConsultItem.vue'
import { ref } from 'vue'
const props = defineProps<{
  type: ConsultType
}>()
const consultList = ref<ConsultOrderItem[]>([])
const current = ref(1)
const pageSize = ref(5)
const loading = ref(false)
const finished = ref(false)
const loadConsultList = async () => {
  const res = await getConsultOrderList({
    type: props.type,
    current: current.value,
    pageSize: pageSize.value
  })
  consultList.value.push(...res.data.rows)
  loading.value = false
  console.log(res.data)
  if (current.value >= res.data.pageTotal) {
    finished.value = true
  } else {
    current.value++
  }
}
const onCancel = (id: string) => {
  const i = consultList.value.findIndex((v) => v.id === id)
  consultList.value[i].status = OrderType.ConsultCancel
  consultList.value[i].statusValue = '已取消'
}
const onDelete = (id: string) => {
  consultList.value = consultList.value.filter((item) => item.id !== id)
}
</script>

<template>
  <div class="consult-list">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="loadConsultList"
    >
      <consult-item
        v-for="item in consultList"
        :key="item.id"
        :data="item"
        @cancel="onCancel"
        @delete="onDelete"
      />
    </van-list>
  </div>
</template>

<style lang="scss" scoped>
.consult-list {
  padding: 10px 15px;
}
</style>
