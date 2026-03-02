<script setup lang="ts">
import { computed } from 'vue';

import { fileToURL } from '../common';

const props = withDefaults(
  defineProps<{
    image?: string | null;
    backdropClass?: string;
    fadeClass?: string;
    fadeHeightClass?: string;
    backdropStyle?: Record<string, string>;
  }>(),
  {
    backdropClass: '',
    fadeClass: '',
    fadeHeightClass: 'h-48 -mt-48',
    backdropStyle: () => ({}),
  },
);

const hasImage = computed(() => Boolean(props.image));
const backgroundStyle = computed(() => {
  if (!hasImage.value) return props.backdropStyle;
  return {
    ...props.backdropStyle,
    'background-image': `url(${fileToURL(props.image!)})`,
  };
});
</script>

<template>
  <div v-if="hasImage" :style="backgroundStyle" class="w-full illustration" :class="backdropClass"></div>
  <div v-if="hasImage && (fadeHeightClass || fadeClass)" class="w-full bg-gradient-to-b from-transparent to-base-200" :class="[fadeHeightClass, fadeClass]"></div>
</template>
