<script setup lang="ts">

defineProps<{
  loading: boolean,
}>();

</script>

<template>
  <span v-if="loading" class="loading loading-spinner"></span>
  <slot v-if="!loading" />
</template>
