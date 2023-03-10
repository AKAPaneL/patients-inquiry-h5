<script setup lang="ts">
import cpIcon from '@/components/cp-icon.vue'
import { uploadImage } from '@/services/consult'
import type { Image } from '@/types/consult'
import type { UploaderFileListItem } from 'vant'
import { showLoadingToast, showFailToast } from 'vant'
import { ref } from 'vue'
defineProps<{
  disabled: boolean
}>()
const emit = defineEmits<{
  (e: 'send-text', value: string): void
  (e: 'send-img', value: Image): void
}>()
const text = ref<string>('')
const sendText = () => {
  emit('send-text', text.value)
  text.value = ''
}
const sendImg = (item: UploaderFileListItem) => {
  if (Array.isArray(item)) return //现在不支持上传多个文件
  if (!item.file) return
  // 上传接口
  const toast = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: '发送中'
  })
  uploadImage(item.file)
    .then((res) => {
      emit('send-img', res.data)
      toast.close()
    })
    .catch(() => {
      showFailToast('发送失败')
    })
  return undefined
}
</script>

<template>
  <div class="room-action">
    <van-field
      type="text"
      class="input"
      :border="false"
      placeholder="问医生"
      autocomplete="off"
      :disabled="disabled"
      v-model="text"
      @keyup.enter="sendText"
    ></van-field>
    <van-uploader
      :preview-image="false"
      :disabled="disabled"
      :after-read="sendImg"
    >
      <cp-icon name="consult-img" />
    </van-uploader>
  </div>
</template>

<style lang="scss" scoped>
.room-action {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 60px;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  z-index: 1;
  box-sizing: border-box;
  .input {
    background-color: var(--cp-bg);
    border: none;
    border-radius: 25px;
    margin-right: 10px;
    padding: 8px 15px;
  }
  .cp-icon {
    width: 24px;
    height: 24px;
  }
}
</style>
