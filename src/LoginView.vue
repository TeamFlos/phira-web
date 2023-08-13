<script setup lang="ts">

import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useFetchApi, setCookie, validateEmail, validatePassword, toast } from './common';

import LoadOr from './components/LoadOr.vue'

const router = useRouter();

const fetchApi = useFetchApi();

const doingLogin = ref(false);

const email = ref<string>();
const password = ref<string>();

const errorMessage = ref<string>();

async function submit() {
  if (doingLogin.value) {
    toast('正在登录中', 'warning');
    return;
  }
  errorMessage.value = undefined;
  doingLogin.value = true;
  try {
    validateEmail(email.value!);
    let pwd = password.value!;
    validatePassword(pwd);
    let resp = await fetchApi('/login', {
      method: 'POST',
      json: {
        email: email.value!,
        password: pwd,
      },
    }) as { token: string, expireAt: string };
    setCookie('access_token', resp.token, new Date(Date.parse(resp.expireAt)).toUTCString());
    toast('登录成功');
    router.back();
  } catch (e) {
    errorMessage.value = (e instanceof Error)? e.message: String(e);
  } finally {
    doingLogin.value = false;
  }
}

</script>

<template>
  <div class="flex justify-center items-center p-8">
    <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-gradient-to-r from-sky-400 to-blue-500 mt-16">
      <div class="card-body">
        <h2 class="card-title text-white">登录</h2>
        <div class="form-control">
          <div class="label">
            <span class="label-text text-inherit text-white">邮箱</span>
          </div>
          <input type="email" placeholder="邮箱地址" class="input input-bordered" v-model="email"/>
        </div>
        <div class="form-control">
          <div class="label">
            <span class="label-text text-inherit text-white">密码</span>
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
            <LoadOr :loading="doingLogin">登录</LoadOr>
          </button>
        </div>
        <div class="divider text-white">
          没有账号？
          <router-link to="/register" class="link link-hover">请注册账号</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
