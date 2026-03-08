<i18n>
en:
  title: Censor Tool
  placeholder: Enter text to check...
  submit: Submit
  result: Result

zh-CN:
  title: 审核工具
  placeholder: 输入要检测的文本...
  submit: 提交
  result: 检测结果
</i18n>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFetchApi, toastError } from '../common';

const { t } = useI18n();
const fetchApi = useFetchApi();

type CensorSegment = { text: string; censored: boolean };

const inputText = ref('');
const loading = ref(false);
const result = ref<CensorSegment[] | null>(null);

async function submit() {
  if (!inputText.value.trim()) return;
  loading.value = true;
  result.value = null;
  try {
    const res = await fetchApi('/censor-detail', { method: 'POST', json: { text: inputText.value } });
    result.value = res as CensorSegment[];
  } catch (e) {
    toastError(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col items-center px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">{{ t('title') }}</h1>
    <div class="card bg-base-100 shadow-xl p-6 w-full max-w-2xl flex flex-col gap-4">
      <textarea v-model="inputText" class="textarea textarea-bordered w-full h-48 resize-y text-base" :placeholder="t('placeholder')"></textarea>
      <button class="btn btn-primary self-end" :disabled="loading" @click="submit">
        <span v-if="loading" class="loading loading-spinner loading-sm"></span>
        {{ t('submit') }}
      </button>
    </div>
    <div v-if="result" class="card bg-base-100 shadow-xl p-6 w-full max-w-2xl mt-6">
      <h2 class="text-xl font-semibold mb-3">{{ t('result') }}</h2>
      <p class="text-base leading-relaxed whitespace-pre-wrap break-words">
        <span v-for="(seg, i) in result" :key="i" :class="seg.censored ? 'bg-error/30 text-error font-semibold rounded px-0.5' : ''">{{ seg.text }}</span>
      </p>
    </div>
  </div>
</template>
