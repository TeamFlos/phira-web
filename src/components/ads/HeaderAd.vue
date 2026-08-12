<script setup lang="ts">
import { useAds } from '@/common';

const { enabled } = useAds();
</script>

<template>
  <ins v-if="enabled" class="adsbygoogle" style="display: block" data-ad-client="ca-pub-5774998175455449" data-ad-slot="2033437821"></ins>
</template>
