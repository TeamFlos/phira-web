<script setup lang="ts">

defineProps<{ title: string, value: string }>();

</script>

<template>
  <div class="flex flex-row">
    <span class="grow">{{ title }}</span>
    <span class="ml-4 text-primary-content whitespace-nowrap">{{ value }}</span>
  </div>
</template>
