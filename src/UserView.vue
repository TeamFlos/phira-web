<i18n lang="yml" src="@/locales/user.yml"></i18n>
<i18n>
en:
  play-count: Play Count
  avg-accuracy: Avg. Accuracy

  ban-user: Ban User
  ban-confirm: 'Are you sure to ban this user?'
  banned: Banned

  recent-records: Recent Records

zh-CN:
  play-count: 总游玩次数
  avg-accuracy: 平均准确率

  ban-user: 封禁用户
  ban-confirm: 你确定要封禁该用户吗？
  banned: 已封禁

  recent-records: 最近游玩记录

</i18n>

<script setup lang="ts">

import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'

import { useI18n } from 'vue-i18n'
const { t } = useI18n();

import { useFetchApi, userNameClass, detailedTime, LANGUAGES, toast, toastError, getCookie } from './common'
import { Permission, Roles, type User } from './model'

import LoadOr from './components/LoadOr.vue'
import PropItem from './components/PropItem.vue'
import RecordList from './components/RecordList.vue'
import UserAvatar from './components/UserAvatar.vue'

const route = useRoute();

const fetchApi = useFetchApi();

const id = parseInt(String(route.params.id));
const user = reactive(await fetchApi(`/user/${id}`) as User);

const confirmDeleteDialog = ref<HTMLDialogElement>();

const me = ref<User>();

if (getCookie('access_token')) {
  fetchApi('/me', {}, (user) => me.value = user as User);
}

const stats = await fetchApi(`/user/${id}/stats`) as {
  numRecords: number,
  avgAccuracy: number,
};

let banning = ref(false);
async function ban() {
  banning.value = true;
  try {
    await fetchApi(`/user/${id}/ban`, { method: 'POST' });
    toast(t('banned'));
    user.banned = true;
    confirmDeleteDialog.value!.close();
  } catch (e) {
    toastError(e);
  } finally {
    banning.value = false;
  }
}

function tryCloseBan() {
  if (!banning.value) confirmDeleteDialog.value!.close();
}

</script>

<template>
  <div class="flex flex-row justify-center">
    <div class="lg:w-3/4 mx-8">
      <div class="card card-compact bg-base-100 shadow-xl">
        <figure><img src="./assets/banner.jpg" class="object-cover max-h-[30vh] w-full" /></figure>
        <div class="card-body">
          <div class="flex flex-col lg:flex-row items-center lg:items-start">
            <div class="avatar lg:ml-6 -mt-14">
              <div class="w-32 mask mask-squircle">
                <UserAvatar :url="user.avatar" />
              </div>
            </div>
            <div class="flex flex-col items-center mt-3 lg:mt-0 lg:ml-4 lg:items-start grow">
              <p class="font-black text-3xl" :class="[userNameClass(user.badges)]">{{ user.name }}</p>
              <p v-if="user.bio" class="whitespace-nowrap">{{ user.bio }}</p>
              <p v-else class="text-sm italic text-gray-500" v-t="'bio-empty'"></p>
            </div>
            <div class="flex flex-row lg:-mt-4">
              <div class="stat">
                <div class="stat-title text-center" v-t="'play-count'"></div>
                <div class="stat-value text-center">{{ stats.numRecords }}</div>
              </div>
              <div class="stat">
                <div class="stat-title text-center" v-t="'avg-accuracy'"></div>
                <div class="stat-value text-center">{{ (stats.avgAccuracy * 100).toFixed(2) + '%' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col lg:flex-row mt-4 gap-4">
        <div class="lg:w-1/4">
          <div class="card bg-base-100 shadow-xl p-4">
            <div class="flex flex-col w-full gap-2">
              <PropItem :title="t('last-login')" :value="detailedTime(user.last_login)" multi />
              <PropItem :title="t('registered-at')" :value="detailedTime(user.joined)" multi />
              <PropItem :title="t('language')" :value="LANGUAGES[user.language as (keyof typeof LANGUAGES)]" multi />
            </div>
          </div>
          <div v-if="me && Roles.from(me.roles).permissions(me.banned).has(Permission.BAN_USER)" class="card shadow-xl mt-2">
            <button v-if="!user.banned" class="btn btn-error w-full"
              @click="confirmDeleteDialog!.showModal()" v-t="'ban-user'"></button>
            <button v-else class="btn btn-disabled w-full" v-t="'ban-user'"></button>
          </div>
        </div>
        <div class="card bg-base-100 shadow-xl grow p-4">
          <h2 class="text-2xl" v-t="'recent-records'"></h2>
          <RecordList class="mt-2" :params="{ player: String(user.id) }" :limit="12" />
        </div>
      </div>
    </div>
  </div>
  <dialog class="modal modal-bottom sm:modal-middle" ref="confirmDeleteDialog" @close.prevent="tryCloseBan">
    <div class="modal-box">
      <h3 class="font-bold text-lg" v-t="'warning'"></h3>
      <p class="py-4" v-t="'ban-confirm'"></p>
      <div class="modal-action">
        <button class="btn btn-neutral" :disabled="banning" @click="tryCloseBan" v-t="'cancel'"></button>
        <button class="btn btn-error" @click="ban">
          <LoadOr :loading="banning">{{ t('confirm') }}</LoadOr>
        </button>
      </div>
    </div>
    <div class="modal-backdrop">
      <button class="cursor-default" @click="tryCloseBan"></button>
    </div>
  </dialog>
</template>
