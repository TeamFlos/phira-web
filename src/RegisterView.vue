<script setup lang="ts">

import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { toast } from './components/Toasts.vue'
import { useFetchApi, setCookie } from './common';

const router = useRouter();

const fetchApi = useFetchApi();

const doingRegister = ref(false);

const email = ref<string>(null);
const username = ref<string>(null);
const password = ref<string>(null);
const password2 = ref<string>(null);

const errorMessage = ref<string>(null);

async function submit() {
  if (doingRegister.value) {
    toast('正在注册中', 'warning');
    return;
  }
  errorMessage.value = null;
  doingRegister.value = true;
  try {
    if (!(/^[a-z0-9!#$%&'*+/=?^_‘{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_‘{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/).test(email.value)) {
      throw new Error('邮箱不合法');
    }
    if (!password.value || password.value.length < 8) {
      throw new Error('密码过短');
    }
    if (password.value !== password2.value) {
      throw new Error('两次输入的密码不一致');
    }
    let resp = await fetchApi('/register', {
      method: 'POST',
      json: {
        email: email.value,
        name: username.value,
        password: password.value,
      },
    });
    toast('注册成功');
    router.back();
  } catch (e) {
    errorMessage.value = e.message;
  } finally {
    doingRegister.value = false;
  }
}

</script>

<template>
  <div class="flex justify-center items-center p-8">
    <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-gradient-to-r from-sky-400 to-blue-500 mt-16 text-white">
      <div class="card-body">
        <h2 class="card-title">注册</h2>
        <div class="form-control">
          <div class="label">
            <span class="label-text text-inherit">邮箱</span>
          </div>
          <input type="email" placeholder="邮箱地址" class="input input-bordered" v-model="email"/>
        </div>
        <div class="form-control">
          <div class="label">
            <span class="label-text text-inherit">用户名</span>
          </div>
          <input type="text" placeholder="名字" class="input input-bordered" v-model="username"/>
        </div>
        <div class="form-control">
          <div class="label">
            <span class="label-text text-inherit">密码</span>
          </div>
          <input type="password" placeholder="密码" class="input input-bordered" v-model="password"/>
        </div>
        <div class="form-control">
          <div class="label">
            <span class="label-text text-inherit">重复密码</span>
          </div>
          <input type="password" placeholder="密码" class="input input-bordered" v-model="password2"/>
        </div>
        <div class="form-control">
          <div v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div>
        </div>
        <div class="form-control mt-6">
          <button class="btn glass text-white" :class="{ disabled: doingRegister }" @click="submit">
            <span v-if="doingRegister" class="loading loading-spinner"></span>
            <template v-if="!doingRegister">注册</template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
