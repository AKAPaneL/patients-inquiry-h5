<script setup lang="ts">
import type { Message, TimeMessages } from '@/types/room'
import type { ConsultOrderItem } from '@/types/consult'
import type { Image } from '@/types/consult'
import { MsgType, OrderType } from '@/enums/index'
import RoomStatus from '@/views/Room/components/room-status.vue'
import roomAction from './components/room-action.vue'
import roomMessage from './components/room-message.vue'
import { getConsultOrderDetail } from '@/services/consult'
import { onUnmounted, ref, nextTick, provide } from 'vue'
import { useUserStroe } from '@/stores/user'
import { useRoute } from 'vue-router'
import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'

let socket: Socket
const store = useUserStroe()
const route = useRoute()
const list = ref<Message[]>([])
const init = ref(true)
const consult = ref<ConsultOrderItem>()

const loadConsultOrderDetail = async () => {
  const res = await getConsultOrderDetail(route.query.orderId as string)
  consult.value = res.data
  console.log(res)
}
// 发送文字
const sendText = (e: string) => {
  console.log(`发送数据：${e}`)
  socket.emit('sendChatMsg', {
    from: store.user?.id,
    to: consult.value?.docInfo?.id,
    msgType: MsgType.MsgText,
    msg: {
      content: e
    }
  })
}
// 发送图片方法
const sendImg = (e: Image) => {
  console.log('发送图片')
  socket.emit('sendChatMsg', {
    from: store.user?.id,
    to: consult.value?.docInfo?.id,
    msgType: MsgType.MsgImage,
    msg: {
      picture: e
    }
  })
}
loadConsultOrderDetail()
// 断开长连接
onUnmounted(() => {
  socket.close()
})
// 建立连接
socket = io('https://consult-api.itheima.net/', {
  auth: {
    token: `Bearer ${store.user?.token}`
  },
  query: {
    orderId: route.query.orderId
  }
})
// 建立连接成功
socket.on('connect', () => {
  list.value = []
})
// 监听消息记录
socket.on('chatMsgList', async (res: { data: TimeMessages[] }) => {
  console.log(res.data)
  let arr: Message[] = []
  res.data.forEach((item) => {
    arr.push({
      msgType: 31,
      msg: { content: item.createTime },
      createTime: item.createTime,
      id: item.createTime
    })
    arr.push(...item.items)
  })
  // 获取第一个信息元素dom
  const firstMsgDom = document.querySelector('.msg')
  // 获取第一个信息元素相对视口顶部距离
  const top = firstMsgDom?.getBoundingClientRect().top

  list.value.unshift(...arr)
  loading.value = false
  // 初始化消息的时候把页面滚动到最底部
  await nextTick()
  socket.emit('updateMsgStatus', arr[arr.length - 1].id)
  if (!init.value) {
    firstMsgDom?.scrollIntoView()
    if (top) window.scrollBy(0, -top)
    return
  }
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth'
  })
  init.value = false
})
// 监听订单状态改变
socket.on('statusChange', (res) => {
  loadConsultOrderDetail()
})

// 监听接收消息
socket.on('receiveChatMsg', async (res) => {
  list.value.push(res)
  // 等待页面渲染结束之后
  await nextTick()
  socket.emit('updateMsgStatus', res.id)
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth'
  })
})

// socket.on('error', (event) => {
//   // 错误异常消息
//   console.log('error')
// })
// socket.on('disconnect', () => {
//   // 已经断开连接
//   console.log('disconnect')
// })
const loading = ref(true)
const onRefresh = () => {
  socket.emit(
    'getChatMsgList',
    20,
    list.value[0].createTime,
    route.query.orderId
  )
}
// 修改评价卡片的方法
const completeEva = (score: number) => {
  const item = list.value.find((item) => item.msgType === MsgType.CardEvaForm)
  if (item) {
    item.msg.evaluateDoc = { score }
    item.msgType = MsgType.CardEva
  }
}
// 把方法传给后代
provide('completeEva', completeEva)
provide('consult', consult)
</script>

<template>
  <div class="room-page">
    <cp-nav-bar title="医生问诊室" />
    <room-status :status="consult?.status" :countdown="consult?.countdown" />
    <van-pull-refresh v-model="loading" @refresh="onRefresh">
      <room-message :list="list" :doc-avator="consult?.docInfo?.avatar" />
    </van-pull-refresh>
    <room-action
      :disabled="consult?.status !== OrderType.ConsultChat"
      @send-text="sendText"
      @send-img="sendImg"
    />
  </div>
</template>

<style lang="scss" scoped>
.room-page {
  padding-top: 45px;
  padding-bottom: 60px;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: var(--cp-bg);
  .van-pull-refresh {
    width: 100%;
    min-height: calc(100vh - 150px);
  }
}
</style>
