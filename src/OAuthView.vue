<i18n lang="yml" src="@/locales/oauth.yml"></i18n>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { useFetchApi, toast } from './common';
import type { OAuthApp } from './model';

import LoadOr from './components/LoadOr.vue';

const router = useRouter();

const clientID = router.currentRoute.value.query.clientID as string;
const redirectURI = router.currentRoute.value.query.redirectURI as string;
const scope = router.currentRoute.value.query.scope as string;
const state = router.currentRoute.value.query.state as string | undefined;

console.log(state);

const fetchApi = useFetchApi();

const app = reactive<OAuthApp>((await fetchApi(`/oauth/${clientID}`)) as OAuthApp);

const errorMessage = ref<string>();

const doingAuth = ref(false);

let location = '/';

const perms = '';

async function auth() {
  if (doingAuth.value) {
    toast(t('auth-doing'), 'error');
    return;
  }
  errorMessage.value = undefined;
  doingAuth.value = true;
  try {
    let q = new URLSearchParams({
      response_type: 'code',
      client_id: clientID,
      redirect_uri: redirectURI,
      scope,
    });
    if (state != undefined) {
      q.append('state', state);
    }
    let resp = (await fetchApi(`/oauth/authorize?${q}`, {
      method: 'GET',
    })) as { code: string; state: string; location: string };
    if (state != undefined && state !== resp.state) {
      throw new Error('Invalid state');
    }
    let old_param = new URLSearchParams(redirectURI.split('?')[1] ?? '');
    let redir_param = {
      ...Object.fromEntries(old_param),
      code: resp.code,
      state: resp.state,
    };
    q = new URLSearchParams(redir_param);
    location = redirectURI.split('?')[0] + '?' + q;
    console.log('ok');
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : String(e);
  } finally {
    doingAuth.value = false;
    setTimeout(() => {
      window.location.href = location;
    }, 1000);
  }
}
</script>

<template>
  <div class="flex justify-center items-center p-8">
    <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-gradient-to-r from-sky-400 to-blue-500 mt-16">
      <div class="form-control mt-6">
        <div class="flex justify-center items-center">
          <img :src="app.avatar" alt="AppIcon" class="shadow-2xl rounded-lg max-h-16 sm:max-h-20 md:max-h-24 lg:max-h-24 mx-2 sm:mx-4" />
          <i class="fa-solid fa-ellipsis mx-2" style="color: #cccccc" />
          <i class="fa-solid fa-link mx-1" style="color: #ffffff" />
          <i class="fa-solid fa-ellipsis mx-2" style="color: #cccccc" />
          <img src="./assets/icon.png" alt="Phira" class="shadow-2xl rounded-lg max-h-16 sm:max-h-20 md:max-h-24 lg:max-h-24 mx-2 sm:mx-4" />
        </div>
      </div>
      <div class="card-body">
        <h2 class="card-title text-white">{{ t('auth-title') }}</h2>
        <p class="text-white">{{ perms }}</p>
        <div class="form-control mt-6">
          <button class="btn glass text-white" :class="{ disabled: doingAuth }" @click="auth">
            <LoadOr :loading="doingAuth">{{ t('auth') }}</LoadOr>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
