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

import { useFetchApi, setCookie, validateEmail, validatePassword, toast, changeLocale } from '../common';
import type { User } from '../model';

import LoadOr from '../components/LoadOr.vue';

const router = useRouter();

const fetchApi = useFetchApi();

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
    let resp = (await fetchApi('/login', {
      method: 'POST',
      json: {
        email: email.value!,
        password: pwd,
      },
    })) as { token: string; expireAt: string };
    setCookie('access_token', resp.token, new Date(Date.parse(resp.expireAt)).toUTCString());
    toast(t('logged-in'));
    router.back();
    fetchApi('/me', {}, (me) => {
      changeLocale((me as User).language);
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
            <a href="https://api.phira.cn/reset-password" target="_blank" class="label-text-alt link link-hover" style="color: white !important" v-t="'forget-password'"></a>
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
