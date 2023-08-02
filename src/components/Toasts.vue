<script lang="ts">

import { ref, reactive } from 'vue'

interface Toast {
  id: number,
  message: string,
  className: string,
}

let counter = 0;

const container = ref<HTMLElement>();
const toasts = reactive<Toast[]>([]);

export function toast(message: string, kind?: 'error' | 'info' | 'warning' | 'success') {
  let toast = { id: counter++, message, className: 'alert-' + (kind || 'info') };
  toasts.push(toast);
  setTimeout(
    () => {
      let index = toasts.indexOf(toast);
      let element = container.value!.children[index] as HTMLElement;
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

export default {}

</script>

<script setup lang="ts">
</script>

<template>
  <div class="toast toast-top toast-end" ref="container">
    <div v-for="toast in toasts" :key="toast.id" class="alert" :class="toast.className">
      <span>{{ toast.message }}</span>
    </div>
  </div>
</template>
