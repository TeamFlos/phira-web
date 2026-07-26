<script lang="ts">
import { onErrorCaptured, ref, watch } from 'vue';

const onLoaded = ref<() => void>();
const component = ref();

watch(component, (comp) => {
  if (comp && onLoaded.value) onLoaded.value();
});

export function useOnLoaded() {
  return onLoaded;
}

export default {};
</script>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed } from 'vue';

import { toastError } from './common';
import AdBlockNotice from './components/AdBlockNotice.vue';
import AppFooter from './components/AppFooter.vue';
import AppHeader from './components/AppHeader.vue';
import FooterAd from './components/FooterAd.vue';
import LoadView from './components/LoadView.vue';
import SideRailAd from './components/SideRailAd.vue';

onErrorCaptured((err) => {
  toastError(err);
  return false;
});

// Only mount the side rails when there's genuinely enough spare width beside
// the content for a 160px ad on each side; otherwise don't render/request
// them at all (a hidden-but-requested ad can run afoul of AdSense policy).
const { width } = useWindowSize();
const showSideRails = computed(() => width.value >= 1600);
</script>

<template>
  <AppHeader />
  <div class="w-full mt-20">
    <router-view v-slot="{ Component }">
      <Suspense timeout="0">
        <template #default>
          <component :is="Component" ref="component" />
        </template>
        <template #fallback>
          <div class="flex justify-center">
            <LoadView />
          </div>
        </template>
      </Suspense>
    </router-view>
  </div>
  <div class="w-full flex justify-center px-4 mt-8">
    <div class="w-full max-w-4xl">
      <FooterAd />
    </div>
  </div>
  <AppFooter />
  <AdBlockNotice />
  <template v-if="showSideRails">
    <SideRailAd side="left" />
    <SideRailAd side="right" />
  </template>
</template>
