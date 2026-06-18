<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { isString } from '../common';

import UserList from '../components/UserList.vue';

const route = useRoute();
const router = useRouter();

const searchValue = ref(''),
  tempSearchValue = ref<string>();

let following: number | null = null,
  followedBy: number | null = null;

watch(
  () => route.query,
  () => {
    let q = route.query;
    if (isString(q.search)) tempSearchValue.value = searchValue.value = q.search;
    if (q.following) {
      try {
        following = parseInt(q.following as string);
      } catch (e) {
        // empty
      }
    }
    if (q.followedBy) {
      try {
        followedBy = parseInt(q.followedBy as string);
      } catch (e) {
        // empty
      }
    }
  },
  { immediate: true },
);

const subParameters = computed(() => {
  let res: Record<string, string> = {};
  if (searchValue.value?.length) {
    res.search = searchValue.value;
  }
  if (following) res.following = String(following);
  if (followedBy) res.followedBy = String(followedBy);
  return res;
});

onMounted(() => {
  watch(subParameters, (params) => {
    router.push({ query: params });
  });
});
</script>

<template>
  <div class="flex flex-row justify-center w-full">
    <div class="mx-8 max-w-none w-full lg:w-3/4 flex flex-col items-end">
      <div class="ml-auto join w-full lg:w-auto">
        <input
          class="input input-bordered join-item rounded-l-full w-full"
          :placeholder="t('search')"
          v-model="tempSearchValue"
          @keyup.enter="searchValue = tempSearchValue!" />
        <button class="btn btn-secondary join-item rounded-r-full" @click="searchValue = tempSearchValue!">
          <i class="fa-solid fa-search"></i>
        </button>
      </div>
      <div class="mt-4 w-full">
        <UserList :params="subParameters" />
      </div>
    </div>
  </div>
</template>
