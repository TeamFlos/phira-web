<script setup lang="ts">
import { ref } from 'vue';

import { useI18n } from 'vue-i18n';
useI18n();

import { useFetchApi, userNameClass } from '../common';
import type { UserView } from '../model';

import FollowButton from './FollowButton.vue';
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
    <div v-else class="flex flex-col w-full items-center">
      <router-link :to="`/user/${user.id}`" class="group flex flex-col items-center">
        <div class="avatar">
          <div class="w-24 mask mask-squircle">
            <UserAvatar :url="user.avatar" />
          </div>
        </div>
        <span class="font-black text-xl group-hover:link mt-2" :class="[userNameClass(user.badges)]">
          <del v-if="user.login_banned">{{ user.name }}</del>
          <span v-else>{{ user.name }}</span>
        </span>
      </router-link>
      <p v-if="user.bio" class="text-sm text-gray-500">{{ user.bio }}</p>
      <p v-else class="text-sm italic text-gray-500" v-t="'bio-empty'"></p>
      <FollowButton class="mt-2" :id="id" :initFollowing="user.following" />
      <slot />
    </div>
  </div>
</template>
