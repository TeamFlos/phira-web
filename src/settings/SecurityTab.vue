<i18n lang="yml" src="@/locales/form.yml"></i18n>
<i18n>
en:
  edit-password: Edit password
  password-updated: Password updated
  old-password: Original password

zh-CN:
  edit-password: 更改密码
  password-updated: 更改密码成功
  old-password: 原密码

</i18n>

<script setup lang="ts">

import { ref } from 'vue'

import { useI18n } from 'vue-i18n'
const { t } = useI18n();

import { useFetchApi, toast, toastError, validatePassword } from '../common'

import LoadOr from '../components/LoadOr.vue'

const fetchApi = useFetchApi();

const password_old = ref<string>();
const password = ref<string>();
const password2 = ref<string>();

const changingPassword = ref(false);

async function changePassword() {
  if (changingPassword.value) return;
  changingPassword.value = true;
  try {
    let
      pwd_old = password_old.value!,
      pwd = password.value!,
      pwd2 = password2.value!;
    validatePassword(t, pwd_old);
    validatePassword(t, pwd, pwd2);
    await fetchApi('/edit/password', {
      method: 'POST',
      json: {
        old: pwd_old,
        new: pwd,
      }
    });
    password_old.value = undefined;
    password.value = undefined;
    password2.value = undefined;
    toast(t('password-updated'));
  } catch (e) {
    toastError(e);
  } finally {
    changingPassword.value = false;
  }
}

</script>

<template>
  <div class="flex flex-col gap-2">
    <h1 class="card-title" v-t="'edit-password'"></h1>
    <div class="form-control grow">
      <input type="password" :placeholder="t('old-password')" class="input input-bordered" v-model="password_old"/>
    </div>
    <div class="form-control grow">
      <input type="password" :placeholder="t('password.label')" class="input input-bordered" v-model="password"/>
    </div>
    <div class="form-control grow">
      <input type="password" :placeholder="t('password-confirm.label')" class="input input-bordered" v-model="password2"/>
    </div>
    <div class="flex flex-row-reverse">
      <button class="btn btn-primary" @click="changePassword">
        <LoadOr :loading="changingPassword">{{ t('save') }}</LoadOr>
      </button>
    </div>
  </div>
</template>
