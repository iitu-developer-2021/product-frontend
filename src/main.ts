import 'virtual:svg-icons-register'
import './styles/index.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

//@ts-ignore
import App from './App.vue'
import router from './router'
import dayjs from 'dayjs'
import ru from 'dayjs/locale/ru'

dayjs.locale({
  ...ru,
  weekStart: 1
})

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)

app.mount('#app')
