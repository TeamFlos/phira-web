<script lang="ts" setup>
import { fileToURL } from '../common';

import { darkTheme } from './AppHeader.vue';

import defaultAvatar from '@/assets/user.png';

defineProps<{ url?: string }>();
</script>

<template>
  <img
    :src="url ? fileToURL(url) : defaultAvatar"
    :class="{ invert: !url && !darkTheme }"
  />
</template>
