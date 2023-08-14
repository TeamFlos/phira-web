import './assets/main.css'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import router from './router'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    'en': {
      'login': 'Login',
      'register': 'Register',

      'warning': 'Warning',
      'cancel': 'Cancel',
      'confirm': 'Confirm',

      'bio-empty': 'This user does not have bio',
    },
    'zh-CN': {
      'login': '登录',
      'register': '注册',

      'warning': '警告',
      'cancel': '取消',
      'confirm': '确定',

      'bio-empty': '该用户还没有简介',
    }
  },
  legacy: false,
});

const app = createApp(App);
app.use(i18n).use(router);

app.mount('#app');

export { i18n };
