<script setup lang="ts">

import { toast } from './components/Toasts.vue'

import { ref } from 'vue'
import { useFetchApi, fileToURL, uploadFile } from './common'
import { User } from './model'

import LoadOr from './components/LoadOr.vue'

const fetchApi = useFetchApi();

const user: User = await fetchApi('/me') as User;

const avatarImage = ref<HTMLImageElement>(null);
const updateAvatarButton = ref<HTMLElement>(null);

const avatarFile = ref<File>(null);
const updatingAvatar = ref(false);

const username = ref(user.name);
const language = ref(user.language);
const bio = ref(user.bio);

const savingProfile = ref(false);

function onChangeAvatar(event: Event) {
  updateAvatarButton.value.classList.remove('hidden');
  let reader = new FileReader();
  reader.onload = function() {
    avatarImage.value.src = reader.result as string;
  };
  avatarFile.value = (event.target as HTMLInputElement).files[0];
  reader.readAsDataURL(avatarFile.value);
}

async function updateAvatar() {
  if (updatingAvatar.value) return;
  updatingAvatar.value = true;
  try {
    let id = await uploadFile(fetchApi, avatarFile.value);
    await fetchApi('/me', {
      method: 'PATCH',
      json: { avatar: id },
    });
    toast('头像已更新');
    avatarFile.value = null;
  } catch (e) {
    toast(e.message, 'error');
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
        bio: bio.value.length? bio.value: null,
      }
    });
    toast('资料已更新');
  } catch (e) {
    toast(e.message, 'error');
  } finally {
    savingProfile.value = false;
  }
}

</script>

<template>
  <div class="flex justify-center mt-8 min-h-[24px] p-6">
    <div class="flex flex-col w-full lg:flex-row lg:w-2/3 gap-4">
      <ul class="menu bg-base-200 lg:w-56 rounded-box">
        <li><a>账户</a></li>
        <li><a>安全</a></li>
        <li><a>邮件</a></li>
      </ul>
      <div class="flex flex-col grow card bg-base-200 min-h-12 p-8">
        <div class="flex flex-row">
          <div class="flex flex-col w-36 avatar avatar-lg m-8">
            <div class="rounded-full">
              <label>
                <input type="file" class="hidden" accept="image/png, image/jpeg, image/webp" @change="onChangeAvatar" />
                <img :src="fileToURL(user.avatar)" class="cursor-pointer" ref="avatarImage" />
              </label>
            </div>
            <button class="btn btn-secondary m-3" :class="{ hidden: !avatarFile }" @click="updateAvatar" ref="updateAvatarButton">
              <LoadOr :loading="updatingAvatar">更新头像</LoadOr>
            </button>
          </div>
          <div class="flex flex-col gap-2 grow">
            <div class="form-control grow">
              <div class="label">
                <span class="label-text text-inherit">用户名</span>
              </div>
              <input type="text" placeholder="名字" class="input input-bordered" v-model="username"/>
            </div>
            <div class="flex flex-col form-control grow">
              <div class="label">
                <span class="label-text text-inherit">
                  语言
                  <i class="fa-solid fa-globe"></i>
                </span>
              </div>
              <select class="select select-bordered w-full" v-model="language">
                <option value="en-US">English</option>
                <option value="zh-CN">简体中文</option>
                <option value="zh-TW">繁體中文</option>
              </select>
            </div>
            <div class="form-control grow">
              <div class="label">
                <span class="label-text text-inherit">简介</span>
              </div>
              <input type="text" placeholder="个人简介" class="input input-bordered" v-model="bio"/>
            </div>
            <div class="flex justify-end">
              <button class="btn btn-primary mt-2" @click="saveProfile">
                <LoadOr :loading="savingProfile">保存</LoadOr>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
