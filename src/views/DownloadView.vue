<i18n>
en:
  heading: Download Phira
  subtitle: Pick a channel for your device
  international:
    title: International
    description: Android, HarmonyOS and desktop (Windows & Linux) builds are all available on the official download site.
    action: Go to download site
  ios:
    title: iOS
    description: Only available on the App Store outside mainland China.
    action: View on App Store
  hykb:
    title: 3839 Game channel
    description: The official distribution channel in mainland China — download and update easily via the 3839 Game app.
    action: View on 3839.com

zh-CN:
  heading: 下载 Phira
  subtitle: 根据你的设备选择下载渠道
  international:
    title: 国际版
    description: 包含安卓、鸿蒙和桌面端（Windows、Linux）版本
    action: 前往下载站
  ios:
    title: iOS
    description: 仅在中国大陆以外地区开放
    action: 前往 App Store
  hykb:
    title: 好游快爆渠道
    description: 国内官方分发渠道，通过好游快爆 App 便捷下载与更新
    action: 前往好游快爆

zh-TW:
  heading: 下載 Phira
  subtitle: 根據你的裝置選擇下載渠道
  international:
    title: 國際版
    description: 包含安卓、鴻蒙和桌面端（Windows、Linux）版本
    action: 前往下載站
  ios:
    title: iOS
    description: 僅在中國大陸以外地區開放
    action: 前往 App Store
  hykb:
    title: 好游快爆渠道
    description: 國內官方分發渠道，透過好游快爆 App 便捷下載與更新
    action: 前往好游快爆
</i18n>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import hykbLogo from '@/assets/hykb.png';

const { t } = useI18n();

interface Channel {
  // Font Awesome classes when the channel has no logo image.
  icon?: string;
  logo?: string;
  // Overrides the default btn-primary styling (used for brand colors).
  buttonClass?: string;
  title: string;
  description: string;
  action: string;
  url: string;
}

const CHANNELS: Channel[] = [
  {
    icon: 'fa-solid fa-globe',
    title: 'international.title',
    description: 'international.description',
    action: 'international.action',
    url: 'https://phira.dmocken.top',
  },
  {
    icon: 'fa-brands fa-app-store',
    title: 'ios.title',
    description: 'ios.description',
    action: 'ios.action',
    url: 'https://apps.apple.com/hk/app/phira/id6447435864',
  },
  {
    logo: hykbLogo,
    buttonClass: 'btn border-none text-white bg-[#28C36B] hover:bg-[#22a95e]',
    title: 'hykb.title',
    description: 'hykb.description',
    action: 'hykb.action',
    url: 'https://www.3839.com/a/154061.htm',
  },
];
</script>

<template>
  <div class="hero min-h-[calc(100vh-5rem)]">
    <div class="hero-content flex-col">
      <div class="text-center">
        <h1 class="text-4xl font-bold">{{ t('heading') }}</h1>
        <p class="py-2 text-base-content/70">{{ t('subtitle') }}</p>
      </div>
      <div class="grid gap-6 md:grid-cols-3 w-full max-w-4xl">
        <div v-for="channel in CHANNELS" :key="channel.url" class="card bg-base-100 shadow-xl">
          <div class="card-body items-center text-center gap-4">
            <img v-if="channel.logo" :src="channel.logo" :alt="t(channel.title)" class="h-16 w-16 rounded-2xl mt-2" />
            <i v-else :class="channel.icon" class="text-6xl mt-2"></i>
            <h2 class="card-title">{{ t(channel.title) }}</h2>
            <p class="text-base-content/70">{{ t(channel.description) }}</p>
            <div class="card-actions mt-2">
              <a :href="channel.url" target="_blank" rel="noopener" :class="channel.buttonClass || 'btn btn-primary'">
                {{ t(channel.action) }}
                <i class="fa-solid fa-arrow-up-right-from-square fa-xs opacity-70"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
