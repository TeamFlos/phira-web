<i18n>
en:
  subs:
    title: Email Subscription
    review: Chart review notification
    stb: Chart stb. notification
    save: Save
    done: Settings saved

zh-CN:
  subs:
    title: 邮箱订阅
    review: 谱面审核通知
    stb: 谱面上架通知
    save: 保存
    done: 设定保存成功

</i18n>

<script setup lang="ts">

import { ref, reactive } from 'vue'

import { useI18n } from 'vue-i18n'
const { t } = useI18n();

import { useFetchApi, toast, toastError } from '../common'
import type { EmailSubs } from '../model'

import LoadOr from '../components/LoadOr.vue'

const fetchApi = useFetchApi();

const subs = reactive(await fetchApi('/me/subs') as EmailSubs);

const savingSubs = ref(false);
async function saveSubs() {
  if (savingSubs.value) return;
  savingSubs.value = true;
  try {
    await fetchApi(`/me/subs`, {
      method: 'PATCH',
      json: subs,
    });
    toast(t('subs.done'));
  } catch (e) {
    toastError(e);
  } finally {
    savingSubs.value = false;
  }
}

</script>

<template>
  <div class="flex flex-col gap-2">
    <h1 class="card-title" v-t="'subs.title'"></h1>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
      <div class="flex flex-row">
        <p class="grow" v-t="'subs.review'"></p>
        <input type="checkbox" class="checkbox" v-model="subs.review" />
      </div>
      <div class="flex flex-row">
        <p class="grow" v-t="'subs.stb'"></p>
        <input type="checkbox" class="checkbox" v-model="subs.stb" />
      </div>
    </div>
    <div class="flex flex-row-reverse mt-4">
      <button class="btn btn-primary" @click="saveSubs">
        <LoadOr :loading="savingSubs">{{ t('subs.save') }}</LoadOr>
      </button>
    </div>
  </div>
</template>
