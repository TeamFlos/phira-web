<script setup lang="ts">

import { useFetchApi, fileToURL } from './common'

const fetchApi = useFetchApi();

const user = await fetchApi('/me');

</script>

<template>
  <div class="flex justify-center mt-8 min-h-[24px] p-6">
    <div class="flex flex-col w-full lg:flex-row lg:w-2/3 gap-4">
      <ul class="menu bg-base-200 lg:w-56 rounded-box">
        <li><a>账户</a></li>
        <li><a>安全</a></li>
        <li><a>邮件</a></li>
      </ul>
      <div class="grow card bg-base-200 min-h-12 p-8">
        <div class="avatar avatar-lg m-8">
          <div class="w-36 rounded-full">
            <img :src="fileToURL(user.avatar)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
