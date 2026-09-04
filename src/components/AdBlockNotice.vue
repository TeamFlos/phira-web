<i18n>
en:
  title: Oops…
  body: |
    It looks like the ad failed to load — this doesn't affect your usage, feel free to continue as normal.

    Phira is a completely free community platform. Displaying sponsor ads helps offset server costs and quietly supports our large volunteer team. If you're willing to whitelist this site, it would mean a lot to us. For setup instructions, see {link}.

    Thanks for your understanding ❤️
  guide: this guide
  hide-month: Hide for a month
  close: No thanks

zh-CN:
  title: 噢…
  body: |
    看起来广告没能正常加载 —— 不影响使用，你可以照常继续。

    Phira 是完全免费的社区平台，展示赞助商广告有助于分摊服务器开销，也是对我们庞大{staff}的无声支持。如果你愿意把本站加入白名单，对我们会是特别暖心的帮助。设置方式可参考{link}。

    多谢你的理解 ❤️
  staff: 志愿者团队
  guide: 这篇指南
  hide-month: 一个月内不再显示
  close: 不用了

</i18n>

<script setup lang="ts">
import { BlockAdBlock } from '@/adbd';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

// Generic storage key / no ad-related class names: filter lists target
// names like `adblock-notice`, so keep everything inconspicuous.
const STORAGE_KEY = 'notice_snooze_until';
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// WikiHow's "Disable AdBlock" guide, picked per interface language.
const GUIDE_URLS: Record<string, string> = {
  en: 'https://www.wikihow.com/Disable-AdBlock',
  'zh-CN': 'https://zh.wikihow.com/%E7%A6%81%E7%94%A8-Adblock',
  'zh-TW': 'https://zh.wikihow.com/%E7%A6%81%E7%94%A8-Adblock',
};
const guideUrl = computed(() => GUIDE_URLS[locale.value] ?? GUIDE_URLS['en']);

const dialog = ref<HTMLDialogElement>();

function snoozedUntil(): number {
  const value = Number(localStorage.getItem(STORAGE_KEY));
  return Number.isFinite(value) ? value : 0;
}

function snooze(ms: number) {
  localStorage.setItem(STORAGE_KEY, String(Date.now() + ms));
}

// Dismissed without choosing (backdrop click / Esc): the user may not have
// read the notice yet, so retry sooner than the default one-hour interval.
function cancel() {
  snooze(5 * MINUTE);
  dialog.value?.close();
}

function dismiss(days: number) {
  snooze(days * DAY);
  dialog.value?.close();
}

function onDetected() {
  if (dialog.value?.open) return;
  console.log('Ad blocker detected');
  // Once shown, don't nag again within an hour even if the user
  // never interacts with the dialog.
  snooze(HOUR);
  dialog.value?.showModal();
}

onMounted(() => {
  if (Date.now() < snoozedUntil()) return;
  new BlockAdBlock({
    checkOnLoad: true,
    resetOnEnd: true,
  })
    .onDetected(onDetected)
    .onNotDetected(() => {
      fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5774998175455449', { mode: 'no-cors' })
        .then(() => console.log('Ad blocker not detected'))
        .catch(() => onDetected());
    });
});
</script>

<template>
  <dialog class="modal modal-bottom sm:modal-middle" ref="dialog" @cancel="snooze(5 * MINUTE)">
    <div class="modal-box">
      <h3 class="font-bold text-lg" v-t="'title'"></h3>
      <i18n-t keypath="body" tag="pre" class="py-2 whitespace-pre-wrap font-ubuntu">
        <template #staff>
          <a class="link italic" href="/staff" target="_blank" rel="noopener" v-t="'staff'"></a>
        </template>
        <template #link>
          <a class="link link-primary" :href="guideUrl" target="_blank" rel="noopener" v-t="'guide'"></a>
        </template>
      </i18n-t>
      <div class="modal-action">
        <button class="btn btn-ghost" @click="dismiss(30)" v-t="'hide-month'"></button>
        <button class="btn btn-ghost" @click="dismiss(1)" v-t="'close'"></button>
      </div>
    </div>
    <div class="modal-backdrop">
      <button class="cursor-default" @click="cancel"></button>
    </div>
  </dialog>
</template>
