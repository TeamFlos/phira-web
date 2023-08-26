<i18n>
en:
  set: Set as {role}
  cancel: Cancel {role}
  done-set: Set role successfully
  done-cancel: Removed role successfully

  role:
    reviewer: Reviewer
    supervisor: Supervisor

zh-CN:
  set: 设置为 {role}
  cancel: 取消 {role}
  done-set: 设置角色成功
  done-cancel: 取消角色成功

  role:
    reviewer: 审核员
    supervisor: 评议员

</i18n>

<script setup lang="ts">
import { ref } from 'vue';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { toast, toastError, useFetchApi, userPermissions } from '../common';
import { Permission, Role, type User } from '../model';

import LoadOr from './LoadOr.vue';

const ROLES = {
  reviewer: Role.REVIEWER,
  supervisor: Role.SUPERVISOR,
};

const props = defineProps<{ id: number; role: keyof typeof ROLES; initHasRole: boolean; me?: User; permission: Permission }>();
const hasRole = ref(!!props.initHasRole);

const fetchApi = useFetchApi();

const doing = ref(false);
async function switchSetReviewer() {
  if (doing.value) return;
  doing.value = true;
  try {
    let role = ROLES[props.role];
    await fetchApi(`/user/${props.id}/update-roles`, {
      method: 'POST',
      json: {
        add: !hasRole.value ? role : 0,
        remove: hasRole.value ? role : 0,
      },
    });
    toast(hasRole.value ? t('done-cancel') : t('done-set'));
    hasRole.value = !hasRole.value;
  } catch (e) {
    toastError(e);
  } finally {
    doing.value = false;
  }
}
</script>

<template>
  <button v-if="me && userPermissions(me).has(permission)" class="btn" :class="{ 'btn-secondary': !hasRole }" @click="switchSetReviewer">
    <LoadOr :loading="doing">
      <template v-if="!hasRole">{{ t('set', { 'role': t('role.' + role) }) }}</template>
      <template v-if="hasRole">
        <i class="fa-solid fa-check"></i>
        {{ t('cancel', { 'role': t('role.' + role) }) }}
      </template>
    </LoadOr>
  </button>
</template>
