<i18n>
en:
  placeholder: Search tracks, artists, rights holders…
  search: Search
  tracks: Tracks
  artists: Artists
  rights-holders: Rights holders
  empty-tracks: No matching tracks.
  empty-artists: No matching artists.
  empty-rights-holders: No matching rights holders.
  empty-hint: Enter a keyword to search the content-policy library.
  aliases: 'Aliases:'
  note: 'Note:'
  reason: 'Reason:'
  track-count: '{count} tracks'
  inherits-from: Inherits from {name}
  independent: Independent track
  prev: Previous
  next: Next

zh-CN:
  placeholder: 搜索曲目、艺人、版权方…
  search: 搜索
  tracks: 曲目
  artists: 艺人
  rights-holders: 版权方
  empty-tracks: 没有匹配的曲目。
  empty-artists: 没有匹配的艺人。
  empty-rights-holders: 没有匹配的版权方。
  empty-hint: 输入关键词搜索版权政策库。
  aliases: 别名：
  note: 备注：
  reason: 原因：
  track-count: '{count} 首曲目'
  inherits-from: 继承自 {name}
  independent: 独立曲目
  prev: 上一页
  next: 下一页
</i18n>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useApi } from '../api/client';
import type { PolicySearchR } from '../model';
import { effectiveTrackStatus, policyBadgeClass, policyStatusIcon } from '../policy';

const { t } = useI18n();
const api = useApi();

const query = ref('');
const page = ref(1);
const loading = ref(false);
const result = ref<PolicySearchR>();
/** Whether any query has been run, so the empty state can pick its hint. */
const searched = ref(false);

/** The endpoint returns no total count, so "next" is offered as long as the
 * current page carried anything — an empty page is the signal to stop. */
const hasResults = (r: PolicySearchR) => r.tracks.length + r.artists.length + r.rightsHolders.length > 0;

async function load(p: number) {
  const q = query.value.trim();
  if (!q) return;
  loading.value = true;
  const { data, error } = await api.GET('/content-policy/search', {
    params: { query: { q, page: p } },
    toastError: true,
  });
  loading.value = false;
  if (error || !data) return;
  result.value = data as PolicySearchR;
  page.value = p;
  searched.value = true;
}

function submit() {
  load(1);
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <form class="join w-full" @submit.prevent="submit">
      <input v-model="query" class="input input-bordered join-item grow" :placeholder="t('placeholder')" />
      <button type="submit" class="btn btn-primary join-item" :disabled="loading">
        <span v-if="loading" class="loading loading-spinner loading-sm"></span>
        <i v-else class="fa-solid fa-magnifying-glass"></i>
        {{ t('search') }}
      </button>
    </form>

    <p v-if="!searched" class="italic opacity-60 text-center py-4">{{ t('empty-hint') }}</p>

    <template v-if="result">
      <!-- tracks -->
      <section class="flex flex-col gap-2">
        <h2 class="text-sm font-bold tracking-wider opacity-50">{{ t('tracks') }}</h2>
        <p v-if="!result.tracks.length" class="italic opacity-60">{{ t('empty-tracks') }}</p>
        <div v-for="track in result.tracks" :key="track.id" class="card bg-base-100 border border-base-300 p-3 flex flex-col gap-1">
          <div class="flex flex-row items-center gap-2 flex-wrap">
            <span class="font-bold">{{ track.name }}</span>
            <span class="opacity-70 text-sm">— {{ track.artist }}</span>
            <span class="badge" :class="policyBadgeClass(effectiveTrackStatus(track))">
              <i class="fa-solid mr-1" :class="policyStatusIcon(effectiveTrackStatus(track))"></i>
              {{ t(`policy-status.${effectiveTrackStatus(track)}`) }}
            </span>
          </div>
          <div v-if="track.aliases?.length" class="flex flex-row gap-1 flex-wrap text-sm">
            <span class="opacity-60">{{ t('aliases') }}</span>
            <span v-for="alias in track.aliases" :key="alias" class="badge badge-ghost badge-sm">{{ alias }}</span>
          </div>
          <p v-if="track.note" class="text-sm opacity-80">{{ t('note') }}{{ track.note }}</p>
          <p v-if="track.rhName" class="text-sm opacity-60">{{ t('inherits-from', { name: track.rhName }) }}</p>
        </div>
      </section>

      <!-- artists -->
      <section class="flex flex-col gap-2">
        <h2 class="text-sm font-bold tracking-wider opacity-50">{{ t('artists') }}</h2>
        <p v-if="!result.artists.length" class="italic opacity-60">{{ t('empty-artists') }}</p>
        <div v-for="artist in result.artists" :key="artist.id" class="card bg-base-100 border border-base-300 p-3 flex flex-col gap-1">
          <div class="flex flex-row items-center gap-2 flex-wrap">
            <span class="font-bold">{{ artist.name }}</span>
            <span class="badge" :class="policyBadgeClass(artist.status)">
              <i class="fa-solid mr-1" :class="policyStatusIcon(artist.status)"></i>
              {{ t(`policy-status.${artist.status}`) }}
            </span>
          </div>
          <div v-if="artist.aliases?.length" class="flex flex-row gap-1 flex-wrap text-sm">
            <span class="opacity-60">{{ t('aliases') }}</span>
            <span v-for="alias in artist.aliases" :key="alias" class="badge badge-ghost badge-sm">{{ alias }}</span>
          </div>
          <p v-if="artist.reason" class="text-sm opacity-80">{{ t('reason') }}{{ artist.reason }}</p>
          <p v-if="artist.note" class="text-sm opacity-80">{{ t('note') }}{{ artist.note }}</p>
        </div>
      </section>

      <!-- rights holders -->
      <section class="flex flex-col gap-2">
        <h2 class="text-sm font-bold tracking-wider opacity-50">{{ t('rights-holders') }}</h2>
        <p v-if="!result.rightsHolders.length" class="italic opacity-60">{{ t('empty-rights-holders') }}</p>
        <div v-for="holder in result.rightsHolders" :key="holder.id" class="card bg-base-100 border border-base-300 p-3 flex flex-col gap-1">
          <div class="flex flex-row items-center gap-2 flex-wrap">
            <span class="font-bold">{{ holder.name }}</span>
            <span class="badge" :class="policyBadgeClass(holder.status)">
              <i class="fa-solid mr-1" :class="policyStatusIcon(holder.status)"></i>
              {{ t(`policy-status.${holder.status}`) }}
            </span>
            <span class="badge badge-ghost">{{ t('track-count', { count: holder.trackCount }) }}</span>
          </div>
          <p v-if="holder.note" class="text-sm opacity-80">{{ t('note') }}{{ holder.note }}</p>
        </div>
      </section>

      <div class="join self-center" v-if="page > 1 || hasResults(result)">
        <button class="join-item btn" :disabled="page <= 1" @click="load(page - 1)">« {{ t('prev') }}</button>
        <button class="join-item btn btn-disabled">{{ page }}</button>
        <button class="join-item btn" :disabled="!hasResults(result)" @click="load(page + 1)">{{ t('next') }} »</button>
      </div>
    </template>
  </div>
</template>
