<script setup lang="ts">

import { ref } from 'vue'

import { useFetchApi, toast, validatePassword } from '../common'

import LoadOr from '../components/LoadOr.vue'

const fetchApi = useFetchApi();

const password_old = ref(null);
const password = ref(null);
const password2 = ref(null);

const changingPassword = ref(false);

async function changePassword() {
  if (changingPassword.value) return;
  changingPassword.value = true;
  try {
    validatePassword(password_old.value);
    validatePassword(password.value, password2.value);
    await fetchApi('/edit/password', {
      method: 'POST',
      json: {
        old: password_old.value,
        new: password.value,
      }
    });
    password_old.value = null;
    password.value = null;
    password2.value = null;
    toast('更改密码成功');
  } catch (e) {
    toast(e, 'error');
  } finally {
    changingPassword.value = false;
  }
}

</script>

<template>
  <div class="flex flex-col gap-2">
    <h1 class="card-title">更改密码</h1>
    <div class="form-control grow">
      <input type="password" placeholder="原密码" class="input input-bordered" v-model="password_old"/>
    </div>
    <div class="form-control grow">
      <input type="password" placeholder="密码" class="input input-bordered" v-model="password"/>
    </div>
    <div class="form-control grow">
      <input type="password" placeholder="重复密码" class="input input-bordered" v-model="password2"/>
    </div>
    <div class="flex flex-row-reverse">
      <button class="btn btn-primary" @click="changePassword">
        <LoadOr :loading="changingPassword">确认更改</LoadOr>
      </button>
    </div>
  </div>
</template>
