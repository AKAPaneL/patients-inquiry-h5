import { useUserStroe } from '@/stores/user'
import { createRouter, createWebHistory } from 'vue-router'
import { useConsultStore } from '@/stores/modules/consult'
import { showDialog } from 'vant'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/Layout/index.vue'),
      redirect: '/home',
      children: [
        {
          path: 'home',
          component: () => import('@/views/Home/index.vue'),
          meta: { title: '首页' }
        },
        {
          path: 'article',
          component: () => import('@/views/Article/index.vue'),
          meta: { title: '健康百科' }
        },
        {
          path: 'notify',
          component: () => import('@/views/Notify/index.vue'),
          meta: { title: '消息通知' }
        },
        {
          path: 'user',
          component: () => import('@/views/User/index.vue'),
          meta: { title: '个人中心' }
        },
        {
          path: '/user/patient',
          component: () => import('@/views/User/PatientPage.vue'),
          meta: { title: '家庭档案' }
        }
      ]
    },
    { path: '/login', component: () => import('@/views/Login/index.vue') },
    {
      path: '/consult/fast',
      component: () => import('@/views/Consult/ConsultFast.vue'),
      meta: { title: '极速问诊' }
    },
    {
      path: '/consult/dep',
      component: () => import('@/views/Consult/ConsultDep.vue'),
      meta: { title: '选择科室' }
    },
    {
      path: '/consult/illness',
      component: () => import('@/views/Consult/ConsultIllness.vue'),
      meta: { title: '病情描述' }
    },
    {
      path: '/consult/pay',
      component: () => import('@/views/Consult/ConsultPay.vue'),
      meta: { title: '问诊支付' },
      async beforeEnter(to, from, next) {
        const store = useConsultStore()
        const validKeys = [
          'type',
          'illnessType',
          'depId',
          'illnessDesc',
          'illnessTime',
          'consultFlag',
          'patientId'
        ]
        const valid = validKeys.every((key) => store.consult[key] !== undefined)
        if (!valid) {
          return showDialog({
            title: '温馨提示',
            message:
              '问诊信息不完整请重新填写，如有未支付的问诊订单可在问诊记录中继续支付！',
            closeOnPopstate: false
          }).then(() => {
            next('/')
          })
        } else {
          next()
        }
      }
    },
    {
      path: '/room',
      component: () => import('@/views/Room/index.vue'),
      meta: { title: '问诊室' },
      beforeEnter(to) {
        if (to.query.payResult === 'false') return '/user'
      }
    }
  ]
})

// 注册前置导航守卫
router.beforeEach((to) => {
  //显示进度条
  NProgress.start()

  const store = useUserStroe()
  const whiteList = ['/login']
  if (!store.user?.token && !whiteList.includes(to.path)) return '/login'
})

//注册后置导航守卫
router.afterEach((to) => {
  document.title = `优医问诊-${to.meta.title || ''}`
  NProgress.done()
})

export default router
