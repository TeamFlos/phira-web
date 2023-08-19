<i18n>
en:
  account: Account
  security: Security
  email: Email

zh-CN:
  account: 账户
  security: 安全
  email: 邮件

</i18n>

<script setup lang="ts">

import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useI18n } from 'vue-i18n'
const { t } = useI18n();

import AccountTab from './settings/AccountTab.vue'
import SecurityTab from './settings/SecurityTab.vue'
import EmailTab from './settings/EmailTab.vue'

const route = useRoute();
const category = computed(() => {
  return route.params.category as ('account' | 'security' | 'email');
});

</script>

<template>
  <div class="flex justify-center mt-8 min-h-[24px] p-6">
    <div class="flex flex-col w-full lg:flex-row lg:w-2/3 gap-4">
      <div>
        <ul id="category-menu" class="menu bg-base-100 lg:w-56 rounded-box gap-2">
          <li><router-link to="/settings/account" data-category="account" :class="{ active: category === 'account' }"><i class="fa-solid fa-user"></i>{{ t('account') }}</router-link></li>
          <li><router-link to="/settings/security" data-category="security" :class="{ active: category === 'security' }"><i class="fa-solid fa-lock"></i>{{ t('security') }}</router-link></li>
          <li><router-link to="/settings/email" data-category="email" :class="{ active: category === 'email' }"><i class="fa-solid fa-envelope"></i>{{ t('email') }}</router-link></li>
        </ul>
      </div>
      <div class="flex flex-col grow card bg-base-100 min-h-12 p-8">
        <AccountTab v-if="category === 'account'" />
        <SecurityTab v-if="category === 'security'" />
        <EmailTab v-if="category === 'email'" />
      </div>
    </div>
  </div>
</template>
