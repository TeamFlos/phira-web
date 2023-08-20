<i18n>
en:
  tag-empty: Tag cannot be empty
  tag-exists: Tag already exists
  add: Add…

zh-CN:
  tag-empty: 标签不能为空
  tag-exists: 标签已存在
  add: 添加…

</i18n>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { toast } from '../common';

const props = withDefaults(defineProps<{ init?: string[]; canEdit?: boolean }>(), {
  canEdit: true,
});

const router = useRouter();

const tags = reactive<string[]>(props.init ? [...props.init] : []);

const newTag = ref('');

function addTag() {
  let tag = newTag.value;
  if (!tag.length) {
    toast(t('tag-empty'), 'error');
    return;
  }
  tag = tag.trim();
  if (tags.includes(tag)) {
    toast(t('tag-exists'), 'error');
    return;
  }
  newTag.value = '';
  tags.push(tag);
}

function removeTag(tag: string) {
  let index = tags.indexOf(tag);
  if (index !== -1) {
    tags.splice(index, 1);
  }
}

function search(tag) {
  router.push({
    path: '/chart',
    query: {
      tags: tag,
    },
  });
}

defineExpose({ tags });
</script>

<template>
  <div class="flex flex-wrap flex-row gap-2">
    <div v-for="tag in tags" :key="tag" class="badge badge-neutral text-sm h-[2rem] cursor-pointer" @click="canEdit ? removeTag(tag) : search(tag)">
      {{ tag }}
    </div>
    <div v-if="canEdit" class="join w-32">
      <input class="input input-bordered join-item rounded-l-full w-full text-sm h-[2rem]" :placeholder="t('add')" v-model="newTag" @keyup.enter="addTag" />
      <button class="btn btn-primary join-item rounded-r-full h-[2rem] min-h-0 p-2" @click="addTag">
        <i class="fa-solid fa-add"></i>
      </button>
    </div>
  </div>
</template>
