<script setup lang="ts">

withDefaults(defineProps<{ title: string, value: string, multi?: boolean }>(), {
  multi: false
});

</script>

<template>
  <div v-if="!multi" class="flex flex-row">
    <span class="grow">{{ title }}</span>
    <span class="ml-4 text-primary-content">{{ value }}</span>
  </div>
  <div v-else class="flex flex-col">
    <span class="text-sm">{{ title }}</span>
    <span class="text-primary-content">{{ value }}</span>
  </div>
</template>
