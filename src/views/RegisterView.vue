<i18n lang="yml" src="@/locales/form.yml"></i18n>
<i18n>
en:
  registering: Registering
  registered: Registered
  activate-title: Almost there!
  activate-body: We've sent an activation link to {email}. Please check your inbox (and spam folder) and click the link to activate your account.
  activate-confirm: Got it

zh-CN:
  registering: 正在注册中
  registered: 注册成功
  activate-title: 就差一步啦！
  activate-body: 我们已向 {email} 发送了一封激活邮件，请前往邮箱（记得也看看垃圾邮件）点击链接完成激活。
  activate-confirm: 知道了

</i18n>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { validateEmail, validatePassword, toast } from '../common';
import { useApi, apiError } from '../api/client';

import LoadOr from '../components/LoadOr.vue';

const router = useRouter();

const api = useApi();

const doingRegister = ref(false);

const email = ref<string>();
const username = ref<string>();
const password = ref<string>();
const password2 = ref<string>();

const errorMessage = ref<string>();

// Activation dialog shown after a successful registration.
const activateDialog = ref<HTMLDialogElement>();

async function submit() {
  if (doingRegister.value) {
    toast(t('registering'), 'error');
    return;
  }
  errorMessage.value = undefined;
  doingRegister.value = true;
  try {
    validateEmail(t, email.value!);
    let pwd = password.value!,
      pwd2 = password2.value!;
    validatePassword(t, pwd, pwd2);
    const { error } = await api.POST('/register', {
      body: {
        email: email.value!,
        name: username.value!,
        password: pwd,
      },
    });
    if (error) {
      errorMessage.value = apiError(error).message || t('register');
      return;
    }
    toast(t('registered'));
    activateDialog.value?.showModal();
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : String(e);
  } finally {
    doingRegister.value = false;
  }
}

function onActivateConfirm() {
  activateDialog.value?.close();
  router.back();
}
</script>

<template>
  <div class="flex justify-center items-center p-8">
    <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-gradient-to-r from-sky-400 to-blue-500 mt-16">
      <div class="card-body">
        <h2 class="card-title text-white" v-t="'register'"></h2>
        <div class="form-control">
          <div class="label">
            <span class="label-text text-inherit text-white" v-t="'email.label'"></span>
          </div>
          <input type="email" :placeholder="t('email.hint')" class="input input-bordered" v-model="email" />
        </div>
        <div class="form-control">
          <div class="label">
            <span class="label-text text-inherit text-white" v-t="'username.label'"></span>
          </div>
          <input type="text" :placeholder="t('username.hint')" class="input input-bordered" v-model="username" />
        </div>
        <div class="form-control">
          <div class="label">
            <span class="label-text text-inherit text-white" v-t="'password.label'"></span>
          </div>
          <input type="password" :placeholder="t('password.hint')" class="input input-bordered" v-model="password" />
        </div>
        <div class="form-control">
          <div class="label">
            <span class="label-text text-inherit text-white" v-t="'password-confirm.label'"></span>
          </div>
          <input type="password" :placeholder="t('password-confirm.hint')" class="input input-bordered" v-model="password2" />
        </div>
        <div class="form-control">
          <div v-if="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>
        </div>
        <div class="form-control mt-6">
          <button class="btn glass text-white" :class="{ disabled: doingRegister }" @click="submit">
            <LoadOr :loading="doingRegister">{{ t('register') }}</LoadOr>
          </button>
        </div>
      </div>
    </div>
  </div>
  <dialog class="modal modal-bottom sm:modal-middle" ref="activateDialog">
    <div class="modal-box">
      <h3 class="font-bold text-lg" v-t="'activate-title'"></h3>
      <i18n-t keypath="activate-body" tag="p" class="py-4">
        <template #email>
          <span class="font-semibold break-all">{{ email }}</span>
        </template>
      </i18n-t>
      <div class="modal-action">
        <button class="btn btn-primary" @click="onActivateConfirm" v-t="'activate-confirm'"></button>
      </div>
    </div>
    <div class="modal-backdrop">
      <button class="cursor-default" @click="onActivateConfirm"></button>
    </div>
  </dialog>
</template>
