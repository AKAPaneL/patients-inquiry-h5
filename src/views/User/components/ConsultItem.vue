<script setup lang="ts">
import type { ConsultOrderItem } from '@/types/consult'
import { OrderType } from '@/enums'
import { ref, computed } from 'vue'
import type { PopoverAction } from 'vant'
import { cancelOrder, deleteOrder } from '@/services/consult'
import { showSuccessToast, showFailToast, showLoadingToast } from 'vant'
import { useShowPrescription } from '@/composable/index'

const props = defineProps<{
  data: ConsultOrderItem
}>()
const emit = defineEmits<{
  (e: 'cancel', id: string): void
  (e: 'delete', id: string): void
}>()
const showPopover = ref(false)
const actions = computed(() => {
  return [
    { text: '查看处方', disabled: !props.data.prescriptionId },
    { text: '删除订单' }
  ]
})
// 取消订单
const canceConsultlOrder = () => {
  showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: '取消中...'
  })
  cancelOrder(props.data.id)
    .then(() => {
      showSuccessToast('取消成功')
      emit('cancel', props.data.id)
    })
    .catch(() => {
      showFailToast('取消失败')
    })
}
// 删除订单
const deleteConsultOrder = () => {
  showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: '删除中...'
  })
  deleteOrder(props.data.id)
    .then(() => {
      showSuccessToast('删除成功')
      emit('delete', props.data.id)
    })
    .catch(() => {
      showFailToast('删除失败')
    })
}
const { showPrescription } = useShowPrescription()
const onSelect = (action: PopoverAction) => {}
</script>

<template>
  <div class="consult-item">
    <div class="head van-hairline--bottom">
      <img class="img" src="@/assets/avatar-doctor.svg" />
      <p>{{ data.docInfo?.name || '暂未分配医生' }}</p>
      <span
        :class="{
          orange: data.status === OrderType.ConsultPay,
          green: data.status === OrderType.ConsultChat
        }"
        >{{ data.statusValue }}</span
      >
    </div>
    <div class="body">
      <div class="body-row">
        <div class="body-label">病情描述</div>
        <div class="body-value">{{ data.illnessDesc }}</div>
      </div>
      <div class="body-row">
        <div class="body-label">价格</div>
        <div class="body-value">¥ {{ data.payment }}.00</div>
      </div>
      <div class="body-row">
        <div class="body-label">创建时间</div>
        <div class="body-value tip">{{ data.createTime }}</div>
      </div>
    </div>
    <div class="foot" v-if="data.status === OrderType.ConsultPay">
      <van-button
        class="gray"
        plain
        size="small"
        round
        @click="canceConsultlOrder"
        >取消问诊</van-button
      >
      <van-button
        type="primary"
        plain
        size="small"
        round
        :to="`/user/consult/${data.id}`"
      >
        去支付
      </van-button>
    </div>
    <div class="foot" v-if="data.status === OrderType.ConsultWait">
      <van-button
        class="gray"
        plain
        size="small"
        round
        @click="canceConsultlOrder"
        >取消问诊</van-button
      >
      <van-button
        type="primary"
        plain
        size="small"
        round
        :to="`/room?orderId=${data.id}`"
      >
        继续沟通
      </van-button>
    </div>
    <div class="foot" v-if="data.status === OrderType.ConsultChat">
      <van-button
        v-if="data.prescriptionId"
        class="gray"
        plain
        size="small"
        round
        @click="showPrescription(data.prescriptionId)"
      >
        查看处方
      </van-button>
      <van-button
        type="primary"
        plain
        size="small"
        round
        :to="`/room?orderId=${data.id}`"
      >
        继续沟通
      </van-button>
    </div>
    <div class="foot" v-if="data.status === OrderType.ConsultComplete">
      <div class="more">
        <van-popover
          placement="top-start"
          v-model:show="showPopover"
          :actions="actions"
          @select="onSelect"
        >
          <template #reference> 更多 </template>
        </van-popover>
      </div>
      <van-button
        class="gray"
        plain
        size="small"
        round
        :to="`/room?orderId=${data.id}`"
      >
        问诊记录
      </van-button>
      <van-button
        v-if="!data.evaluateId"
        type="primary"
        plain
        size="small"
        round
      >
        去评价
      </van-button>
      <van-button v-else class="gray" plain size="small" round>
        查看评价
      </van-button>
    </div>
    <div class="foot" v-if="data.status === OrderType.ConsultCancel">
      <van-button
        class="gray"
        plain
        size="small"
        round
        @click="deleteConsultOrder"
        >删除订单</van-button
      >
      <van-button type="primary" plain size="small" round to="/"
        >咨询其他医生</van-button
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
.consult-item {
  border-radius: 4px;
  box-shadow: 0px 0px 22px 0px rgba(245, 245, 245, 0.1);
  background-color: #fff;
  margin-bottom: 10px;
  .head {
    display: flex;
    align-items: center;
    height: 50px;
    padding: 0 15px;
    .img {
      width: 20px;
      height: 20px;
    }
    > p {
      flex: 1;
      font-size: 15px;
      padding-left: 10px;
    }
    > span {
      color: var(--cp-tag);
      &.orange {
        color: #f2994a;
      }
      &.green {
        color: var(--cp-primary);
      }
    }
  }
  .body {
    padding: 15px 15px 8px 15px;
    .body-row {
      display: flex;
      margin-bottom: 7px;
    }
    .body-label {
      width: 62px;
      font-size: 13px;
      color: var(--cp-tip);
    }
    .body-value {
      width: 250px;
      &.tip {
        color: var(--cp-tip);
      }
    }
  }
  .foot {
    padding: 0 15px 15px 15px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .van-button {
      margin-left: 10px;
      padding: 0 16px;
      &.gray {
        color: var(--cp-text3);
        background-color: var(--cp-bg);
      }
    }
    .more {
      color: var(--cp-tag);
      flex: 1;
      font-size: 13px;
    }
  }
}
</style>
