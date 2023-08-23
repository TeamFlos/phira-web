<script setup lang="ts">
import { ref, watch } from 'vue';

const props = withDefaults(defineProps<{ name: string; modelValue?: number; canBeZero?: boolean }>(), {
  modelValue: 0,
  canBeZero: false,
});

const selected = ref(props.modelValue);

defineExpose({ modelValue: selected });
const emit = defineEmits(['update:modelValue']);

watch(selected, (it) => emit('update:modelValue', it));
</script>

<template>
  <div class="justify-center rating rating-lg rating-half">
    <input type="radio" :name="name" class="rating-hidden" :disabled="!canBeZero" :checked="!selected" v-model="selected" :value="0" />
    <template v-for="index in 5" :key="index">
      <input type="radio" :name="name" class="bg-green-500 mask mask-star-2 mask-half-1" :checked="selected === index * 2 - 1" v-model="selected" :value="index * 2 - 1" />
      <input type="radio" :name="name" class="bg-green-500 mask mask-star-2 mask-half-2" :checked="selected === index * 2" v-model="selected" :value="index * 2" />
    </template>
  </div>
</template>
