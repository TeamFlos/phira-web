<i18n lang="yml" src="@/locales/form.yml"></i18n>
<i18n>
en:
  registering: Registering
  registered: Registered

zh-CN:
  registering: 正在注册中
  registered: 注册成功

</i18n>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { useFetchApi, validateEmail, validatePassword, toast } from './common';

import LoadOr from './components/LoadOr.vue';

const router = useRouter();

const fetchApi = useFetchApi();

const doingRegister = ref(false);

const email = ref<string>();
const username = ref<string>();
const password = ref<string>();
const password2 = ref<string>();

const errorMessage = ref<string>();

async function submit() {
  if (doingRegister.value) {
    toast(t('registering'), 'warning');
    return;
  }
  errorMessage.value = undefined;
  doingRegister.value = true;
  try {
    validateEmail(t, email.value!);
    let pwd = password.value!,
      pwd2 = password2.value!;
    validatePassword(pwd, pwd2);
    await fetchApi('/register', {
      method: 'POST',
      json: {
        email: email.value!,
        name: username.value!,
        password: pwd,
      },
    });
    toast(t('registered'));
    router.back();
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : String(e);
  } finally {
    doingRegister.value = false;
  }
}
</script>

<template>
  <div class="flex justify-center items-center p-8">
    <div
      class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-gradient-to-r from-sky-400 to-blue-500 mt-16"
    >
      <div class="card-body">
        <h2 class="card-title text-white" v-t="'register'"></h2>
        <div class="form-control">
          <div class="label">
            <span
              class="label-text text-inherit text-white"
              v-t="'email.label'"
            ></span>
          </div>
          <input
            type="email"
            :placeholder="t('email.hint')"
            class="input input-bordered"
            v-model="email"
          />
        </div>
        <div class="form-control">
          <div class="label">
            <span
              class="label-text text-inherit text-white"
              v-t="'username.label'"
            ></span>
          </div>
          <input
            type="text"
            :placeholder="t('username.hint')"
            class="input input-bordered"
            v-model="username"
          />
        </div>
        <div class="form-control">
          <div class="label">
            <span
              class="label-text text-inherit text-white"
              v-t="'password.label'"
            ></span>
          </div>
          <input
            type="password"
            :placeholder="t('password.hint')"
            class="input input-bordered"
            v-model="password"
          />
        </div>
        <div class="form-control">
          <div class="label">
            <span
              class="label-text text-inherit text-white"
              v-t="'password-confirm.label'"
            ></span>
          </div>
          <input
            type="password"
            :placeholder="t('password-confirm.hint')"
            class="input input-bordered"
            v-model="password2"
          />
        </div>
        <div class="form-control">
          <div v-if="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>
        </div>
        <div class="form-control mt-6">
          <button
            class="btn glass text-white"
            :class="{ disabled: doingRegister }"
            @click="submit"
          >
            <LoadOr :loading="doingRegister">{{ t('register') }}</LoadOr>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
