<script setup lang="ts">

import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import { toast } from './ToastsView.vue'
import { useFetchApi, getCookie, addCookieListener, logout } from '../common'
import type { User } from '../model'

import LoadView from './LoadView.vue'
import UserAvatar from './UserAvatar.vue'

const darkTheme = ref((() => {
  let theme = localStorage.getItem('data-theme');
  return theme === 'dark'? true: theme !== 'light';
})());
watch(
  darkTheme,
  (dark) => {
    let theme = dark? 'dark': 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('data-theme', theme);
  },
  { immediate: true }
);

const route = useRoute();

const fetchApi = useFetchApi();

const accessToken = ref<string>();
const user = ref<User>();

import moment from 'moment'
import 'moment/dist/locale/zh-cn'

const drawerOpened = ref(false);

moment.locale('zh-cn');

addCookieListener(() => {
  accessToken.value = getCookie('access_token');
  user.value = undefined;
  if (accessToken.value) {
    fetchApi('/me', {}, (me) => {
      user.value = me as User;
    });
  }
});

function blur() { (document.activeElement as HTMLElement).blur(); }

function doLogout() {
  blur();
  logout();
  toast('已登出');
}

</script>

<template>
  <header class="relative">
    <div class="drawer">
    <input id="drawer" type="checkbox" class="drawer-toggle" v-model="drawerOpened" />
    <div class="drawer-content flex flex-col">
      <div class="w-full navbar h-16 fixed top-0 backdrop-blur z-30">
        <div class="navbar-start">
          <label for="drawer" class="btn btn-square btn-ghost md:hidden">
            <i class="fa-solid fa-bars text-xl"></i>
          </label>
          <router-link to="/" class="btn btn-ghost normal-case text-2xl">Phira</router-link>
          <div class="ms-8 gap-2 hidden md:flex">
            <router-link to="/chart" class="btn btn-ghost normal-case text-lg" :class="{ 'btn-active': route.path.startsWith('/chart') }">
              <i class="fa-solid fa-book"></i>
              谱面
            </router-link>
            <router-link to="/" class="btn btn-ghost normal-case text-lg">
              <i class="fa-solid fa-star"></i>
              活动
            </router-link>
            <router-link to="/" class="btn btn-ghost normal-case text-lg">
              <i class="fa-solid fa-user"></i>
              用户
            </router-link>
          </div>
        </div>
        <div class="navbar-end">
          <label class="swap swap-rotate text-2xl mr-4">
            <input type="checkbox" v-model="darkTheme" />
            <i class="fa-solid fa-moon swap-on fill-current"></i>
            <i class="fa-solid fa-sun swap-off fill-current"></i>
          </label>
          <router-link v-if="!accessToken" to="/login" class="btn">登录</router-link>
          <template v-else>
            <LoadView v-if="!user"/>
            <div v-else class="dropdown dropdown-end">
              <label tabindex="0" class="btn btn-ghost btn-circle avatar">
                <div class="w-10 rounded-full">
                  <UserAvatar :url="user.avatar" />
                </div>
              </label>
              <ul tabindex="0" class="menu dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-40">
                <li><router-link :to="`/user/${user.id}`" @click="blur">主页</router-link></li>
                <li><router-link to="/settings" @click="blur">设置</router-link></li>
                <li><a @click="doLogout">登出</a></li>
              </ul>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="drawer-side z-[31]">
      <label for="drawer" class="drawer-overlay"></label>
      <ul class="menu p-4 w-80 h-full bg-base-200 gap-2">
        <router-link to="/chart" class="btn btn-ghost normal-case text-lg justify-start" :class="{ 'btn-active': route.path.startsWith('/chart') }" @click="drawerOpened = false">
          <i class="fa-solid fa-book w-8"></i>
          谱面
        </router-link>
        <router-link to="/" class="btn btn-ghost normal-case text-lg justify-start" @click="drawerOpened = false">
          <i class="fa-solid fa-star w-8"></i>
          活动
        </router-link>
        <router-link to="/" class="btn btn-ghost normal-case text-lg justify-start" @click="drawerOpened = false">
          <i class="fa-solid fa-user w-8"></i>
          用户
        </router-link>
      </ul>
    </div>
  </div>
  </header>
</template>
