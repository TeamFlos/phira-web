<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  try {
    ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
  } catch (e) {
    console.error('adsbygoogle push failed', e);
  }
});
</script>

<template>
  <ins class="adsbygoogle" style="display: block" data-ad-client="ca-pub-5774998175455449" data-ad-slot="2221806362" data-ad-format="auto" data-full-width-responsive="true"></ins>
</template>
