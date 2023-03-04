<script setup lang="ts">
import KnowledgeCard from './konwledge-card.vue'
import type { KnowledgeType, KnowledgeList } from '@/types/consult'
import { getKnowledgePage } from '@/services/consult'
import { ref } from 'vue'
const props = defineProps<{
  type: KnowledgeType
}>()
const current = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const finished = ref(false)

const KnowledgePageList = ref<KnowledgeList>([])

const getKnowledgePageList = async () => {
  const res = await getKnowledgePage({
    current: current.value,
    pageSize: pageSize.value,
    type: props.type
  })
  KnowledgePageList.value.push(...res.data.rows)
  if (res.data.pageTotal <= current.value) {
    finished.value = true
  } else {
    current.value++
  }
  loading.value = false
}
</script>

<template>
  <div class="knowledge-list">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="getKnowledgePageList"
    >
      <knowledge-card
        v-for="item in KnowledgePageList"
        :key="item.id"
        :item="item"
      ></knowledge-card>
    </van-list>
  </div>
</template>

<style lang="scss" scoped>
.knowledge-list {
  padding: 0 15px;
}
</style>
