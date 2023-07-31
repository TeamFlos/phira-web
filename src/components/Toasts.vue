<script lang="ts">

import { ref, reactive } from 'vue'

const container = ref<HTMLElement>(null);
const toasts = reactive<Toast[]>([]);

export function toast(message: string, kind?: 'error' | 'info' | 'warning' | 'success') {
  let toast = { message, className: 'alert-' + (kind || 'info') };
  toasts.push(toast);
  setTimeout(
    () => {
      let index = toasts.indexOf(toast);
      let element = container.value.children[index] as HTMLElement;
      element.style.animation = 'toast-out 0.25s ease-out';
      element.style.opacity = '0';
      element.addEventListener('animationend', () => {
        let index = toasts.indexOf(toast);
        toasts.splice(index, 1);
      });
    },
    2000
  );
}

</script>

<script setup lang="ts">

interface Toast {
  message: string,
  className: string,
}

</script>

<template>
  <div class="toast toast-top toast-end" ref="container">
    <div v-for="toast in toasts" :key="toast" class="alert" :class="toast.className">
      <span>{{ toast.message }}</span>
    </div>
  </div>
</template>
