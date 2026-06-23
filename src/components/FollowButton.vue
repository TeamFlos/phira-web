<i18n>
en:
  button: Follow
  done: Following
  done-follow: Followed
  done-unfollow: Unfollowed

zh-CN:
  button: 关注
  done: 已关注
  done-follow: 已关注
  done-unfollow: 已取关

</i18n>

<script setup lang="ts">
import { ref } from 'vue';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { toast, toastError } from '../common';
import { useApi, errMessage } from '../api/client';

import LoadOr from './LoadOr.vue';

const props = defineProps<{ id: number; initFollowing: boolean }>();
const following = ref(!!props.initFollowing);

const api = useApi();

const doing = ref(false);
async function switchFollow() {
  if (doing.value) return;
  doing.value = true;
  try {
    const { error } = await api.POST('/user/{id}/follow', {
      params: { path: { id: props.id } },
      body: { follow: !following.value },
    });
    if (error) {
      toastError(new Error(errMessage(error) || 'error'));
      return;
    }
    toast(following.value ? t('done-unfollow') : t('done-follow'));
    following.value = !following.value;
  } catch (e) {
    toastError(e);
  } finally {
    doing.value = false;
  }
}
</script>

<template>
  <button class="btn" :class="{ 'btn-secondary': !following }" @click="switchFollow">
    <LoadOr :loading="doing">
      <template v-if="!following">{{ t('button') }}</template>
      <template v-if="following">
        <i class="fa-solid fa-check"></i>
        {{ t('done') }}
      </template>
    </LoadOr>
  </button>
</template>
