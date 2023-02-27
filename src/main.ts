import { createApp } from 'vue'
import { createPinia } from 'pinia'
// --导入pinia数据持久化插件
import persist from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import './styles/main.css'
// 导入vant全局样式
import 'vant/lib/index.css'

const app = createApp(App)

app.use(createPinia().use(persist))
app.use(router)

app.mount('#app')
