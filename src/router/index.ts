import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../HomeView.vue'
import LoginView from '../LoginView.vue'
import RegisterView from '../RegisterView.vue'
import SettingsView from '../SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
  ]
});

export default router
