<script setup lang="ts">
import { ref } from 'vue';

import { useI18n } from 'vue-i18n';
useI18n();

import { userNameClass } from '../common';
import { useApi } from '../api/client';
import type { UserView } from '../model';

import UserAvatar from './UserAvatar.vue';
import UserBadges from './UserBadges.vue';

const props = defineProps<{ id: number }>();

const api = useApi();

const user = ref<UserView>();
api.GET('/user/{id}', { params: { path: { id: props.id } } }).then(({ data }) => {
  if (data) user.value = data;
});
</script>

<template>
  <div class="bg-base-100 p-4 flex-col items-center">
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
      <UserBadges :badges="user.badges" :names="user.badgeNames" sm class="mt-1" />
    </div>
  </div>
</template>
