<script setup lang="ts">
import cpNavBar from '@/components/cp-nav-bar.vue'
import { mobileRules, passwordRules, codeRules } from '@/utils/rules'
import { ref, onUnmounted } from 'vue'
import { loginByPassword, sendMobileCode, loginByCode } from '@/services/user' //导入接口
import { showFailToast } from 'vant'
import { useUserStroe } from '@/stores/user'
import { showNotify } from 'vant'
import router from '@/router'
import { useRoute } from 'vue-router'

const mobile = ref<string>('13230000072')
const password = ref<string>('')
const agree = ref<boolean>(false)
const isPass = ref<boolean>(true)
const show = ref<boolean>(false)
const code = ref<string>('')
const form = ref()
const time = ref(0)
const store = useUserStroe()
const route = useRoute()

//登录逻辑
const onLogin = async () => {
  if (!agree.value) return showFailToast('请同意协议')
  let res
  if (isPass.value) {
    res = await loginByPassword(mobile.value, password.value)
  } else {
    res = await loginByCode(mobile.value, code.value)
  }
  showNotify({ type: 'success', message: '登录成功' })
  store.setUser(res.data)
  router.push((route.query.returnUrl as string) || '/')
}
let timeId: number
// 发送验证码
const onSendMobileCode = async () => {
  if (time.value > 0) return
  // 发送前校验手机格式
  await form.value?.validate('mobile')

  time.value = 60
  timeId = setInterval(() => {
    time.value -= 1
    if (time.value <= 0) clearInterval(timeId)
  }, 1000)

  const res = await sendMobileCode(mobile.value, 'login')
  code.value = res.data.code
}
onUnmounted(() => {
  clearInterval(timeId)
})
</script>

<template>
  <div class="login-page">
    <cp-nav-bar
      title="登录"
      right-text="注册"
      @click-right="$router.push('/register')"
    ></cp-nav-bar>
    <!-- 头部 -->
    <div class="login-head">
      <h3>{{ isPass ? '密码登录' : '短信验证码登录' }}</h3>
      <a href="javascript:;" @click="isPass = !isPass">
        <span>{{ !isPass ? '密码登录' : '短信验证码登录' }}</span>
        <van-icon name="arrow"></van-icon>
      </a>
    </div>
    <!-- 表单 -->
    <van-form autocomplete="off" @submit="onLogin" ref="form">
      <van-field
        placeholder="请输入手机号"
        type="tel"
        v-model="mobile"
        :rules="mobileRules"
        name="mobile"
      ></van-field>
      <van-field
        v-if="isPass"
        placeholder="请输入密码"
        v-model="password"
        :type="show ? 'text' : 'password'"
        :rules="passwordRules"
      >
        <template #button>
          <van-icon
            @click="show = !show"
            :name="`/index/src/icons/login/eye-${show ? 'on' : 'off'}.svg`"
          ></van-icon>
        </template>
      </van-field>
      <van-field
        v-else
        v-model="code"
        placeholder="短信验证码"
        :rules="codeRules"
      >
        <template #button>
          <span class="btn-send" @click="onSendMobileCode">{{
            time > 0 ? `${time}S秒之后发送` : '发送验证码'
          }}</span>
        </template>
      </van-field>
      <div class="cp-cell">
        <van-checkbox v-model="agree">
          <span>我已同意</span>
          <a href="javascript:;">用户协议</a>
          <span>及</span>
          <a href="javascript:;">隐私条款</a>
        </van-checkbox>
      </div>
      <div class="cp-cell">
        <van-button block round type="primary" native-type="submit"
          >登 录</van-button
        >
      </div>
      <div class="cp-cell">
        <a href="javascript:;">忘记密码？</a>
      </div>
    </van-form>
    <!-- 底部 -->
    <div class="login-other">
      <van-divider>第三方登录</van-divider>
      <div class="icon">
        <img src="@/assets/qq.svg" alt="" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login {
  &-page {
    padding-top: 46px;
  }
  &-head {
    display: flex;
    padding: 30px 30px 50px;
    justify-content: space-between;
    align-items: flex-end;
    line-height: 1;
    h3 {
      font-weight: normal;
      font-size: 24px;
    }
    a {
      font-size: 15px;
    }
  }
  &-other {
    margin-top: 60px;
    padding: 0 30px;
    .icon {
      display: flex;
      justify-content: center;
      img {
        width: 36px;
        height: 36px;
        padding: 4px;
      }
    }
  }
}
.van-form {
  padding: 0 14px;
  .cp-cell {
    height: 52px;
    line-height: 24px;
    padding: 14px 16px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    .van-checkbox {
      a {
        color: var(--cp-primary);
        padding: 0 5px;
      }
    }
  }
  .btn-send {
    color: var(--cp-primary);
    &.active {
      color: rgba(22, 194, 163, 0.5);
    }
  }
}
</style>
