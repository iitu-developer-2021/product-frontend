import { createRouter, createWebHistory } from 'vue-router'
//@ts-ignore
import Sell from '../views/Sell.vue'
//@ts-ignore
import Products from '../views/Products.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/sell',
      name: 'Sell',
      component: Sell
    },
    {
      path: '/products',
      name: 'Products',
      component: Products
    }
  ]
})

export default router
