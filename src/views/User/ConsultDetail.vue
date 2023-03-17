<script setup lang="ts">
import { OrderType } from '@/enums'
import { getConsultOrderDetail } from '@/services/consult'
import type { ConsultOrderItem } from '@/types/consult'
import CpConsultMore from '@/components/cp-consult-more.vue'
import {
  showSuccessToast,
  showFailToast,
  showLoadingToast,
  showToast
} from 'vant'
import {
  cancelOrder,
  deleteOrder,
  getConsultOrderPayUrl
} from '@/services/consult'
import { getConsultFlagText, getIllnessTimeText } from '@/utils/filter'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useShowPrescription } from '@/composable'
import { useClipboard } from '@vueuse/core'
const route = useRoute()
const router = useRouter()
const { showPrescription } = useShowPrescription()
const item = ref<ConsultOrderItem>()
onMounted(async () => {
  const res = await getConsultOrderDetail(route.params.id as string)
  item.value = res.data
  console.log(res.data)
})
// 取消订单
const canceConsultlOrder = (item?: ConsultOrderItem) => {
  if (!item) return
  showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: '取消中...'
  })
  cancelOrder(route.params.id as string)
    .then(() => {
      item.status = OrderType.ConsultCancel
      item.statusValue = '已取消'
      showSuccessToast('取消成功')
    })
    .catch(() => {
      showFailToast('取消失败')
    })
}
// 删除订单
const deleteConsultOrder = (item?: ConsultOrderItem) => {
  if (!item) return
  showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: '删除中...'
  })
  deleteOrder(route.params.id as string)
    .then(() => {
      showSuccessToast('删除成功')
      router.back()
    })
    .catch(() => {
      showFailToast('删除失败')
    })
}
const { copy, isSupported } = useClipboard()
// 复制
const onCopy = async () => {
  if (!isSupported) return showFailToast('未授权，不可使用')
  if (!item.value) return
  await copy(item.value?.orderNo)
  showSuccessToast('已复制到剪切板')
}
const show = ref(false)
const paymentMethod = ref<0 | 1>()
// 调用支付
const pay = async () => {
  if (paymentMethod.value === undefined) return showToast('请选择支付方式')
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0
  })
  const res = await getConsultOrderPayUrl({
    paymentMethod: paymentMethod.value,
    orderId: item.value?.id as string,
    payCallback: 'http://127.0.0.1:5173/index/room'
  })
  window.location.href = res.data.payUrl
}
const onClose = () => {
  show.value = false
}
</script>

<template>
  <!-- 骨架屏幕 -->
  <div class="consult-detail-page" v-if="!item">
    <cp-nav-bar title="问诊详情" />
    <van-skeleton title :row="4" style="margin-top: 30px" />
    <van-skeleton title :row="4" style="margin-top: 30px" />
  </div>
  <div class="consult-detail-page" v-else>
    <div class="detail-time" v-if="item.status === OrderType.ConsultPay">
      请在
      <van-count-down :time="item.countdown * 1000" />
      内完成支付，超时订单将取消
    </div>
    <cp-nav-bar title="问诊详情" />
    <div class="detail-head">
      <div class="text">
        <h3>图文问诊 {{ item.payment }} 元</h3>
        <span
          class="sta"
          :class="{
            orange: item.status === OrderType.ConsultPay,
            green: item.status === OrderType.ConsultChat
          }"
          >{{ item.statusValue }}</span
        >
        <p class="tip">服务医生信息</p>
      </div>
      <div class="card">
        <img class="avatar" src="@/assets/avatar-doctor.svg" alt="" />
        <p class="doc">
          <span>极速问诊</span>
          <span>{{ item.docInfo?.name }}</span>
        </p>
        <van-icon name="arrow" />
      </div>
    </div>
    <div class="detail-patient">
      <van-cell-group :border="false">
        <van-cell
          title="患者信息"
          :value="`${item.patientInfo.name} | ${item.patientInfo.genderValue} | ${item.patientInfo.age}岁`"
        />
        <van-cell
          title="患病时长"
          :value="getIllnessTimeText(item.illnessTime)"
        />
        <van-cell
          title="就诊情况"
          :value="getConsultFlagText(item.consultFlag)"
        />
        <van-cell title="病情描述" :label="item.illnessDesc" />
      </van-cell-group>
    </div>
    <div class="detail-order">
      <h3>订单信息</h3>
      <van-cell-group :border="false">
        <van-cell title="订单编号">
          <template #value>
            <span class="copy" @click="onCopy">复制</span>
            {{ item.orderNo }}
          </template>
        </van-cell>
        <van-cell title="创建时间" :value="item.createTime" />
        <van-cell title="应付款" :value="`￥${item.payment}`" />
        <van-cell title="优惠券" :value="`-￥${item.couponDeduction}`" />
        <van-cell title="积分抵扣" :value="`-￥${item.pointDeduction}`" />
        <van-cell
          title="实付款"
          :value="`￥${item.actualPayment}`"
          class="price"
        />
      </van-cell-group>
    </div>
    <div
      class="detail-action van-hairline--top"
      v-if="item.status === OrderType.ConsultPay"
    >
      <div class="price">
        <span>需付款</span>
        <span>￥{{ item.actualPayment }}</span>
      </div>
      <van-button type="default" round @click="canceConsultlOrder(item)"
        >取消问诊</van-button
      >
      <van-button type="primary" round @click="show = true"
        >继续支付</van-button
      >
    </div>
    <div
      class="detail-action van-hairline--top"
      v-if="item.status === OrderType.ConsultWait"
    >
      <van-button type="default" round @click="canceConsultlOrder(item)"
        >取消问诊</van-button
      >
      <van-button type="primary" round :to="`/room?orderId=${item.id}`"
        >继续沟通</van-button
      >
    </div>
    <div
      class="detail-action van-hairline--top"
      v-if="item.status === OrderType.ConsultChat"
    >
      <van-button
        type="default"
        round
        v-if="item.prescriptionId"
        @click="showPrescription(item?.prescriptionId)"
        >查看处方</van-button
      >
      <van-button type="primary" round :to="`/room?orderId=${item.id}`"
        >继续沟通</van-button
      >
    </div>
    <div
      class="detail-action van-hairline--top"
      v-if="item.status === OrderType.ConsultComplete"
    >
      <cp-consult-more
        :disabled="!item.prescriptionId"
        @on-preview="showPrescription(item?.prescriptionId)"
        @on-delete="deleteConsultOrder(item)"
      ></cp-consult-more>
      <van-button type="default" round :to="`/room?orderId=${item.id}`"
        >问诊记录</van-button
      >
      <van-button type="primary" round v-if="item.evaluateId"
        >写评价</van-button
      >
      <van-button type="default" round v-else>查看评价</van-button>
    </div>
    <div
      class="detail-action van-hairline--top"
      v-if="item.status === OrderType.ConsultCancel"
    >
      <van-button type="default" round @click="deleteConsultOrder(item)"
        >删除订单</van-button
      >
      <van-button type="primary" round to="/">咨询其他医生</van-button>
    </div>
  </div>
  <!-- 支付 -->
  <van-action-sheet
    v-model:show="show"
    title="选择支付方式"
    :before-close="onClose"
    :closeable="true"
  >
    <div class="pay-type">
      <p class="amount">￥{{ item?.payment }}</p>
      <van-cell-group>
        <van-cell title="微信支付" @click="paymentMethod = 0">
          <template #icon><cp-icon name="consult-wechat" /></template>
          <template #extra
            ><van-checkbox :checked="paymentMethod === 0"
          /></template>
        </van-cell>
        <van-cell title="支付宝支付" @click="paymentMethod = 1">
          <template #icon><cp-icon name="consult-alipay" /></template>
          <template #extra
            ><van-checkbox :checked="paymentMethod === 1"
          /></template>
        </van-cell>
      </van-cell-group>
      <div class="btn">
        <van-button type="primary" round block @click="pay"
          >立即支付</van-button
        >
      </div>
    </div>
  </van-action-sheet>
</template>

<style lang="scss" scoped>
.consult-detail-page {
  padding: 1px 0 110px 0;
}
.detail-head {
  height: 140px;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 135px;
    background: linear-gradient(
      180deg,
      rgba(44, 181, 165, 0),
      rgba(44, 181, 165, 0.2)
    );
    border-bottom-left-radius: 150px 20px;
    border-bottom-right-radius: 150px 20px;
  }
  padding: 15px;
  .text {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 10px 3px;
    .sta {
      color: var(--cp-tag);
      font-weight: 500;
      font-size: 16px;
      &.green {
        color: var(--cp-primary);
      }
      &.orange {
        color: #f2994a;
      }
    }
    .tip {
      width: 100%;
      color: var(--cp-text3);
      margin-top: 5px;
    }
  }
  .card {
    height: 74px;
    background-color: #fff;
    border-radius: 8px;
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 15px;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
    .avatar {
      width: 38px;
      height: 38px;
    }
    .doc {
      flex: 1;
      padding-left: 15px;
      > span {
        display: block;
        font-size: 16px;
        &:last-child {
          font-size: 13px;
          color: var(--cp-text3);
        }
      }
    }
    .van-icon {
      color: var(--cp-tip);
    }
  }
}
.detail-patient {
  &::after {
    content: '';
    display: block;
    height: 12px;
    background-color: var(--cp-bg);
  }
}
.detail-order {
  > h3 {
    padding: 10px 18px;
    font-weight: normal;
  }
  .copy {
    padding: 2px 10px;
    border: 1px solid var(--cp-primary);
    background-color: var(--cp-plain);
    color: var(--cp-primary);
    font-size: 12px;
    border-radius: 12px;
    margin-right: 10px;
  }
  :deep(.van-cell__title) {
    width: 70px;
    flex: none;
  }
  .price :deep(.van-cell__value) {
    font-size: 16px;
    color: var(--cp-price);
  }
}
.detail-action {
  height: 65px;
  width: 100%;
  position: fixed;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  background-color: #fff;
  justify-content: flex-end;
  padding: 0 15px;
  box-sizing: border-box;
  .price {
    flex: 1;
    > span:last-child {
      font-size: 18px;
      color: var(--cp-price);
      padding-left: 5px;
    }
  }
  .van-button {
    margin-left: 10px;
    padding-left: 17px;
    padding-right: 17px;
  }
  :deep(.van-button--default) {
    background-color: var(--cp-bg);
    color: var(--cp-text3);
  }
}
.van-cell {
  padding-left: 18px;
  padding-right: 18px;
}
.detail-time {
  position: fixed;
  z-index: 10;
  left: 0;
  bottom: 65px;
  width: 100%;
  height: 44px;
  background-color: #fff7eb;
  text-align: center;
  line-height: 44px;
  font-size: 13px;
  color: #f2994a;
  .van-count-down {
    display: inline;
    color: #f2994a;
  }
}
.pay-type {
  .amount {
    padding: 20px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
  }
  .btn {
    padding: 15px;
  }
  .van-cell {
    align-items: center;
    .cp-icon {
      margin-right: 10px;
      font-size: 18px;
    }
    .van-checkbox :deep(.van-checkbox__icon) {
      font-size: 16px;
    }
  }
}
</style>
