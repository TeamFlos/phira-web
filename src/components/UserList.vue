<i18n lang="yml" src="@/locales/user.yml"></i18n>
<i18n>
en:
  id: ID
  name: Name

zh-CN:
  id: ID
  name: 用户名

</i18n>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

import { useI18n } from 'vue-i18n';
useI18n();

import { useFetchApi, userNameClass, LANGUAGES } from '../common';
import type { Page, User } from '../model';

const PAGE_NUM = 30;

import LoadView from './LoadView.vue';
import UserAvatar from './UserAvatar.vue';

import moment from 'moment';

const props = defineProps<{ params?: object }>();

const fetchApi = useFetchApi();

const users = ref<User[]>();

// 游标分页：page 参数是 user id 游标，后端返回 id >= page 的前 PAGE_NUM 个用户。
// cursorStack 记录每一页的起始游标，用于支持「上一页」回退。
const cursorStack = ref<number[]>([0]);
const cursor = computed(() => cursorStack.value[cursorStack.value.length - 1]);
const hasNext = ref(false);

async function fetchUsers() {
  users.value = undefined;
  const params = {
    page: String(cursor.value),
    ...(props.params ?? {}),
  };
  const resp = (await fetchApi('/user/?' + new URLSearchParams(params))) as Page<User>;
  users.value = resp.results;
  // 满页则认为还有下一页（临界情况下可能多出一个空页，可接受）。
  hasNext.value = resp.results.length >= PAGE_NUM;
}

function nextPage() {
  if (!hasNext.value || !users.value?.length) return;
  cursorStack.value.push(users.value[users.value.length - 1].id + 1);
  fetchUsers();
}

function prevPage() {
  if (cursorStack.value.length <= 1) return;
  cursorStack.value.pop();
  fetchUsers();
}

await fetchUsers();

onMounted(() => {
  // 参数（搜索、关注筛选等）变化时回到第一页。
  watch(
    () => props.params,
    () => {
      cursorStack.value = [0];
      fetchUsers();
    },
  );
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="card bg-base-100 shadow-xl p-4 overflow-x-auto w-full">
      <table class="table">
        <thead>
          <tr>
            <th v-t="'id'"></th>
            <th v-t="'name'"></th>
            <th v-t="'last-login'"></th>
            <th v-t="'language'"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="hover text-lg">
            <th class="text-center">{{ user.id }}</th>
            <td>
              <router-link :to="`/user/${user.id}`" class="flex flex-row items-center gap-2 group">
                <div class="avatar">
                  <div class="w-12 rounded-xl">
                    <UserAvatar :url="user.avatar" />
                  </div>
                </div>
                <div class="ml-2 flex flex-col">
                  <span :class="[userNameClass(user.badges)]" class="group-hover:link font-black text-xl">
                    <del v-if="user.login_banned">{{ user.name }}</del>
                    <span v-else>{{ user.name }}</span>
                  </span>
                  <span v-if="user.bio" class="text-xs truncate">{{ user.bio }}</span>
                </div>
              </router-link>
            </td>
            <td>{{ moment(user.last_login).fromNow() }}</td>
            <td>{{ LANGUAGES[user.language as keyof typeof LANGUAGES] }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!users" class="w-full flex flex-row justify-center my-4">
        <LoadView />
      </div>
    </div>
    <div class="join self-center mt-2">
      <button class="join-item btn btn-ghost" :class="{ 'btn-disabled': cursorStack.length <= 1 }" @click="prevPage">«</button>
      <button class="join-item btn btn-ghost pointer-events-none font-normal">{{ cursorStack.length }}</button>
      <button class="join-item btn btn-ghost" :class="{ 'btn-disabled': !hasNext }" @click="nextPage">»</button>
    </div>
  </div>
</template>
