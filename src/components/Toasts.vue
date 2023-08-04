<script lang="ts">

import { ref, reactive } from 'vue'

type ToastKind = 'error' | 'info' | 'warning' | 'success';

interface Toast {
  id: number,
  message: string,
  kind: ToastKind,
}

let counter = 0;

const container = ref<HTMLElement>();
const toasts = reactive<Toast[]>([]);

export function toast(message: string, kind?: ToastKind) {
  let toast = { id: counter++, message, kind: kind ?? 'info' };
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

const KIND_CLASS_NAME = {
  'info': 'alert-info',
  'error': 'alert-error',
  'warning': 'alert-warning',
  'success': 'alert-success',
};

export default {}

</script>

<script setup lang="ts">

const containerThis = container;

</script>

<template>
  <div class="toast toast-top toast-end z-[33]" ref="containerThis">
    <div v-for="toast in toasts" :key="toast.id" class="alert" :class="KIND_CLASS_NAME[toast.kind]">
      <span>{{ toast.message }}</span>
    </div>
  </div>
</template>
