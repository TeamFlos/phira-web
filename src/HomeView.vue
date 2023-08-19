<i18n>
en:
  description: Phigros Fanmade Community
  link:
    github: GitHub
    afdian: Afdian

zh-CN:
  description: Phigros 二创社区
  link:
    github: GitHub
    afdian: 爱发电

</i18n>

<script setup lang="ts">

import { useI18n } from 'vue-i18n'
const { t } = useI18n();

</script>

<template>
  <div class="hero min-h-[calc(100vh-5rem)]">
    <div class="hero-content justify-center flex-col lg:flex-row">
      <img class="shadow-2xl rounded-lg lg:me-14" src="./assets/icon.png"/>
      <div class="flex-col text-center">
        <h1 class="font-title font-black text-left text-8xl tracking-widest bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text [-webkit-text-fill-color:transparent]">Phira</h1>
        <p class="text-xl" v-t="'description'"></p>
        <div class="flex mt-6 space-x-2 justify-center">
          <a href="https://github.com/TeamFlos/phira" target="_blank">
            <button class="btn btn-neutral">
              <i class="fa-brands fa-github"></i>
              {{ t('link.github') }}
            </button>
          </a>
          <a href="https://afdian.net/a/phira" target="_blank">
            <button class="btn btn-primary bg-[#946ce6]">
              {{ t('link.afdian') }}
            </button>
          </a>
        </div>
      </div>
    </div>
  </div>
  <div class="w-1/3"></div>
</template>
