
import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../HomeView.vue'

import LoginView from '../LoginView.vue'
import RegisterView from '../RegisterView.vue'

import ChartsView from '../ChartsView.vue'
import ChartView from '../ChartView.vue'

import UserView from '../UserView.vue'

import SettingsView from '../SettingsView.vue'

import DMCA from '../DMCA.vue'
import PrivacyPolicy from '../PrivacyPolicy.vue'
import TermsOfUse from '../TermsOfUse.vue'

import { useOnLoaded } from '../App.vue'

const onLoaded = useOnLoaded();

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },

    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },

    { path: '/chart', name: 'charts', component: ChartsView },
    { path: '/chart/:id(\\d+)', name: 'chart', component: ChartView },

    { path: '/user/:id(\\d+)', name: 'user', component: UserView },

    { path: '/settings', redirect: () => '/settings/account' },
    { path: '/settings/:category', name: 'settings', component: SettingsView },

    { path: '/dmca', name: 'DMCA', component: DMCA },
    { path: '/privacy-policy', name: 'privacy policy', component: PrivacyPolicy },
    { path: '/terms-of-use', name: 'terms of use', component: TermsOfUse },
  ],
  scrollBehavior (_to, from, savedPosition) {
    return new Promise((resolve) => {
      onLoaded.value = () => {
        resolve(savedPosition? savedPosition: { top: 0 });
      };
    })
  },
});

export default router
