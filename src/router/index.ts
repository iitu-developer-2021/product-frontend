import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

//@ts-ignore
import Sell from '../views/admin/sell/Sell.vue'

//@ts-ignore
import Products from '../views/admin/products/Products.vue'

//@ts-ignore
import Types from '../views/admin/types/Types.vue'

//@ts-ignore
import SellList from '../views/admin/sell-list/SellList.vue'

//@ts-ignore
import Admin from '../views/admin/Admin.vue'

//@ts-ignore
import Login from '../views/login/Login.vue'

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
