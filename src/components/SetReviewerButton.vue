<i18n>
en:
  button: Add to Reviewer Group
  done: Added to Reviewer Group
  done-set: Added to Reviewer Group
  done-unsest: Removed from Reviewer Group

zh-CN:
  button: 添加到审核组
  done: 已添加到审核组
  done-set: 已添加到审核组
  done-unset: 已移出审核组

</i18n>

<script setup lang="ts">
import { ref } from 'vue';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { toast, toastError, useFetchApi } from '../common';

import LoadOr from './LoadOr.vue';

import { Role } from '../model';


const props = defineProps<{ id: number; initIsReviewer: boolean }>();
const isReviewer = ref(!!props.initIsReviewer);

const fetchApi = useFetchApi();

const doing = ref(false);
async function switchSetReviewer() {
  if (doing.value) return;
  doing.value = true;
  try {
    await fetchApi(`/user/${props.id}/update-roles`, {
      method: 'POST',
      json: {
        add: !isReviewer.value ? Role.REVIEWER : 0,
        remove: isReviewer.value ? Role.REVIEWER : 0,
      },
    });
    toast(isReviewer.value ? t('done-unset') : t('done-set'));
    isReviewer.value = !isReviewer.value;
  } catch (e) {
    toastError(e);
  } finally {
    doing.value = false;
  }
}
</script>

<template>
  <button class="btn" :class="{ 'btn-secondary': !isReviewer }" @click="switchSetReviewer">
    <LoadOr :loading="doing">
      <template v-if="!isReviewer">{{ t('button') }}</template>
      <template v-if="isReviewer">
        <i class="fa-solid fa-check"></i>
        {{ t('done') }}
      </template>
    </LoadOr>
  </button>
</template>
