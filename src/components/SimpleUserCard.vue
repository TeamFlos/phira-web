<script setup lang="ts">
import { ref } from 'vue';

import { useI18n } from 'vue-i18n';
useI18n();

import { useFetchApi, userNameClass } from '../common';
import type { UserView } from '../model';

import UserAvatar from './UserAvatar.vue';

const props = defineProps<{ id: number }>();

const fetchApi = useFetchApi();

const user = ref<UserView>();
fetchApi(`/user/${props.id}`, {}, (u) => {
  user.value = u as UserView;
});
</script>

<template>
  <div class="card bg-base-100 p-4 shadow-xl flex-col items-center">
    <div v-if="!user" class="flex w-16 justify-center items-center">
      <div class="w-2/3 loading loading-spinner"></div>
    </div>
    <div v-else class="flex flex-col w-full items-start">
      <router-link :to="`/user/${user.id}`" class="group flex flex-row items-center">
        <div class="avatar">
          <div class="w-12 mask mask-squircle">
            <UserAvatar :url="user.avatar" />
          </div>
        </div>
        <p class="font-black text-xl group-hover:link mx-2" :class="[userNameClass(user.badges)]">
          {{ user.name }}
        </p>
      </router-link>
    </div>
  </div>
</template>
