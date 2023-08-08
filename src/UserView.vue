<script setup lang="ts">

import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'

import { useFetchApi, fileToURL, userNameClass, detailedTime, LANGUAGES, toast, toastError, getCookie } from './common'
import { Permission, Roles, type User } from './model'

import LoadOr from './components/LoadOr.vue'
import Property from './components/Property.vue'
import RecordList from './components/RecordList.vue'
import UserCard from './components/UserCard.vue'

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
    toast('已封禁');
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
                <img v-if="user?.avatar" :src="fileToURL(user.avatar)" />
                <img v-else src="./assets/user.png" />
              </div>
            </div>
            <div class="flex flex-col items-center mt-3 lg:mt-0 lg:ml-4 lg:items-start grow">
              <p class="font-black text-3xl" :class="[userNameClass(user.badges)]">{{ user.name }}</p>
              <p v-if="user.bio" class="whitespace-nowrap">{{ user.bio }}</p>
              <p v-else class="text-sm italic text-gray-500">该用户还没有简介</p>
            </div>
            <div class="flex flex-row lg:-mt-4">
              <div class="stat">
                <div class="stat-title text-center">总游玩次数</div>
                <div class="stat-value text-center">{{ stats.numRecords }}</div>
              </div>
              <div class="stat">
                <div class="stat-title text-center">平均准确率</div>
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
              <Property title="上次登录于" :value="detailedTime(user.last_login)" multi />
              <Property title="注册于" :value="detailedTime(user.joined)" multi />
              <Property title="语言" :value="LANGUAGES[user.language as (keyof typeof LANGUAGES)]" multi />
            </div>
          </div>
          <div v-if="me && Roles.from(me.roles).permissions(me.banned).has(Permission.BAN_USER)" class="card">
            <button v-if="!user.banned" class="btn btn-error mt-2 w-full" @click="confirmDeleteDialog!.showModal()">封禁用户</button>
            <button v-else class="btn btn-disabled mt-2 w-full">封禁用户</button>
          </div>
        </div>
        <div class="card bg-base-100 shadow-xl grow p-4">
          <h2 class="text-2xl">最近游玩记录</h2>
          <RecordList class="mt-2" :params="{ player: String(user.id) }" :limit="12" />
        </div>
      </div>
    </div>
  </div>
  <dialog class="modal modal-bottom sm:modal-middle" ref="confirmDeleteDialog" @close.prevent="tryCloseBan">
    <div class="modal-box">
      <h3 class="font-bold text-lg">警告</h3>
      <p class="py-4">你确定要封禁该用户吗？</p>
      <div class="modal-action">
        <button class="btn btn-neutral" :disabled="banning" @click="tryCloseBan">取消</button>
        <button class="btn btn-error" @click="ban">
          <LoadOr :loading="banning">确定</LoadOr>
        </button>
      </div>
    </div>
    <div class="modal-backdrop">
      <button class="cursor-default" @click="tryCloseBan"></button>
    </div>
  </dialog>
</template>
