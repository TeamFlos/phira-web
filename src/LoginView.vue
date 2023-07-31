<script setup lang="ts">

import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { toast } from './components/Toasts.vue'
import { useFetchApi, setCookie } from './common';

const router = useRouter();

const fetchApi = useFetchApi();

const doingLogin = ref(false);

const email = ref<string>(null);
const password = ref<string>(null);

const errorMessage = ref(null);

async function submit() {
  if (doingLogin.value) {
    toast('正在登录中', 'warning');
    return;
  }
  errorMessage.value = null;
  doingLogin.value = true;
  try {
    if (!(/^[a-z0-9!#$%&'*+/=?^_‘{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_‘{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/).test(email.value)) {
      throw new Error('邮箱不合法');
    }
    if (!password.value || password.value.length < 8) {
      throw new Error('密码过短');
    }
    let resp = await fetchApi('/login', {
      method: 'POST',
      json: {
        email: email.value,
        password: password.value,
      },
    });
    setCookie('access_token', resp.token, new Date(Date.parse(resp.expireAt)).toUTCString());
    toast('登录成功');
    router.back();
  } catch (e) {
    errorMessage.value = e.message;
  } finally {
    doingLogin.value = false;
  }
}

</script>

<template>
  <div class="flex justify-center items-center p-8">
    <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-gradient-to-r from-sky-400 to-blue-500 mt-16 text-white">
      <div class="card-body">
        <h2 class="card-title">登录</h2>
        <div class="form-control">
          <div class="label">
            <span class="label-text text-inherit">邮箱</span>
          </div>
          <input type="email" placeholder="邮箱地址" class="input input-bordered" v-model="email"/>
        </div>
        <div class="form-control">
          <div class="label">
            <span class="label-text text-inherit">密码</span>
          </div>
          <input type="password" placeholder="密码" class="input input-bordered" v-model="password"/>
          <label class="label">
            <a href="https://api.phira.cn/reset-password" target="_blank" class="label-text-alt link link-hover" style="color: white !important">忘记密码？</a>
          </label>
        </div>
        <div class="form-control">
          <div v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div>
        </div>
        <div class="form-control mt-6">
          <button class="btn glass text-white" :class="{ disabled: doingLogin }" @click="submit">
            <span v-if="doingLogin" class="loading loading-spinner"></span>
            <template v-if="!doingLogin">登录</template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
