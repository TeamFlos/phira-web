<i18n>
en:
  back: Back to chart
  timeline: Versions
  uploader: Uploader
  detail: Details
  diff: Compare
  need-two: There is only one visible version — nothing to compare yet.
  empty: This chart has no version history.
  not-found: That version does not exist, or you cannot see it.
  stable: Stable
  pending: Pending review

zh-CN:
  back: 返回谱面
  timeline: 版本历史
  uploader: 上传者
  detail: 详情
  diff: 对比
  need-two: 只有一个可见版本，暂时无法对比。
  empty: 该谱面没有版本记录。
  not-found: 该版本不存在，或你无权查看。
  stable: 已上架
  pending: 待审核
</i18n>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { fileToURL, loggedIn, pageCount, setTitle, toast, userPermissions } from '../common';
import { useApi } from '../api/client';
import { Permission, type Chart, type ChartVersion, type User, type UserView } from '../model';
import { runMetadataRules } from '../review/metadata';

import LoadView from '../components/LoadView.vue';
import PageIndicator from '../components/PageIndicator.vue';
import ReviewCard from '../components/review/ReviewCard.vue';
import SimpleUserCard from '../components/SimpleUserCard.vue';
import VersionDetail from '../components/VersionDetail.vue';
import VersionDiff from '../components/VersionDiff.vue';
import VersionTimeline from '../components/VersionTimeline.vue';

const { t } = useI18n();
const api = useApi();
const route = useRoute();
const router = useRouter();

const PAGE_NUM = 20;

const id = parseInt(String(route.params.id));

const chartRes = await api.GET('/chart/{id}', { params: { path: { id } } });
if (chartRes.error || !chartRes.data) throw new Error();
const chart = ref<Chart>(chartRes.data as Chart);
setTitle(chart.value.name);

const me = ref<User>();
if (loggedIn()) {
  api.GET('/me').then(({ data }) => {
    if (data) me.value = data as User;
  });
}
const canReview = computed(() => !!me.value && userPermissions(me.value).has(Permission.REVIEW));

// Metadata rule findings, shared by the detail panel (inline hints next to
// the fields) and the review card (rejection templates). Reviewers only.
const uploaderName = ref<string>();
api.GET('/user/{id}', { params: { path: { id: chart.value.uploader } } }).then(({ data }) => {
  if (data) uploaderName.value = (data as UserView).name;
});
const metadataFindings = computed(() => (selected.value && canReview.value ? runMetadataRules(selected.value.content, { uploaderName: uploaderName.value }) : []));

// --- version list ---------------------------------------------------------

const versions = ref<ChartVersion[]>([]);
const totalCount = ref(0);
const loading = ref(true);
const pagination = ref<typeof PageIndicator>();
/** The version named in the URL when it is not on the page being shown. */
const detached = ref<ChartVersion>();

const selectedId = ref<number>();
const compareId = ref<number>();

async function loadVersions(page: number) {
  loading.value = true;
  try {
    const { data, error } = await api.GET('/chart/{id}/versions', {
      params: { path: { id }, query: { page, pageNum: PAGE_NUM } },
      toastError: true,
    });
    if (error || !data) return;
    versions.value = data.results as ChartVersion[];
    totalCount.value = data.count;
  } finally {
    loading.value = false;
  }
}

/** Every version the panels may reference: the current page plus, if the URL
 * points at one that isn't on it, that single extra version. */
const allVersions = computed(() => {
  const list = versions.value;
  const extra = detached.value;
  if (!extra || list.some((v) => v.id === extra.id)) return list;
  return [extra, ...list].sort((a, b) => b.id - a.id);
});

const selected = computed(() => allVersions.value.find((v) => v.id === selectedId.value));

/** The version the selected one is compared against: an explicit pick, else the
 * next older version — or, when the selection is the oldest one we can see, the
 * next newer version, so the ends of the list still have something to diff. */
const counterpart = computed(() => {
  const list = allVersions.value;
  const picked = list.find((v) => v.id === compareId.value);
  if (picked && picked.id !== selectedId.value) return picked;
  const index = list.findIndex((v) => v.id === selectedId.value);
  if (index < 0) return undefined;
  return list[index + 1] ?? list[index - 1];
});

/** The diff always reads older → newer, whichever end the user selected. */
const diffPair = computed(() => {
  const a = selected.value;
  const b = counterpart.value;
  if (!a || !b) return undefined;
  return a.id > b.id ? { base: b, target: a } : { base: a, target: b };
});

/** The version to select when the URL doesn't name one: whatever is awaiting a
 * decision, else the one currently live, else the newest. */
function preferredVersion(): ChartVersion | undefined {
  const list = allVersions.value;
  return list.find((v) => v.status === 'pending' || v.status === 'awaitingCollaborators') ?? list.find((v) => v.isPublished) ?? list[0];
}

/** Resolve the `:vid` route param, fetching it separately when it is not on the
 * current page (a link shared straight from the review queue, say). */
async function resolveSelection() {
  const param = route.params.vid;
  const wanted = param ? parseInt(String(param)) : undefined;
  if (wanted !== undefined && !isNaN(wanted)) {
    if (allVersions.value.some((v) => v.id === wanted)) {
      selectedId.value = wanted;
      return;
    }
    const { data } = await api.GET('/chart/{id}/version/{version_id}', {
      params: { path: { id, version_id: wanted } },
    });
    if (data) {
      detached.value = data as ChartVersion;
      selectedId.value = wanted;
      return;
    }
    toast(t('not-found'), 'error');
  }
  const fallback = preferredVersion();
  selectedId.value = fallback?.id;
  if (fallback) syncUrl(fallback.id, true);
}

await loadVersions(1);
await resolveSelection();

watch(
  () => pagination.value?.current,
  (page) => {
    if (page !== undefined) loadVersions(page);
  },
);

// Browser back/forward (and any external link into this page) moves the `:vid`
// param without remounting the view, so follow it.
watch(
  () => route.params.vid,
  (vid) => {
    if (vid !== undefined && parseInt(String(vid)) !== selectedId.value) resolveSelection();
  },
);

// --- selection & tab ------------------------------------------------------

const tab = ref<'detail' | 'diff'>('detail');
watch(
  () => route.hash,
  (hash) => {
    tab.value = hash === '#diff' ? 'diff' : 'detail';
  },
  { immediate: true },
);

function syncUrl(versionId: number, replace = false) {
  const to = { path: `/chart/${id}/versions/${versionId}`, hash: route.hash };
  if (replace) router.replace(to);
  else router.push(to);
}

function select(versionId: number) {
  if (versionId === selectedId.value) return;
  selectedId.value = versionId;
  if (compareId.value === versionId) compareId.value = undefined;
  syncUrl(versionId);
}

function switchTab(name: 'detail' | 'diff') {
  router.replace({ path: route.path, hash: '#' + name });
}

/** Picking what to compare against from the timeline is only meaningful on the
 * diff tab, so go there. */
function setCompare(versionId: number) {
  compareId.value = versionId;
  if (tab.value !== 'diff') switchTab('diff');
}

/** Reload chart and versions after a review vote lands. */
async function refresh() {
  const [refreshed] = await Promise.all([api.GET('/chart/{id}', { params: { path: { id } } }), loadVersions(pagination.value?.current ?? 1)]);
  if (refreshed.data) chart.value = refreshed.data as Chart;
  detached.value = undefined;
  if (!allVersions.value.some((v) => v.id === selectedId.value)) {
    selectedId.value = preferredVersion()?.id;
  }
}
</script>

<template>
  <div class="flex flex-col items-center px-4 lg:px-0 mb-24">
    <div class="w-full lg:w-3/4 flex flex-col gap-6">
      <!-- chart header -->
      <div class="card bg-base-100 border border-base-300 shadow-lg p-4 flex flex-row items-center gap-4">
        <router-link :to="`/chart/${id}`" class="shrink-0">
          <img class="w-28 aspect-[8/5] object-cover rounded-lg border border-base-300 shadow" :src="fileToURL(chart.illustration) + '.thumbnail'" />
        </router-link>
        <div class="flex flex-col min-w-0 grow">
          <span class="text-sm opacity-70 truncate">{{ chart.composer }}</span>
          <router-link :to="`/chart/${id}`" class="text-2xl font-black truncate link link-hover">{{ chart.name }}</router-link>
          <div class="flex gap-2 mt-1 flex-wrap">
            <span v-if="chart.stable" class="badge badge-success badge-outline" v-t="'stable'"></span>
            <span v-if="!chart.reviewed" class="badge badge-warning badge-outline" v-t="'pending'"></span>
          </div>
        </div>
        <router-link :to="`/chart/${id}`" class="btn btn-ghost btn-sm hidden sm:inline-flex">
          <i class="fa-solid fa-arrow-left"></i>
          {{ t('back') }}
        </router-link>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- version line -->
        <aside class="lg:w-72 shrink-0 lg:sticky lg:top-20 lg:self-start flex flex-col gap-4">
          <div>
            <h2 class="text-xs font-bold tracking-wider opacity-50 px-1 pb-2" v-t="'uploader'"></h2>
            <SimpleUserCard :id="chart.uploader" class="rounded-xl border border-base-300 shadow-lg" />
          </div>
          <div class="card bg-base-100 border border-base-300 shadow-lg p-3 lg:max-h-[calc(100vh-19rem)] lg:overflow-y-auto">
            <h2 class="text-xs font-bold tracking-wider opacity-50 px-1 pb-2" v-t="'timeline'"></h2>
            <LoadView v-if="loading" class="mx-auto" />
            <VersionTimeline v-else :versions="allVersions" :selectedId="selectedId" :compareId="counterpart?.id" @select="select" @setCompare="setCompare" />
          </div>
          <PageIndicator v-if="totalCount > PAGE_NUM" :total="pageCount(totalCount, PAGE_NUM)" ref="pagination" />
        </aside>

        <!-- version content -->
        <div class="grow min-w-0 flex flex-col gap-4">
          <template v-if="selected">
            <div class="flex flex-col">
              <div class="tabs">
                <a class="tab tab-lifted text-base-content" :class="{ 'tab-active': tab === 'detail' }" @click="switchTab('detail')" v-t="'detail'"></a>
                <a class="tab tab-lifted text-base-content" :class="{ 'tab-active': tab === 'diff' }" @click="switchTab('diff')" v-t="'diff'"></a>
              </div>
              <div class="card bg-base-100 border border-base-300 shadow-lg p-4 rounded-ss-none">
                <VersionDetail v-if="tab === 'detail'" :version="selected" :findings="metadataFindings" />
                <VersionDiff
                  v-else-if="diffPair"
                  :base="diffPair.base"
                  :target="diffPair.target"
                  :compareId="counterpart!.id"
                  :candidates="allVersions.filter((v) => v.id !== selected!.id)"
                  @update:compareId="compareId = $event" />
                <p v-else class="italic opacity-60 py-4" v-t="'need-two'"></p>
              </div>
            </div>
            <ReviewCard v-if="canReview" :chart="id" :uploader-id="chart?.uploader" :version="selected" :findings="metadataFindings" @reviewed="refresh" />
          </template>
          <p v-else-if="!loading" class="italic opacity-60 py-8 text-center" v-t="'empty'"></p>
        </div>
      </div>
    </div>
  </div>
</template>
