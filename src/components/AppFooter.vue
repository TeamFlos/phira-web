<i18n>
en:
  dmca: DMCA
  terms-of-use: Terms of Use
  privacy-policy: Privacy Policy
  server-status: Server Status
  contact-us: Contact Us

  copyright: 'Phira 2023. All rights reserved by TeamFlos.'

zh-CN:
  dmca: DMCA
  terms-of-use: 使用条款
  privacy-policy: 隐私条款
  server-status: 服务器状态
  contact-us: 联系我们

  copyright: 'Phira 2023. TeamFlos 版权所有.'

</i18n>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
useI18n();
</script>

<template>
  <footer
    class="footer footer-center p-10 bg-base text-base-content rounded gap-3"
  >
    <div class="grid grid-flow-col gap-4">
      <router-link
        to="/dmca"
        class="link link-hover"
        v-t="'dmca'"
      ></router-link>
      <router-link
        to="/terms-of-use"
        class="link link-hover"
        v-t="'terms-of-use'"
      ></router-link>
      <router-link
        to="/privacy-policy"
        class="link link-hover"
        v-t="'privacy-policy'"
      ></router-link>
      <a
        href="https://status.phira.cn/"
        target="_blank"
        class="link link-hover"
        v-t="'server-status'"
      ></a>
      <a
        href="mailto:contact@phira.cn"
        class="link link-hover"
        v-t="'contact-us'"
      ></a>
    </div>
    <div>
      <div class="grid grid-flow-col gap-4">
        <a href="https://space.bilibili.com/3493259571628094" target="_blank">
          <i class="fa-brands fa-bilibili"></i>
        </a>
        <a href="https://discord.gg/gqpR3bTSsP" target="_blank">
          <i class="fa-brands fa-discord"></i>
        </a>
      </div>
    </div>
    <div>
      <p v-t="'copyright'"></p>
    </div>
  </footer>
</template>
