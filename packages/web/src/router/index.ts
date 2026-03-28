import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/components/Layout/PublicLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('@/views/LandingView.vue') },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/modules/register/RegisterView.vue'),
        },
        {
          path: 'login',
          name: 'login',
          component: () => import('@/modules/login/LoginView.vue'),
        },
      ],
    },
    {
      path: '/app',
      component: () => import('@/components/Layout/PrivateLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/modules/dashboard/DashboardView.vue'),
        },
        {
          path: 'wallets',
          name: 'wallets',
          component: () => import('@/modules/wallets/WalletsList.vue'),
        },
        {
          path: 'wallets/:walletId',
          name: 'wallet',
          component: () => import('@/modules/wallets/WalletDetail.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/modules/profile/ProfileView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.accessToken) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (!to.meta.requiresAuth && auth.accessToken) {
    return { name: 'dashboard' }
  }
})

export default router
