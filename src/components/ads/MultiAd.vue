<script setup lang="ts">
import { useAds } from '@/common';

const { enabled } = useAds();
</script>

<template>
  <ins v-if="enabled" class="adsbygoogle" style="display: block" data-ad-format="autorelaxed" data-ad-client="ca-pub-5774998175455449" data-ad-slot="5487145838"></ins>
</template>
