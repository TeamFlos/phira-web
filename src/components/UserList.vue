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

import { useFetchApi, pageCount, userNameClass, LANGUAGES } from '../common';
import type { Page, User } from '../model';

const PAGE_NUM = 20;

import LoadView from './LoadView.vue';
import PageIndicator from './PageIndicator.vue';
import UserAvatar from './UserAvatar.vue';

import moment from 'moment';

const props = defineProps<{ initPage?: number; params?: object }>();

const fetchApi = useFetchApi();

const pagination = ref<typeof PageIndicator>();

const totalCount = ref(0);
const users = ref<User[]>();

const page = computed(() => pagination.value?.current ?? props.initPage ?? 1);

const parameters = computed(() => {
  return {
    page: String(page.value),
    ...(props.params ?? {}),
  };
});

async function fetchUsers() {
  users.value = undefined;
  let params = {
    pageNum: String(PAGE_NUM),
    ...parameters.value,
  };
  const resp = (await fetchApi('/user/?' + new URLSearchParams(params))) as Page<User>;
  totalCount.value = resp.count;
  users.value = resp.results;
}

defineExpose({ pagination });

await fetchUsers();

onMounted(() => {
  watch(parameters, fetchUsers);
});
</script>

<template>
  <div class="overflow-x-auto flex flex-col items-end gap-2">
    <div class="overflow-x-auto w-full">
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
    <PageIndicator :total="pageCount(totalCount, PAGE_NUM)" ref="pagination" :init="props.initPage ?? 1" />
  </div>
</template>
