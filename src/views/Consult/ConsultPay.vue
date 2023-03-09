<script setup lang="ts">
import cpNavBar from '@/components/cp-nav-bar.vue'
import {
  showConfirmDialog,
  showFailToast,
  showLoadingToast,
  showToast
} from 'vant'
import { ref } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useConsultStore } from '@/stores/modules/consult'
// 导入接口
import {
  getConsultOrderPre,
  createConsultOrder,
  getConsultOrderPayUrl
} from '@/services/consult'
import { getPatientById } from '@/services/user'
// 导入类型
import type { ConsultOrderPreData } from '@/types/consult'
import type { Patient } from '@/types/user'

const route = useRoute()
const store = useConsultStore()
const payInfo = ref<ConsultOrderPreData>()
// 获取订单结果
const loadConsultOrderPre = async () => {
  const res = await getConsultOrderPre({
    type: store.consult.type,
    illnessType: store.consult.illnessType
  })
  payInfo.value = res.data
}
loadConsultOrderPre()
const patient = ref<Patient>()

const loadPatientById = async () => {
  console.log(store)
  if (store.consult.patientId) {
    const res = await getPatientById(store.consult.patientId)
    patient.value = res.data
    console.log(res.data)
  }
}
loadPatientById()
const agree = ref(false)
const show = ref(false)
const paymentMethod = ref<0 | 1>()
const orderId = ref('')
const submit = async () => {
  if (!agree.value) return showFailToast('请同意协议')
  const toast = showLoadingToast({
    duration: 0,
    message: '创建订单...',
    forbidClick: true,
    loadingType: 'spinner'
  })
  const res = await createConsultOrder(store.consult)
  toast.close()
  console.log(res.data)
  orderId.value = res.data.id
  show.value = true
}
const router = useRouter()

onBeforeRouteLeave(() => {
  if (orderId.value) return false
})

const onClose = () => {
  return showConfirmDialog({
    title: '取消支付',
    message: '取消支付将无法获得医生回复，医生接诊名额有限，是否确认关闭？',
    cancelButtonText: '仍要关闭',
    confirmButtonText: '继续支付'
  })
    .then(() => {
      show.value = true
      return false
    })
    .catch(() => {
      orderId.value = ''
      router.push('/user')
      return true
    })
}
const pay = async () => {
  if (paymentMethod.value === undefined) return showToast('请选择支付方式')
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0
  })
  const res = await getConsultOrderPayUrl({
    paymentMethod: paymentMethod.value,
    orderId: orderId.value,
    payCallback: 'http://127.0.0.1:5173/index/room'
  })
  window.location.href = res.data.payUrl
}
</script>

<template>
  <div class="consult-pay-page">
    <cp-nav-bar :title="route.meta.title || '支付页面'" />
    <div class="pay-info">
      <p class="tit">图文问诊 {{ payInfo?.payment }} 元</p>
      <img class="img" src="@/assets/avatar-doctor.svg" />
      <p class="desc">
        <span>极速问诊</span>
        <span>自动分配医生</span>
      </p>
    </div>
    <van-cell-group>
      <van-cell title="优惠券" :value="`￥${payInfo?.couponDeduction}`" />
      <van-cell title="积分抵扣" :value="`￥${payInfo?.pointDeduction}`" />
      <van-cell
        title="实付款"
        :value="`￥${payInfo?.actualPayment}`"
        class="pay-price"
      />
    </van-cell-group>
    <div class="pay-space"></div>
    <van-cell-group>
      <van-cell
        title="患者信息"
        :value="`${patient?.name} | ${patient?.genderValue} | ${patient?.age}岁`"
      ></van-cell>
      <van-cell title="病情描述" :label="store.consult.illnessDesc"></van-cell>
    </van-cell-group>
    <div class="pay-schema">
      <van-checkbox v-model="agree"
        >我已同意 <span class="text">支付协议</span></van-checkbox
      >
    </div>
    <van-submit-bar
      button-type="primary"
      :price="payInfo?.actualPayment ? payInfo.actualPayment * 100 : 0"
      button-text="立即支付"
      text-align="left"
      @click="submit"
    />
    <!-- 支付抽屉 -->
    <van-action-sheet
      v-model:show="show"
      title="选择支付方式"
      :before-close="onClose"
      :closeable="false"
    >
      <div class="pay-type">
        <p class="amount">￥{{ payInfo?.actualPayment }}</p>
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
  </div>
</template>

<style lang="scss" scoped>
.consult-pay-page {
  padding: 46px 0 50px 0;
}
.pay-info {
  display: flex;
  padding: 15px;
  flex-wrap: wrap;
  align-items: center;
  .tit {
    width: 100%;
    font-size: 16px;
    margin-bottom: 10px;
  }
  .img {
    margin-right: 10px;
    width: 38px;
    height: 38px;
    border-radius: 4px;
    overflow: hidden;
  }
  .desc {
    flex: 1;
    > span {
      display: block;
      color: var(--cp-tag);
      &:first-child {
        font-size: 16px;
        color: var(--cp-text2);
      }
    }
  }
}
.pay-price {
  ::v-deep() {
    .vam-cell__title {
      font-size: 16px;
    }
    .van-cell__value {
      font-size: 16px;
      color: var(--cp-price);
    }
  }
}
.pay-space {
  height: 12px;
  background-color: var(--cp-bg);
}
.pay-schema {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  .text {
    color: var(--cp-primary);
  }
}
::v-deep() {
  .van-submit-bar__button {
    font-weight: normal;
    width: 160px;
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
