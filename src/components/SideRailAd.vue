<script setup lang="ts">
import { onMounted } from 'vue';

defineProps<{ side: 'left' | 'right' }>();

onMounted(() => {
  try {
    ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
  } catch (e) {
    console.error('adsbygoogle push failed', e);
  }
});
</script>

<template>
  <ins
    class="adsbygoogle fixed top-24 z-10"
    :class="side === 'left' ? 'left-12' : 'right-12'"
    style="display: inline-block; width: 160px; height: 600px"
    data-ad-client="ca-pub-5774998175455449"
    data-ad-slot="9344957809"></ins>
</template>
