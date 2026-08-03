<i18n lang="yml" src="@/locales/form.yml"></i18n>
<i18n>
en:
  login-failed: Login failed
  logging-in: Logging in
  logged-in: Logged in

  forget-password: 'Forgot password?'
  new-user:
    prompt: 'New to Phira?'
    action: Register

  pending-delete:
    title: Account deletion pending
    message: Your account has a pending deletion request. Continue logging in to cancel it?
    cancel-delete: Cancel deletion & log in

zh-CN:
  login-failed: 登录失败
  logging-in: 正在登录中
  logged-in: 登录成功

  forget-password: 忘记密码？
  new-user:
    prompt: 没有账户？
    action: 注册账号

  pending-delete:
    title: 账号删除请求待处理
    message: 你的账号有一个待处理的删除请求。是否撤销删除并继续登录？
    cancel-delete: 撤销删除并登录

</i18n>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { API_BASE, validateEmail, validatePassword, toast, changeLocale, type IConfirmDialog } from '../common';
import { useApi, storeTokens, apiError } from '../api/client';

import LoadOr from '../components/LoadOr.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';

const router = useRouter();

const api = useApi();
const resetPasswordUrl = `${API_BASE}/reset-password`;

const doingLogin = ref(false);

const email = ref<string>();
const password = ref<string>();

const errorMessage = ref<string>();

// Holds the credentials of an in-flight login that was blocked by a pending
// delete request, so the dialog can resume it with `cancelDeleteRequest: true`.
let pendingBody: { email: string; password: string } | undefined;
const deleteRequestDialog = ref<IConfirmDialog>();

async function performLogin(body: { email: string; password: string }, cancelDeleteRequest = false) {
  const { data, error } = await api.POST('/login', {
    body: { ...body, cancelDeleteRequest },
  });
  if (error || !data) {
    const err = apiError(error);
    if (err.code === 'PENDING_DELETE_REQUEST' && !cancelDeleteRequest) {
      pendingBody = body;
      deleteRequestDialog.value?.showModal();
      return;
    }
    errorMessage.value = err.message || t('login-failed');
    return;
  }
  storeTokens(data);
  toast(t('logged-in'));
  router.back();
  api.GET('/me').then(({ data: me }) => {
    if (me) changeLocale(me.language);
  });
}

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
    await performLogin({ email: email.value!, password: pwd });
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : String(e);
  } finally {
    doingLogin.value = false;
  }
}

async function cancelDeleteAndLogin() {
  if (!pendingBody) return;
  await performLogin(pendingBody, true);
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
            <a :href="resetPasswordUrl" target="_blank" class="label-text-alt link link-hover" style="color: white !important" v-t="'forget-password'"></a>
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
  <ConfirmDialog :do="cancelDeleteAndLogin" :confirm-text="t('pending-delete.cancel-delete')" ref="deleteRequestDialog">
    <h3 class="text-lg font-bold" v-t="'pending-delete.title'"></h3>
    <p class="py-2" v-t="'pending-delete.message'"></p>
  </ConfirmDialog>
</template>
