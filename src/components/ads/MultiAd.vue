<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  try {
    ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
  } catch (e) {
    console.error('adsbygoogle push failed', e);
  }
});

const isTest = localStorage.getItem('isTest') === 'true';
</script>

<template>
  <ins v-if="isTest" class="adsbygoogle" style="display: block" data-ad-format="autorelaxed" data-ad-client="ca-pub-5774998175455449" data-ad-slot="5487145838"></ins>
</template>
