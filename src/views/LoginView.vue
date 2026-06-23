<i18n lang="yml" src="@/locales/form.yml"></i18n>
<i18n>
en:
  logging-in: Logging in
  logged-in: Logged in

  forget-password: 'Forgot password?'
  new-user:
    prompt: 'New to Phira?'
    action: Register

zh-CN:
  logging-in: 正在登录中
  logged-in: 登录成功

  forget-password: 忘记密码？
  new-user:
    prompt: 没有账户？
    action: 注册账号

</i18n>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { validateEmail, validatePassword, toast, changeLocale } from '../common';
import { useApi, storeTokens } from '../api/client';

import LoadOr from '../components/LoadOr.vue';

const router = useRouter();

const api = useApi();

const doingLogin = ref(false);

const email = ref<string>();
const password = ref<string>();

const errorMessage = ref<string>();

async function submit() {
  if (doingLogin.value) {
    toast(t('logging-in'), 'error');
    return;
  }
  errorMessage.value = undefined;
  doingLogin.value = true;
  try {
    validateEmail(t, email.value!);
    let pwd = password.value!;
    validatePassword(t, pwd);
    const { data, error } = await api.POST('/login', {
      body: { email: email.value!, password: pwd },
    });
    if (error || !data) {
      errorMessage.value = t('login');
      return;
    }
    storeTokens(data);
    toast(t('logged-in'));
    router.back();
    api.GET('/me').then(({ data: me }) => {
      if (me) changeLocale(me.language);
    });
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : String(e);
  } finally {
    doingLogin.value = false;
  }
}
</script>

<template>
  <div class="flex justify-center items-center p-8">
    <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-gradient-to-r from-sky-400 to-blue-500 mt-16">
      <div class="card-body">
        <h2 class="card-title text-white" v-t="'login'"></h2>
        <div class="form-control">
          <div class="label">
            <span class="label-text text-inherit text-white" v-t="'email.label'"></span>
          </div>
          <input type="email" :placeholder="t('email.hint')" class="input input-bordered" v-model="email" />
        </div>
        <div class="form-control">
          <div class="label">
            <span class="label-text text-inherit text-white" v-t="'password.label'"></span>
          </div>
          <input type="password" :placeholder="t('password.hint')" class="input input-bordered" v-model="password" />
          <label class="label">
            <a href="https://phira.5wyxi.com/reset-password" target="_blank" class="label-text-alt link link-hover" style="color: white !important" v-t="'forget-password'"></a>
          </label>
        </div>
        <div class="form-control">
          <div v-if="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>
        </div>
        <div class="form-control mt-6">
          <button class="btn glass text-white" :class="{ disabled: doingLogin }" @click="submit">
            <LoadOr :loading="doingLogin">{{ t('login') }}</LoadOr>
          </button>
        </div>
        <div class="divider text-white">
          {{ t('new-user.prompt') }}
          <router-link to="/register" class="link link-hover" v-t="'new-user.action'"></router-link>
        </div>
      </div>
    </div>
  </div>
</template>
