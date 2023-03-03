<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()

const onClickLeft = () => {
  if (props.back) {
    return props.back()
  }
  // TODO 点击左侧返回按钮
  if (history.state?.back) {
    router.back()
  } else {
    router.push('/')
  }
}
const props = defineProps<{
  title?: string
  rightText?: string
  back?: () => void
}>()
const emit = defineEmits<{
  (e: 'rightClick'): void
}>()

const onClickRight = () => {
  // TODO 点击右侧文字按钮
  emit('rightClick')
}
</script>

<template>
  <van-nav-bar
    fixed
    left-arrow
    :title="title"
    :right-text="rightText"
    placeholder
    @click-left="onClickLeft"
    @click-right="onClickRight"
  ></van-nav-bar>
</template>

<style lang="scss" scoped>
:deep() {
  .van-nav-bar {
    &__arrow {
      font-size: 18px;
      color: var(--cp-text1);
    }
    &__text {
      font-size: 15px;
    }
  }
}
</style>
