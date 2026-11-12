import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import LandingView from '../views/LandingView.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ForgotView from '../views/ForgotView.vue'
import DataView from '../views/DataView.vue'
import ShopView from '../views/ShopView.vue'
import CabinetView from '../views/CabinetView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'landing', component: LandingView },
    { path: '/upload', name: 'upload', component: HomeView, meta: { auth: true, admin: true } },
    { path: '/shop', name: 'shop', component: ShopView },
    { path: '/cabinet', name: 'cabinet', component: CabinetView, meta: { auth: true } },
    { path: '/login', name: 'login', component: LoginView, meta: { guest: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { guest: true } },
    { path: '/forgot', name: 'forgot', component: ForgotView, meta: { guest: true } },
    { path: '/data', name: 'data', component: DataView, meta: { auth: true, admin: true } }
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

function homeFor(auth) {
  return auth.isAdmin ? { name: 'data' } : { name: 'cabinet' }
}

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.auth && !auth.isAuth) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.meta.admin && !auth.isAdmin) return homeFor(auth)
  if (to.meta.guest && auth.isAuth) return homeFor(auth)
  return true
})

export default router
