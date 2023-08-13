<script setup lang="ts">

import { ref, h } from 'vue'

const props = defineProps<{ init?: number, total: number }>();

const current = ref(props.init ?? 1);

function PageButton(
  props: { 'class'?: string, page: number }
) {
  return h(
    'button',
    {
      'class': 'join-item btn',
      onClick() {
        current.value = props.page;
      }
    },
    String(props.page),
  );
}

defineExpose({ current });

</script>

<template>
  <div class="join">
    <button class="join-item btn" :class="{ 'btn-disabled': current === 1 }">«</button>
    <PageButton v-if="current >= 4" :page="1" />
    <button class="join-item btn btn-disabled" v-if="current >= 6">…</button>
    <PageButton v-if="current === 5" :page="2" />
    <PageButton v-if="current >= 3" :page="current - 2" />
    <PageButton v-if="current >= 2" :page="current - 1" />
    <PageButton v-if="total" class="btn-accent" :page="current" />
    <PageButton v-if="current + 1 <= total" :page="current + 1" />
    <PageButton v-if="current + 2 <= total" :page="current + 2" />
    <button class="join-item btn btn-disabled" v-if="current + 5 <= total">…</button>
    <PageButton v-if="current + 4 === total" :page="current + 3" />
    <PageButton v-if="current + 3 <= total && total > 1" :page="total" />
    <button class="join-item btn" :class="{ 'btn-disabled': current >= total }">»</button>
  </div>
</template>
