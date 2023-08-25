<i18n lang="yml" src="@/locales/user.yml"></i18n>
<i18n>
en:
  play-count: Play Count
  avg-accuracy: Avg. Accuracy

  recent-records: Recent Records

  report:
    button: Report User
    hint: Report reason. 10 to 200 characters.
    done: Reported successfully. Thank you for your contribution to the health of the Phira community!

  ban:
    button: Ban User
    confirm: 'Are you sure to ban this user?'
    done: Banned

  upload:
    title: Uploaded charts
    more: See More
    no-charts: This user did not upload any charts.

  num-follower: Follower
  num-following: Following

zh-CN:
  play-count: 总游玩次数
  avg-accuracy: 平均准确率

  recent-records: 最近游玩记录

  report:
    button: 举报用户
    hint: 请填写举报理由，10 - 200 字
    done: 举报成功，感谢你对 Phira 社区健康作出的贡献！

  ban:
    button: 封禁用户
    confirm: 你确定要封禁该用户吗？
    done: 已封禁

  upload:
    title: 上传的谱面
    more: 查看更多
    no-charts: 该用户没有上传谱面

  num-follower: 粉丝
  num-following: 关注的人

</i18n>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRoute } from 'vue-router';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { useFetchApi, userNameClass, detailedTime, LANGUAGES, toast, toastError, loggedIn, setTitle } from './common';
import { Permission, Roles, type Chart, type User, type UserView, type Page } from './model';

import ChartCard from './components/ChartCard.vue';
import FollowButton from './components/FollowButton.vue';
import SetReviewerButton from './components/SetReviewerButton.vue';
import SetSupervisorButton from './components/SetSupervisorButton.vue';
import LoadOr from './components/LoadOr.vue';
import LoadView from './components/LoadView.vue';
import PropItem from './components/PropItem.vue';
import RecordList from './components/RecordList.vue';
import UserAvatar from './components/UserAvatar.vue';

const route = useRoute();

const fetchApi = useFetchApi();

const id = parseInt(String(route.params.id));
const user = reactive((await fetchApi(`/user/${id}`)) as UserView);
const charts = ref<Chart[]>();
const chartHasMore = ref(false);

fetchApi(`/chart/?uploader=${id}&pageNum=3`, {}, (raw) => {
  let resp = raw as Page<Chart>;
  charts.value = resp.results;
  chartHasMore.value = resp.results.length < resp.count;
});

setTitle(user.name);

const me = ref<User>();

if (loggedIn()) {
  fetchApi('/me', {}, (user) => (me.value = user as User));
}

const stats = (await fetchApi(`/user/${id}/stats`)) as {
  numRecords: number;
  avgAccuracy: number;
};

const confirmBanDialog = ref<HTMLDialogElement>();
const banning = ref(false);
async function ban() {
  if (banning.value) return;
  banning.value = true;
  try {
    await fetchApi(`/user/${id}/ban`, { method: 'POST' });
    toast(t('ban.done'));
    user.banned = true;
    confirmBanDialog.value!.close();
  } catch (e) {
    toastError(e);
  } finally {
    banning.value = false;
  }
}

function tryCloseBan() {
  if (!banning.value) confirmBanDialog.value!.close();
}

const reportDialog = ref<HTMLDialogElement>();
const reportReason = ref('');
const reporting = ref(false);
async function report() {
  if (reporting.value) return;
  reporting.value = true;
  try {
    await fetchApi(`/user/${id}/report`, {
      method: 'POST',
      json: {
        reason: reportReason.value!,
      },
    });
    toast(t('report.done'));
    reportDialog.value!.close();
  } catch (e) {
    toastError(e);
  } finally {
    reporting.value = false;
  }
}
function tryCloseReport() {
  if (!reporting.value) reportDialog.value!.close();
}
</script>

<template>
  <div class="flex flex-row justify-center">
    <div class="lg:w-3/4 mx-8">
      <div class="card card-compact bg-base-100 shadow-xl">
        <figure>
          <img src="./assets/banner.jpg" class="object-cover max-h-[30vh] w-full" />
        </figure>
        <div class="card-body">
          <div class="flex flex-col lg:flex-row items-center lg:items-start">
            <div class="avatar lg:ml-6 -mt-14">
              <div class="w-32 mask mask-squircle">
                <UserAvatar :url="user.avatar" />
              </div>
            </div>
            <div class="flex flex-col items-center mt-3 lg:mt-0 lg:ml-4 lg:items-start grow">
              <p class="font-black text-3xl" :class="[userNameClass(user.badges)]">
                {{ user.name }}
              </p>
              <p v-if="user.bio" class="whitespace-nowrap">{{ user.bio }}</p>
              <p v-else class="text-sm italic text-gray-500" v-t="'bio-empty'"></p>
            </div>
            <div class="flex flex-row flex-wrap justify-center lg:-mt-4">
              <a class="stat w-fit group cursor-pointer" :href="`/user/?following=${id}`" target="_blank">
                <div class="stat-title text-center group-hover:link" v-t="'num-follower'"></div>
                <div class="stat-value text-center">
                  {{ user.follower_count }}
                </div>
              </a>
              <a class="stat w-fit group cursor-pointer" :href="`/user/?followedBy=${id}`" target="_blank">
                <div class="stat-title text-center group-hover:link" v-t="'num-following'"></div>
                <div class="stat-value text-center">
                  {{ user.following_count }}
                </div>
              </a>
              <div class="stat w-fit">
                <div class="stat-title text-center" v-t="'play-count'"></div>
                <div class="stat-value text-center">{{ stats.numRecords }}</div>
              </div>
              <div class="stat w-fit">
                <div class="stat-title text-center" v-t="'avg-accuracy'"></div>
                <div class="stat-value text-center">
                  {{ (stats.avgAccuracy * 100).toFixed(2) + '%' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col lg:flex-row mt-4 gap-4">
        <div class="lg:w-1/4 flex flex-col gap-3">
          <div class="gap-1 join join-vertical">
            <FollowButton class="join-item" :id="id" :initFollowing="user.following" />
            <button class="btn btn-error join-item" v-t="'report.button'" @click="() => {
                reportReason = '';
                reportDialog!.showModal();
              }
              "></button>
            <template v-if="me && Roles.from(me.roles).permissions(me.banned).has(Permission.BAN_USER)">
              <button v-if="!user.banned" class="btn btn-error join-item" @click="confirmBanDialog!.showModal()"
                v-t="'ban.button'"></button>
              <button v-else class="btn btn-disabled w-full" v-t="'ban.button'"></button>
            </template>
          </div>

          <div
            v-if="me && (Roles.from(me.roles).permissions(me.banned).has(Permission.SET_REVIEWER) || Roles.from(me.roles).permissions(me.banned).has(Permission.SET_SUPERVISOR))"
            class="gap-1 join join-vertical">
            <SetReviewerButton v-if="me && Roles.from(me.roles).permissions(me.banned).has(Permission.SET_REVIEWER)"
              class="join-item" :id="id"
              :initIsReviewer="Roles.from(user.roles).permissions(me.banned).has(Permission.REVIEW)" />
            <SetSupervisorButton v-if="me && Roles.from(me.roles).permissions(me.banned).has(Permission.SET_SUPERVISOR)"
              class="join-item" :id="id"
              :initIsSupervisor="Roles.from(user.roles).permissions(me.banned).has(Permission.SET_RANKED)" />
          </div>

          <div class="card bg-base-100 shadow-xl p-4">
            <div class="flex flex-col w-full gap-2">
              <PropItem :title="t('last-login')" :value="detailedTime(user.last_login)" multi />
              <PropItem :title="t('registered-at')" :value="detailedTime(user.joined)" multi />
              <PropItem :title="t('language')" :value="LANGUAGES[user.language as keyof typeof LANGUAGES]" multi />
            </div>
          </div>
        </div>
        <div class="grow flex flex-col gap-3">
          <div class="card bg-base-100 shadow-xl p-4">
            <h2 class="text-2xl" v-t="'upload.title'"></h2>
            <div v-if="!charts" class="w-full flex justify-center">
              <LoadView />
            </div>
            <div v-if="charts && charts.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-2 gap-4">
              <ChartCard v-for="chart in charts" :key="chart.id" :chart="chart" />
            </div>
            <div v-if="chartHasMore" class="flex flex-row-reverse mt-4">
              <router-link :to="`/chart/?uploader=${id}`" class="btn" v-t="'upload.more'"></router-link>
            </div>
            <div v-if="charts && !charts.length" class="text-center p-8">
              <p class="italic w-full" v-t="'upload.no-charts'"></p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl p-4">
            <h2 class="text-2xl" v-t="'recent-records'"></h2>
            <RecordList class="mt-2" :params="{ player: String(user.id) }" :limit="12" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <dialog class="modal modal-bottom sm:modal-middle" ref="confirmBanDialog" id="ban" @close.prevent="tryCloseBan">
    <div class="modal-box">
      <h3 class="font-bold text-lg" v-t="'warning'"></h3>
      <p class="py-4" v-t="'ban.confirm'"></p>
      <div class="modal-action">
        <button class="btn btn-neutral" :disabled="banning" @click="tryCloseBan" v-t="'cancel'"></button>
        <button class="btn btn-error" @click="ban">
          <LoadOr :loading="banning">{{ t('confirm') }}</LoadOr>
        </button>
      </div>
    </div>
    <div class="modal-backdrop">
      <button class="cursor-default" @click="tryCloseBan"></button>
    </div>
  </dialog>
  <dialog class="modal modal-bottom sm:modal-middle" id="report" ref="reportDialog" @close.prevent="tryCloseReport">
    <div class="modal-box">
      <h3 class="font-bold text-lg" v-t="'report.button'"></h3>
      <textarea class="textarea textarea-bordered h-32 w-full mt-4" :placeholder="t('report.hint')"
        v-model="reportReason"></textarea>
      <div class="modal-action">
        <button class="btn btn-neutral" :disabled="reporting" @click="tryCloseReport" v-t="'cancel'"></button>
        <button class="btn btn-error" @click="report">
          <LoadOr :loading="reporting">{{ t('confirm') }}</LoadOr>
        </button>
      </div>
    </div>
    <div class="modal-backdrop">
      <button class="cursor-default" @click="tryCloseReport"></button>
  </div>
</dialog></template>
