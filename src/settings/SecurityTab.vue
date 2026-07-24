<i18n lang="yml" src="@/locales/form.yml"></i18n>
<i18n>
en:
  edit-password: Edit password
  password-updated: Password updated
  old-password: Original password

  hykb:
    title: HYKB (好游快爆) account
    bound: 'Bound · UID {uid}'
    not-bound: Not bound
    unbind: Unbind
    confirm-title: Unbind HYKB account?
    confirm-desc: You will no longer be able to log in with this HYKB account. Make sure you have set an email and password first, otherwise you may lose access to your account.
    unbound: HYKB account unbound

zh-CN:
  edit-password: 更改密码
  password-updated: 更改密码成功
  old-password: 原密码

  hykb:
    title: 好游快爆账号
    bound: '已绑定 · UID {uid}'
    not-bound: 未绑定
    unbind: 解绑
    confirm-title: 解绑好游快爆账号？
    confirm-desc: 解绑后你将无法再使用该好游快爆账号登录。请确保已设置邮箱和密码，否则可能无法登录账号。
    unbound: 已解绑好游快爆账号

</i18n>

<script setup lang="ts">
import { ref } from 'vue';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { toast, toastError, validatePassword, type IConfirmDialog } from '../common';
import { useApi, errMessage } from '../api/client';

import LoadOr from '../components/LoadOr.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';

const api = useApi();

const { data: user, error: userError } = await api.GET('/me');
if (!user) throw new Error(errMessage(userError) || 'error');
const hykbUid = ref<number | null>(user.hykb_uid ?? null);

const password_old = ref<string>();
const password = ref<string>();
const password2 = ref<string>();

const changingPassword = ref(false);

async function changePassword() {
  if (changingPassword.value) return;
  changingPassword.value = true;
  try {
    let pwd_old = password_old.value!,
      pwd = password.value!,
      pwd2 = password2.value!;
    validatePassword(t, pwd_old);
    validatePassword(t, pwd, pwd2);
    const { error } = await api.POST('/edit/password', {
      body: {
        old: pwd_old,
        new: pwd,
      },
    });
    if (error) {
      toastError(new Error(errMessage(error) || 'error'));
      return;
    }
    password_old.value = undefined;
    password.value = undefined;
    password2.value = undefined;
    toast(t('password-updated'));
  } catch (e) {
    toastError(e);
  } finally {
    changingPassword.value = false;
  }
}

const unbindDialog = ref<IConfirmDialog>();

async function unbindHykb() {
  const { error } = await api.POST('/me/unbind-hykb');
  if (error) throw new Error(errMessage(error) || 'error');
  hykbUid.value = null;
  toast(t('hykb.unbound'));
}

import tabLoading from '../views/SettingsView.vue';
tabLoading.value = false;
</script>

<template>
  <div class="flex flex-col gap-2">
    <h1 class="card-title" v-t="'edit-password'"></h1>
    <div class="form-control grow">
      <input type="password" :placeholder="t('old-password')" class="input input-bordered" v-model="password_old" />
    </div>
    <div class="form-control grow">
      <input type="password" :placeholder="t('password.label')" class="input input-bordered" v-model="password" />
    </div>
    <div class="form-control grow">
      <input type="password" :placeholder="t('password-confirm.label')" class="input input-bordered" v-model="password2" />
    </div>
    <div class="flex flex-row-reverse">
      <button class="btn btn-primary" @click="changePassword">
        <LoadOr :loading="changingPassword">{{ t('save') }}</LoadOr>
      </button>
    </div>

    <div class="divider"></div>

    <h1 class="card-title" v-t="'hykb.title'"></h1>
    <div class="flex flex-row items-center gap-4">
      <span class="grow">
        {{ hykbUid !== null ? t('hykb.bound', { uid: hykbUid }) : t('hykb.not-bound') }}
      </span>
      <button v-if="hykbUid !== null" class="btn btn-error btn-outline" @click="unbindDialog!.showModal()" v-t="'hykb.unbind'"></button>
    </div>

    <ConfirmDialog :do="unbindHykb" ref="unbindDialog">
      <h3 class="font-bold text-lg" v-t="'hykb.confirm-title'"></h3>
      <p class="mt-4" v-t="'hykb.confirm-desc'"></p>
    </ConfirmDialog>
  </div>
</template>
