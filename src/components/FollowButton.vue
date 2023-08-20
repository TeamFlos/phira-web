<i18n>
en:
  button: Follow
  done: Following
  done-follow: Followed
  done-unfollow: Unfollowed
  error-follow-self: You cannot follow yourself

zh-CN:
  button: 关注
  done: 已关注
  done-follow: 已关注
  done-unfollow: 已取关
  error-follow-self: 不能关注自己

</i18n>

<script setup lang="ts">
import { ref } from 'vue';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { toast, toastError, useFetchApi } from '../common';
import type { User } from '../model';

import LoadOr from './LoadOr.vue';

const props = defineProps<{ id: number; initFollowing: boolean }>();
const following = ref(!!props.initFollowing);

const fetchApi = useFetchApi();

const doing = ref(false);
const me: User = (await fetchApi('/me')) as User;
async function switchFollow() {
  if (props.id == me.id) return toast(t('error-follow-self'));
  if (doing.value) return;
  doing.value = true;
  try {
    await fetchApi(`/user/${props.id}/follow`, {
      method: 'POST',
      json: {
        follow: !following.value,
      },
    });
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
