<script setup lang="ts">

import AppHeader from './components/AppHeader.vue'
import Loader from './components/Loader.vue'

import Toasts from './components/Toasts.vue'

</script>

<template>
  <AppHeader/>
  <div class="w-screen">
    <router-view v-slot="{ Component }">
      <Suspense timeout="0">
        <template #default>
          <component :is="Component"/>
        </template>
        <template #fallback>
          <div class="flex justify-center">
            <Loader/>
          </div>
        </template>
      </Suspense>
    </router-view>
    <Toasts/>
  </div>
</template>
