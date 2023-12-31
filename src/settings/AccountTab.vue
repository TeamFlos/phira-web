<i18n lang="yml" src="@/locales/form.yml"></i18n>
<i18n>
en:
  language: Language

  char: Character

  update-avatar: Update avatar
  avatar-updated: Avatar updated
  profile-updated: Profile updated

zh-CN:
  language: 语言

  char: 角色

  update-avatar: 更新头像
  avatar-updated: 头像已更新
  profile-updated: 资料已更新

</i18n>

<script setup lang="ts">
import { ref } from 'vue';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { useFetchApi, toast, toastError, uploadFile, fileToURL, LANGUAGES, changeLocale } from '../common';
import type { User } from '../model';

import LoadOr from '../components/LoadOr.vue';

const fetchApi = useFetchApi();

const user: User = (await fetchApi('/me')) as User;

const avatarImage = ref<HTMLImageElement>();
const updateAvatarButton = ref<HTMLElement>();

interface Character {
  id: string;
  name: string;
}

const avatarFile = ref<File>();
const updatingAvatar = ref(false),
  loadingChars = ref(false);
const chars = ref<Character[]>([]);

const username = ref(user.name);
const language = ref(user.language);
const bio = ref(user.bio ?? '');
const char = ref('');

(async () => {
  loadingChars.value = true;
  try {
    let characters = (await fetchApi('/me/chars?locale=' + (localStorage.getItem('locale') || 'en-US'))) as Character[];
    char.value = ((await fetchApi('/me/char')) as Character).id;
    chars.value = characters;
  } catch (e) {
    toastError(e);
  } finally {
    loadingChars.value = false;
  }
})();

const savingProfile = ref(false);

function onChangeAvatar(event: Event) {
  updateAvatarButton.value!.classList.remove('hidden');
  let reader = new FileReader();
  reader.onload = function () {
    avatarImage.value!.src = reader.result as string;
  };
  avatarFile.value = (event.target as HTMLInputElement).files![0];
  reader.readAsDataURL(avatarFile.value);
}

async function updateAvatar() {
  if (updatingAvatar.value) return;
  updatingAvatar.value = true;
  try {
    let id = await uploadFile(fetchApi, avatarFile.value!);
    await fetchApi('/me', {
      method: 'PATCH',
      json: { avatar: id },
    });
    toast(t('avatar-updated'));
    avatarFile.value = undefined;
  } catch (e) {
    toastError(e);
  } finally {
    updatingAvatar.value = false;
  }
}

async function saveProfile() {
  if (savingProfile.value) return;
  savingProfile.value = true;
  try {
    await fetchApi('/me', {
      method: 'PATCH',
      json: {
        name: username.value,
        language: language.value,
        bio: bio.value.length ? bio.value : null,
        char: loadingChars.value ? null : char.value,
      },
    });
    changeLocale(language.value);
    toast(t('profile-updated'));
  } catch (e) {
    toastError(e);
  } finally {
    savingProfile.value = false;
  }
}

import defaultAvatar from '@/assets/user.png';
const initAvatar = user.avatar ? fileToURL(user.avatar) : defaultAvatar;
</script>

<template>
  <div class="flex flex-col lg:flex-row items-center lg:items-start">
    <div class="flex flex-col w-36 avatar avatar-lg mb-4 lg:m-8">
      <div class="rounded-full">
        <label>
          <input type="file" class="hidden" accept="image/png, image/jpeg, image/webp" @change="onChangeAvatar" />
          <img :src="initAvatar" class="cursor-pointer" ref="avatarImage" />
        </label>
      </div>
      <button class="btn btn-secondary m-3" :class="{ hidden: !avatarFile }" @click="updateAvatar" ref="updateAvatarButton">
        <LoadOr :loading="updatingAvatar">{{ t('update-avatar') }}</LoadOr>
      </button>
    </div>
    <div class="flex flex-col gap-2 grow w-full lg:w-auto">
      <div class="form-control grow">
        <div class="label">
          <span class="label-text text-inherit" v-t="'username.label'"></span>
        </div>
        <input type="text" :placeholder="t('username.hint')" class="input input-bordered" v-model="username" />
      </div>
      <div class="flex flex-col form-control grow">
        <div class="label">
          <span class="label-text text-inherit">
            {{ t('language') }}
            <i class="fa-solid fa-globe"></i>
          </span>
        </div>
        <select class="select select-bordered w-full" v-model="language">
          <option v-for="(label, key) in LANGUAGES" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
      </div>
      <div class="form-control grow">
        <div class="label">
          <span class="label-text text-inherit" v-t="'char'"></span>
          <div v-if="loadingChars" class="loading loading-sm"></div>
        </div>
        <select class="select select-bordered w-full" v-model="char">
          <option v-for="char in chars" :key="char.id" :value="char.id">
            {{ char.name }}
          </option>
        </select>
      </div>
      <div class="form-control grow">
        <div class="label">
          <span class="label-text text-inherit" v-t="'bio.label'"></span>
        </div>
        <textarea :placeholder="t('bio.hint')" class="textarea textarea-bordered min-h-[240px]" v-model="bio"></textarea>
      </div>
      <div class="flex justify-end">
        <button class="btn btn-primary mt-2" @click="saveProfile">
          <LoadOr :loading="savingProfile">{{ t('save') }}</LoadOr>
        </button>
      </div>
    </div>
  </div>
</template>
