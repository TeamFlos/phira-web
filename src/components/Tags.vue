<script setup lang="ts">

import { ref, reactive } from 'vue'

import { toast } from '../common'

const props = defineProps<{ init?: string[] }>();

const tags = reactive<string[]>(props.init? [...props.init]: []);

const newTag = ref('');

function addTag() {
  let tag = newTag.value;
  if (!tag.length) {
    toast('标签不能为空', 'error');
    return;
  }
  tag = tag.trim();
  if (tags.includes(tag)) {
    toast('标签已存在', 'error');
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

defineExpose({ tags });

</script>

<template>
  <div class="flex flex-wrap flex-row gap-2">
    <div v-for="tag in tags" v-bind:key="tag" class="badge badge-neutral text-sm h-[2rem] cursor-pointer" @click="removeTag(tag)">{{ tag }}</div>
    <div class="join w-32">
      <input class="input input-bordered join-item rounded-l-full w-full text-sm h-[2rem]" placeholder="添加…" v-model="newTag" @keyup.enter="addTag" />
      <button class="btn btn-primary join-item rounded-r-full h-[2rem] min-h-0 p-2" @click="addTag">
        <i class="fa-solid fa-add"></i>
      </button>
    </div>
  </div>
</template>
