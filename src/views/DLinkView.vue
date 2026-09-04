<i18n>
en:
  opening: Trying to open Phira…
  open: Open in Phira
  not-installed: "If you haven't installed Phira, please click {here} to download it."
  here: here

zh-CN:
  opening: 正在尝试打开 Phira…
  open: 打开 Phira
  not-installed: 如果你没有安装 Phira，请点击 {here} 下载。
  here: 这里

zh-TW:
  opening: 正在嘗試開啟 Phira…
  open: 開啟 Phira
  not-installed: 如果你沒有安裝 Phira，請點擊 {here} 下載。
  here: 這裡
</i18n>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();

// Rebuild the `phira://<action>?<query>` deeplink the app expects from the
// `https://phira.moe/dlink/<action>?<query>` wrapper that landed us here.
const appUrl = `phira://${route.params.action}${location.search}`;

function openApp() {
  window.location.href = appUrl;
}

// On Android, verified app links open the app before this page loads, so this
// page is usually reached only when the app is not installed. Elsewhere
// (iOS, desktop) the https wrapper never auto-launches the app — give the
// custom scheme one silent try.
onMounted(openApp);
</script>

<template>
  <div class="flex justify-center items-center p-8">
    <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100 mt-16">
      <div class="card-body gap-4">
        <p class="text-base-content/70">{{ t('opening') }}</p>
        <div class="card-actions mt-2">
          <button class="btn btn-primary w-full" @click="openApp">{{ t('open') }}</button>
        </div>
        <i18n-t keypath="not-installed" tag="p" class="text-base-content/70 text-center">
          <template #here>
            <router-link class="link" to="/download">{{ t('here') }}</router-link>
          </template>
        </i18n-t>
      </div>
    </div>
  </div>
</template>
