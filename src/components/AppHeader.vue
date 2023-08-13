<script setup lang="ts">

import { ref } from 'vue'
import { useRoute } from 'vue-router'

import { toast } from './ToastsView.vue'
import { useFetchApi, getCookie, addCookieListener, fileToURL, logout } from '../common'
import type { User } from '../model'

import LoadView from './LoadView.vue'

const route = useRoute();

const fetchApi = useFetchApi();

const accessToken = ref<string>();
const user = ref<User>();

import moment from 'moment'
import 'moment/dist/locale/zh-cn'

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
    <div class="navbar h-16 fixed top-0 backdrop-blur z-30">
      <div class="navbar-start">
        <router-link to="/" class="btn btn-ghost normal-case text-2xl">Phira</router-link>
        <div class="flex ms-8 gap-2">
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
        <router-link v-if="!accessToken" to="/login" class="btn">登录</router-link>
        <template v-else>
          <LoadView v-if="!user"/>
          <div v-else class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-ghost btn-circle avatar">
              <div class="w-10 rounded-full">
                <img v-if="user.avatar" :src="fileToURL(user.avatar)" />
                <img v-else src="../assets/user.png" />
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
  </header>
</template>
