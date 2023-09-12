<i18n>
en:
  logged-out: Logged out

  chart: Charts
  event: Events
  user: Users

  wip: Work in progress

  me:
    profile: Profile
    settings: Settings
    logout: Logout

zh-CN:
  logged-out: 已登出

  chart: 谱面
  event: 活动
  user: 用户

  wip: 功能暂未开放

  me:
    profile: 主页
    settings: 设置
    logout: 登出

</i18n>

<script lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

import { useI18n } from 'vue-i18n';

import { useFetchApi, getCookie, addCookieListener, logout, toast } from '../common';
import type { User } from '../model';

import { Toaster } from 'vue-sonner';

import LoadView from './LoadView.vue';
import UserAvatar from './UserAvatar.vue';

export const darkTheme = ref(
  (() => {
    let theme = localStorage.getItem('data-theme');
    return theme === 'dark' ? true : theme !== 'light';
  })(),
);

export default {};
</script>

<script setup lang="ts">
const { t } = useI18n();

watch(
  darkTheme,
  (dark) => {
    let theme = dark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('data-theme', theme);
  },
  { immediate: true },
);

const route = useRoute();

const fetchApi = useFetchApi();

const accessToken = ref<string>();
const user = ref<User>();
const drawerOpened = ref(false);
const NAVS = [
  { path: '/chart', icon: 'fa-book', text: 'chart', enabled: true },
  { path: '/', icon: 'fa-star', text: 'event', enabled: false },
  { path: '/user', icon: 'fa-user', text: 'user', enabled: true },
];

addCookieListener(() => {
  accessToken.value = getCookie('access_token');
  user.value = undefined;
  if (accessToken.value) {
    fetchApi('/me', {}, (me) => {
      user.value = me as User;
    });
  }
});

function blur() {
  (document.activeElement as HTMLElement).blur();
}

function doLogout() {
  blur();
  logout();
  toast(t('logged-out'));
}

const atTop = ref(true);
function onScroll() {
  atTop.value = window.scrollY < 10;
}
window.addEventListener('scroll', onScroll);
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});

</script>

<template>
  <Toaster position="top-center" :theme="darkTheme ? 'dark' : 'light'" closeButton />
  <header class="relative">
    <div class="drawer">
      <input id="drawer" type="checkbox" class="drawer-toggle" v-model="drawerOpened" />
      <div class="drawer-content flex flex-col">
        <div class="w-full navbar h-16 fixed top-0 z-30 transition-all" :class="{ 'shadow-xl': !atTop, 'backdrop-blur-lg': !atTop }" >
          <div class="navbar-start">
            <label for="drawer" class="btn btn-square btn-ghost md:hidden">
              <i class="fa-solid fa-bars text-xl"></i>
            </label>
            <router-link to="/" class="btn btn-ghost normal-case text-2xl">Phira</router-link>
            <div class="ms-8 gap-2 hidden md:flex">
              <router-link
                v-for="nav in NAVS"
                :to="nav.enabled ? nav.path : route"
                :key="nav.text"
                :value="nav.text"
                class="btn btn-ghost normal-case text-lg"
                :class="{
                  'btn-active': route.path.startsWith(nav.path) && nav.enabled,
                }"
                @click="!nav.enabled && toast(t('wip'), 'error')">
                <i :class="nav.icon" class="fa-solid"></i>
                {{ t(nav.text) }}
              </router-link>
            </div>
          </div>
          <div class="navbar-end">
            <label class="swap swap-rotate text-2xl mr-4">
              <input type="checkbox" v-model="darkTheme" />
              <i class="fa-solid fa-moon swap-on fill-current"></i>
              <i class="fa-solid fa-sun swap-off fill-current"></i>
            </label>
            <router-link v-if="!accessToken" to="/login" class="btn" v-t="'login'"></router-link>
            <template v-else>
              <div class="dropdown dropdown-end">
                <label tabindex="0" class="btn btn-ghost btn-circle avatar">
                  <LoadView v-if="!user" />
                  <div v-else class="w-10 rounded-full">
                    <UserAvatar :url="user.avatar" />
                  </div>
                </label>
                <ul tabindex="0" class="menu dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-40">
                  <li>
                    <router-link v-if="user" :to="`/user/${user.id}`" @click="blur" v-t="'me.profile'"></router-link>
                  </li>
                  <li>
                    <router-link to="/settings" @click="blur" v-t="'me.settings'"></router-link>
                  </li>
                  <li><a @click="doLogout" v-t="'me.logout'"></a></li>
                </ul>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="drawer-side z-[31]">
        <label for="drawer" class="drawer-overlay"></label>
        <ul class="menu p-4 w-80 h-full bg-base-200 gap-2">
          <router-link
            v-for="nav in NAVS"
            :to="nav.enabled ? nav.path : route"
            :key="nav.text"
            :value="nav.text"
            class="btn btn-ghost normal-case text-lg justify-start"
            :class="{
              'btn-active': nav.enabled && route.path.startsWith(nav.path),
            }"
            @click="
              () => {
                !nav.enabled && toast(t('wip'), 'error');
                drawerOpened = false;
              }
            ">
            <i :class="nav.icon" class="fa-solid w-8"></i>
            {{ t(nav.text) }}
          </router-link>
        </ul>
      </div>
    </div>
  </header>
</template>
