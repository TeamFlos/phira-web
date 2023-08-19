<script setup lang="ts">
import LoadView from "./LoadView.vue";
</script>

<template>
  <Suspense timeout="0">
    <template #default>
      <slot />
    </template>
    <template #fallback>
      <div class="flex justify-center">
        <LoadView />
      </div>
    </template>
  </Suspense>
</template>
