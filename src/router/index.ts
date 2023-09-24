import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

//@ts-ignore
import Sell from '../views/sell/Sell.vue'

//@ts-ignore
import Products from '../views/Products.vue'
//@ts-ignore
import Types from '../views/Types.vue'
//@ts-ignore
import SellList from '../views/SellList.vue'

//@ts-ignore
import Admin from '../views/Admin.vue'

//@ts-ignore
import Login from '../views/Login.vue'

const withAuth = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const token = localStorage.getItem('token')
  if (token) {
    next()
  } else {
    next('/login')
  }
}

const noAuth = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const token = localStorage.getItem('token')
  if (token) {
    next('/admin')
  } else {
    next()
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/admin',
      component: Admin,
      beforeEnter: withAuth,
      children: [
        {
          path: '',
          name: 'Sell',
          component: Sell
        },
        {
          path: 'products',
          name: 'Products',
          component: Products
        },
        {
          path: 'sell-list',
          name: 'SellList',
          component: SellList
        },
        {
          path: '/types',
          name: 'Types',
          component: Types
        }
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      beforeEnter: noAuth
    },
    { path: '/:pathMatch(.*)*', redirect: '/admin' }
  ]
})

export default router
