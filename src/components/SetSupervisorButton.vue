<i18n>
en:
  button: Add to Supervisor Group
  done: Added to Supervisor Group
  done-set: Added to Supervisor Group
  done-unsest: Removed from Supervisor Group

zh-CN:
  button: 添加到评议组
  done: 已添加到评议组
  done-set: 已添加到评议组
  done-unset: 已移出评议组

</i18n>

<script setup lang="ts">
import { ref } from 'vue';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { toast, toastError, useFetchApi } from '../common';
import type { User } from '../model';

import LoadOr from './LoadOr.vue';

import { Permission } from '../model';


const props = defineProps<{ id: number; initIsSupervisor: boolean }>();
const isSupervisor = ref(!!props.initIsSupervisor);

const fetchApi = useFetchApi();

const doing = ref(false);
async function switchSetSupervisor() {
  if (doing.value) return;
  doing.value = true;
  try {
    await fetchApi(`/user/${props.id}/update-roles`, {
      method: 'POST',
      json: {
        add: !isSupervisor.value ? Permission.SET_RANKED : 0,
        remove: isSupervisor.value ? Permission.SET_RANKED : 0,
      },
    });
    toast(isSupervisor.value ? t('done-unset') : t('done-set'));
    isSupervisor.value = !isSupervisor.value;
  } catch (e) {
    toastError(e);
  } finally {
    doing.value = false;
  }
}
</script>

<template>
  <button class="btn" :class="{ 'btn-secondary': !isSupervisor }" @click="switchSetSupervisor">
    <LoadOr :loading="doing">
      <template v-if="!isSupervisor">{{ t('button') }}</template>
      <template v-if="isSupervisor">
        <i class="fa-solid fa-check"></i>
        {{ t('done') }}
      </template>
    </LoadOr>
  </button>
</template>
