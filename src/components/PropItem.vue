<script setup lang="ts">

withDefaults(defineProps<{ title: string, value: string, multi?: boolean }>(), {
  multi: false
});

</script>

<template>
  <div v-if="!multi" class="flex flex-row">
    <span class="grow whitespace-nowrap">{{ title }}</span>
    <span class="ml-4 base-content truncate">{{ value }}</span>
  </div>
  <div v-else class="flex flex-col">
    <span class="text-sm whitespace-nowrap">{{ title }}</span>
    <span class="base-content truncate">{{ value }}</span>
  </div>
</template>
