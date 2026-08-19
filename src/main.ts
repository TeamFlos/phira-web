import './assets/main.css';

import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';

import { changeLocale } from './common';

import App from './App.vue';
import router from './router';

import FloatingVue from 'floating-vue';
import 'floating-vue/dist/style.css';

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
    en: {
      login: 'Login',
      register: 'Register',

      warning: 'Warning',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      search: 'Search',
      submit: 'Submit',

      'bio-empty': 'This user does not have bio',

      'please-login': 'Please login',

      'title-default': 'Phira',
      'title-charts': 'Charts',
      'title-collection': 'Collection',
      'title-users': 'User',
      'title-settings': 'Settings',

      'title-dmca': 'DMCA',
      'title-terms-of-use': 'Terms of Use',
      'title-privacy-policy': 'Privacy Policy',
      'title-oauth': 'OAuth',
      'title-staff': 'Staff',
      'title-confirm-collab': 'Collaboration Invitation',
      'title-activate': 'Activate Account',
      'title-transfer-confirm': 'Confirm Account Transfer',
      'title-chart-versions': 'Version History',
      'title-review-queue': 'Review Queue',

      // Shared by the version timeline, the detail/diff panels and the queue.
      'version-status': {
        pending: 'Pending',
        published: 'Published',
        rejected: 'Rejected',
        superseded: 'Superseded',
        awaitingCollaborators: 'Awaiting collaborators',
        yanked: 'Yanked',
      },
      // Shared by the copyright check card and the policy library search.
      'policy-status': {
        free: 'Free',
        restricted: 'Restricted',
        forbidden: 'Forbidden',
        unknown: 'No record',
        inherited: 'Inherited',
      },
      'chart-field': {
        name: 'Name',
        composer: 'Composer',
        charter: 'Charter',
        illustrator: 'Illustrator',
        level: 'Level',
        difficulty: 'Difficulty',
        noteCount: 'Notes',
        tags: 'Tags',
        description: 'Description',
        illustration: 'Illustration',
        preview: 'Preview audio',
        file: 'Chart file',
      },
    },
    'zh-CN': {
      login: '登录',
      register: '注册',

      warning: '警告',
      cancel: '取消',
      confirm: '确定',
      save: '保存',
      search: '搜索',
      submit: '提交',

      'bio-empty': '该用户还没有简介',

      'please-login': '请先登录',

      'title-default': 'Phira',
      'title-charts': '谱面',
      'title-collection': '合集',
      'title-users': '用户',
      'title-settings': '设置',

      'title-dmca': 'DMCA',
      'title-terms-of-use': '使用条款',
      'title-privacy-policy': '隐私政策',
      'title-oauth': 'OAuth',
      'title-staff': '团队成员',
      'title-confirm-collab': '协作邀请',
      'title-activate': '激活账号',
      'title-transfer-confirm': '确认账号迁移',
      'title-chart-versions': '版本历史',
      'title-review-queue': '待审队列',

      'version-status': {
        pending: '待审核',
        published: '已发布',
        rejected: '已拒绝',
        superseded: '已替换',
        awaitingCollaborators: '等待协作者确认',
        yanked: '已撤下',
      },
      'policy-status': {
        free: '无限制',
        restricted: '受限',
        forbidden: '禁止',
        unknown: '无记录',
        inherited: '继承版权方',
      },
      'chart-field': {
        name: '曲名',
        composer: '曲师',
        charter: '谱师',
        illustrator: '画师',
        level: '等级',
        difficulty: '难度',
        noteCount: '物量',
        tags: '标签',
        description: '简介',
        illustration: '插图',
        preview: '试听音频',
        file: '谱面文件',
      },
    },
  },
  legacy: false,
  missing(_locale, key) {
    if (key.startsWith('title-')) return '';
    return key;
  },
});
changeLocale(locale);

const app = createApp(App);
app.use(i18n).use(router).use(FloatingVue);

app.mount('#app');

export { i18n };
