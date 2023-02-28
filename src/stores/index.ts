import { createPinia } from 'pinia'
// --导入pinia数据持久化插件
import persist from 'pinia-plugin-persistedstate'

const pinia = createPinia().use(persist)

export default pinia
