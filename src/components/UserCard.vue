<script setup lang="ts">

import { ref } from 'vue'

import { useFetchApi, fileToURL } from '../common'
import type { User } from '../model'

const props = defineProps<{ id: number }>();

const fetchApi = useFetchApi();

const user = ref<User>();
fetchApi(`/user/${props.id}`, {}, (u) => { user.value = u as User; });

</script>

<template>
  <div class="card bg-base-100 p-4 flex-col items-center">
    <div v-if="!user" class="flex w-16 justify-center items-center">
      <div class="w-2/3 loading loading-spinner"></div>
    </div>
    <div v-if="user" class="flex flex-col w-full items-center">
      <div class="avatar">
        <div class="w-24 mask mask-squircle">
          <img v-if="user?.avatar" :src="fileToURL(user.avatar)" />
          <img v-if="!user?.avatar" src="../assets/user.png" />
        </div>
      </div>
      <p class="font-black text-xl mt-2">{{ user.name }}</p>
      <p v-if="user.bio" class="text-sm text-gray-500">{{ user.bio }}</p>
      <p v-if="!user.bio" class="text-sm italic text-gray-500">该用户还没有简介</p>
      <slot />
    </div>
  </div>
</template>
