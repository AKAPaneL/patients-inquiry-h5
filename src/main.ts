import { createApp } from 'vue'
import pinia from './stores'

import App from './App.vue'
import router from './router'
// 导入vant全局样式
// import 'vant/lib/index.css'----已经使用组件
import './styles/main.css'

const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')
