import './assets/main.css'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import { changeLocale } from './common'

import App from './App.vue'
import router from './router'

export const SUPPORTED_LOCALES = ['en', 'zh-CN', 'zh-TW'];

let locale = localStorage.getItem('locale');
if (!locale) {
  locale = 'en';
  for (const alt of navigator.languages) {
    if (SUPPORTED_LOCALES.includes(alt)) {
      locale = alt;
      break;
    }
  }
}
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
      'save': 'Save',
      'search': 'Search',
      'submit': 'Submit',

      'bio-empty': 'This user does not have bio',

      'please-login': 'Please login',

      'title-default': 'Phira',
      'title-charts': 'Charts',
      'title-users': 'User',
      'title-settings': 'Settings',

      'title-dmca': 'DMCA',
      'title-terms-of-use': 'Terms of Use',
      'title-privacy-policy': 'Privacy Policy',
    },
    'zh-CN': {
      'login': '登录',
      'register': '注册',

      'warning': '警告',
      'cancel': '取消',
      'confirm': '确定',
      'save': '保存',
      'search': '搜索',
      'submit': '提交',

      'bio-empty': '该用户还没有简介',

      'please-login': '请先登录',

      'title-default': 'Phira',
      'title-charts': '谱面',
      'title-users': '用户',
      'title-settings': '设置',

      'title-dmca': 'DMCA',
      'title-terms-of-use': '使用条款',
      'title-privacy-policy': '隐私政策',
    }
  },
  legacy: false,
  missing(_locale, key) {
    if (key.startsWith('title-')) return '';
    return key;
  }
});
changeLocale(locale);

const app = createApp(App);
app.use(i18n).use(router);

app.mount('#app');

export { i18n };
