<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { isString } from './common';

import UserList from './components/UserList.vue';

const route = useRoute();
const router = useRouter();

const list = ref<typeof UserList>();

const searchValue = ref(''),
  tempSearchValue = ref<string>();

let initPage = 1;

watch(
  () => route.query,
  () => {
    let q = route.query;
    if (isString(q.search))
      tempSearchValue.value = searchValue.value = q.search;
    if (q.page) {
      let page = 1;
      try {
        page = parseInt(q.page as string);
      } catch (e) {
        // empty
      }
      if (list.value) {
        list.value!.pagination.current = page;
      } else {
        initPage = page;
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
  return res;
});

const parameters = computed(() => {
  let res = {
    page: String(list.value?.pagination.current ?? 1),
    ...subParameters.value,
  };
  return res;
});

onMounted(() => {
  watch(parameters, (params) => {
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
          @keyup.enter="
            list!.pagination.current = 1;
            searchValue = tempSearchValue!;
          "
        />
        <button
          class="btn btn-secondary join-item rounded-r-full"
          @click="
            list!.pagination.current = 1;
            searchValue = tempSearchValue!;
          "
        >
          <i class="fa-solid fa-search"></i>
        </button>
      </div>
      <div class="card bg-base-100 shadow-xl p-4 mt-4 w-full">
        <UserList ref="list" :initPage="initPage" :params="subParameters" />
      </div>
    </div>
  </div>
</template>
