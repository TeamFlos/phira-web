<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{ name: string; init?: number; canBeZero?: boolean }>(),
  {
    canBeZero: false,
  },
);

const selected = ref<number>(props.init ?? 0);

defineExpose({ selected });
</script>

<template>
  <div class="justify-center rating rating-lg rating-half">
    <input
      type="radio"
      :name="name"
      class="rating-hidden"
      :disabled="!canBeZero"
      :checked="!selected"
    />
    <template v-for="index in 5" :key="index">
      <input
        type="radio"
        :name="name"
        class="bg-green-500 mask mask-star-2 mask-half-1"
        :checked="selected === index * 2 - 1"
        v-model="selected"
        :value="index * 2 - 1"
      />
      <input
        type="radio"
        :name="name"
        class="bg-green-500 mask mask-star-2 mask-half-2"
        :checked="selected === index * 2"
        v-model="selected"
        :value="index * 2"
      />
    </template>
  </div>
</template>
