import 'virtual:svg-icons-register'
import './styles/index.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

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

app.use(createPinia())
app.use(router)

app.mount('#app')
