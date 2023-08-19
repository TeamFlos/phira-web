<script lang="ts">

import { ref, watch } from 'vue'

const onLoaded = ref<() => void>();
const component = ref();

watch(component, (comp) => {
  if (comp && onLoaded.value) onLoaded.value();
});

export function useOnLoaded() {
  return onLoaded;
}

export default {}

</script>

<script setup lang="ts">

import AppFooter from './components/AppFooter.vue'
import AppHeader from './components/AppHeader.vue'
import LoadView from './components/LoadView.vue'
import ToastsView from './components/ToastsView.vue'

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
    <ToastsView />
  </div>
  <AppFooter />
</template>
