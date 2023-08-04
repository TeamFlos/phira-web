<script setup lang="ts">

import { ref, computed } from 'vue'

const emit = defineEmits<{
  (e: 'change', index: number): void
}>();

const props = defineProps<{ init?: number }>();

const selected = ref<number>(Math.round((props.init ?? 0) * 2));

</script>

<template>
  <div class="rating rating-lg rating-half" @change="$emit('change', selected)">
    <input type="radio" name="rating-10" class="rating-hidden" disabled :checked="!selected" />
    <template v-for="index in 5" :key="index">
      <input type="radio" name="rating-10" class="bg-green-500 mask mask-star-2 mask-half-1" :checked="selected === index * 2 - 1" v-model="selected" :value="index * 2 - 1" />
      <input type="radio" name="rating-10" class="bg-green-500 mask mask-star-2 mask-half-2" :checked="selected === index * 2" v-model="selected" :value="index * 2" />
    </template>
  </div>
</template>
