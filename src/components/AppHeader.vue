<script setup lang="ts">

import { ref } from 'vue'

import { toast } from './Toasts.vue'
import { useFetchApi, getCookie, addCookieListener, fileToURL, logout } from '../common'
import { User } from '../model'

import Loader from './Loader.vue'

const fetchApi = useFetchApi();

const accessToken = ref<string>(null);
const user = ref<User>(null);

addCookieListener(() => {
  accessToken.value = getCookie('access_token');
  user.value = null;
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
  <header>
    <div class="navbar h-16 bg-base-100">
      <div class="navbar-start">
        <router-link to="/" class="btn btn-ghost normal-case text-xl">Phira</router-link>
      </div>
        <div class="navbar-end">
          <router-link v-if="!accessToken" to="/login" class="btn">登录</router-link>
          <template v-if="accessToken">
            <Loader v-if="!user"/>
            <div v-if="user" class="dropdown dropdown-end">
              <label tabindex="0" class="btn btn-ghost btn-circle avatar">
                <div class="w-10 rounded-full">
                  <img :src="fileToURL(user.avatar)" />
                </div>
              </label>
              <ul tabindex="0" class="menu dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-40">
                <li><router-link to="/settings" @click="blur">设置</router-link></li>
                <li><a @click="doLogout">登出</a></li>
              </ul>
            </div>
          </template>
        </div>
    </div>
  </header>
</template>
