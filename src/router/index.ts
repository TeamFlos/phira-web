import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../HomeView.vue'

import LoginView from '../LoginView.vue'
import RegisterView from '../RegisterView.vue'

import ChartView from '../ChartView.vue'

import SettingsView from '../SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },

    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },

    { path: '/chart', name: 'chart', component: ChartView },

    { path: '/settings', redirect: to => '/settings/account' },
    { path: '/settings/:category', name: 'settings', component: SettingsView },
  ]
});

export default router
