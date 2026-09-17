<i18n>
en:
  not-found: Ticket not found or not accessible.
  created: Submitted
  email: Contact
  target: Target
  original-url: Original URL
  identity-proofs: Identity proofs
  evidences: Evidence
  attachment: Item {n}
  reporter: Reporter
  staff: Staff
  internal-note: Internal note
  reply-placeholder: Write a reply (1–2000 chars)…
  send: Send
  sending: Sending…
  operation: Action
  operation-none: None (comment only)
  internal: Internal note
  validate-reply: Reply must be 1–2000 characters
  replied: Replied
  edit-title: Edit title

zh-CN:
  not-found: 工单不存在或无权访问。
  created: 提交时间
  email: 联系邮箱
  target: 举报对象
  original-url: 原作链接
  identity-proofs: 身份证明
  evidences: 证据材料
  attachment: 材料 {n}
  reporter: 举报人
  staff: 客服
  internal-note: 内部备注
  reply-placeholder: 回复…（1–2000 字）
  send: 发送
  sending: 发送中…
  operation: 处理操作
  operation-none: 无（仅回复）
  internal: 内部备注
  validate-reply: 回复需在 1–2000 字之间
  replied: 已回复
  edit-title: 编辑标题
</i18n>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

import moment from 'moment';

import { API_BASE, detailedTime, loggedIn, toast, userPermissions } from '../common';
import { useApi } from '../api/client';
import { recordIsReporter, ISSUE_OPERATIONS, statusLabelKey, TURNSTILE_SITE_KEY } from '../issue';
import { Permission, type IssueDetail, type IssueOperation, type IssueRecord } from '../model';
import Turnstile from '../components/Turnstile.vue';

import LoadView from '../components/LoadView.vue';
import IssueCategoryBadge from '../components/issue/IssueCategoryBadge.vue';
import IssueStatusBadge from '../components/issue/IssueStatusBadge.vue';
import IssueTargetLink from '../components/issue/IssueTargetLink.vue';

const { t } = useI18n();
const api = useApi();
const route = useRoute();

const id = parseInt(String(route.params.id));
const token = computed(() => {
  const v = route.query.token;
  return typeof v === 'string' && v.length ? v : undefined;
});

const issue = ref<IssueDetail>();
const notFound = ref(false);

const isStaff = ref(false);
if (loggedIn()) {
  api.GET('/me').then(({ data }) => {
    if (data) isStaff.value = userPermissions(data).has(Permission.ISSUE_OPS);
  });
}

/** `related` carries bare file names — turn them into fetchable URLs. */
function fileUrl(name: string): string {
  return `${API_BASE}/files/${name}`;
}

// --- record author (staff names link to their user page) --------------------

const staffNames = ref(new Map<number, string>());
async function resolveStaff(record: IssueRecord) {
  const uid = record.createdBy;
  if (uid == null || staffNames.value.has(uid)) return;
  staffNames.value.set(uid, `#${uid}`);
  const { data } = await api.GET('/user/{id}', { params: { path: { id: uid } } });
  if (data?.name) staffNames.value.set(uid, data.name);
}

// --- load -------------------------------------------------------------------

/** How this issue is being viewed — replies must use the same channel the
 * load succeeded on (a logged-in creator may hold a stale token). */
const mode = ref<'auth' | 'public'>('auth');

async function loadAuth(): Promise<boolean> {
  const { data, error } = await api.GET('/issue/{id}', { params: { path: { id } } });
  if (error || !data) return false;
  issue.value = data as IssueDetail;
  mode.value = 'auth';
  return true;
}

async function loadPublic(): Promise<boolean> {
  const { data, error } = await api.GET('/issue/public/{id}', {
    params: { path: { id }, query: { token: token.value! } },
  });
  if (error || !data) return false;
  issue.value = data as IssueDetail;
  mode.value = 'public';
  return true;
}

// Try the authenticated view first (staff or creator), then fall back to the
// magic-link view. The short-circuit matters: an anonymous visitor has no
// token to refresh, so an authenticated call would 401 and the client
// middleware would bounce them to /login before the public view could load.
if (!(loggedIn() && (await loadAuth())) && !(token.value && (await loadPublic()))) {
  notFound.value = true;
}
if (issue.value) {
  for (const record of issue.value.records) {
    if (!recordIsReporter(issue.value.createdBy, record)) resolveStaff(record);
  }
}

// --- title (staff-only edit) -------------------------------------------------

const editingTitle = ref(false);
const titleDraft = ref('');
const titleInput = ref<HTMLInputElement>();

function startEditTitle() {
  titleDraft.value = issue.value?.title ?? '';
  editingTitle.value = true;
  nextTick(() => titleInput.value?.focus());
}

async function saveTitle() {
  if (!issue.value) return;
  // The server trims; an empty title clears it back to the default.
  const title = titleDraft.value.trim();
  if (title === issue.value.title) {
    editingTitle.value = false;
    return;
  }
  const { data, error } = await api.PUT('/issue/{id}/title', { params: { path: { id } }, body: { title }, toastError: true });
  if (error || !data) return;
  issue.value.title = data.title;
  editingTitle.value = false;
}

// --- reply ------------------------------------------------------------------

const replyText = ref('');
const replyOperation = ref<'none' | IssueOperation>('none');
const replyInternal = ref(false);
const sending = ref(false);

// Single-use Turnstile token, only used on the magic-link channel.
const captchaToken = ref<string | null>(null);
const captchaWidget = ref<InstanceType<typeof Turnstile>>();

async function send() {
  if (!issue.value) return;
  const n = Array.from(replyText.value).length;
  if (n < 1 || n > 2000) {
    toast(t('validate-reply'), 'error');
    return;
  }
  sending.value = true;
  const { data, error } =
    mode.value === 'public'
      ? await api.POST('/issue/public/{id}/record', {
          params: { path: { id }, query: { token: token.value! } },
          body: { text: replyText.value, captcha: captchaToken.value ?? undefined },
          toastError: true,
        })
      : await api.POST('/issue/{id}/record', {
          params: { path: { id } },
          body: {
            text: replyText.value,
            operation: replyOperation.value === 'none' ? undefined : replyOperation.value,
            internal: replyInternal.value,
          },
          toastError: true,
        });
  sending.value = false;
  if (error || !data) {
    captchaToken.value = null;
    captchaWidget.value?.reset();
    return;
  }
  const record = data as IssueRecord;
  issue.value.records.push(record);
  // Mirrors the server: a carrying record updates the status; a reporter
  // replying to a closed issue reopens it.
  if (record.operation) issue.value.status = record.operation;
  else if (!isStaff.value && issue.value.status !== 'open') issue.value.status = 'open';
  if (!recordIsReporter(issue.value.createdBy, record)) resolveStaff(record);
  replyText.value = '';
  replyOperation.value = 'none';
  replyInternal.value = false;
  toast(t('replied'), 'success');
}
</script>

<template>
  <div class="flex flex-col items-center px-4 lg:px-0 mb-24">
    <div class="w-full lg:w-2/3 flex flex-col gap-4">
      <LoadView v-if="!issue && !notFound" class="mx-auto loading-lg my-16" />

      <div v-else-if="notFound" class="card bg-base-100 border border-base-300 shadow-xl p-16 text-center">
        <i class="fa-solid fa-file-circle-question text-4xl opacity-40"></i>
        <p class="mt-4 opacity-70" v-t="'not-found'"></p>
      </div>

      <template v-else-if="issue">
        <div class="card bg-base-100 border border-base-300 shadow-xl p-6 flex flex-col gap-3">
          <div v-if="!editingTitle" class="flex items-center gap-2 flex-wrap min-w-0">
            <span class="font-black text-xl opacity-70 shrink-0">#{{ issue.id }}</span>
            <span class="text-xl font-bold break-words" :class="issue.title ? '' : 'italic opacity-50'">{{ issue.title || t('issue-untitled') }}</span>
            <button v-if="isStaff" type="button" class="btn btn-ghost btn-xs btn-circle shrink-0" :title="t('edit-title')" :aria-label="t('edit-title')" @click="startEditTitle">
              <i class="fa-solid fa-pen text-xs"></i>
            </button>
          </div>
          <form v-else class="flex items-center gap-2" @submit.prevent="saveTitle">
            <span class="font-black text-xl opacity-70 shrink-0">#{{ issue.id }}</span>
            <input ref="titleInput" v-model="titleDraft" maxlength="100" class="input input-bordered input-sm grow" :placeholder="t('issue-untitled')" @keyup.esc="editingTitle = false" />
            <button type="submit" class="btn btn-primary btn-sm" v-t="'save'"></button>
            <button type="button" class="btn btn-ghost btn-sm" @click="editingTitle = false" v-t="'cancel'"></button>
          </form>
          <div class="flex items-center gap-2 flex-wrap">
            <IssueCategoryBadge :category="issue.category" />
            <IssueStatusBadge :status="issue.status" />
          </div>
          <div class="flex flex-col gap-1 text-sm">
            <div class="flex gap-2">
              <span class="opacity-60 shrink-0" v-t="'created'"></span>
              <span>{{ detailedTime(issue.createdAt) }}</span>
            </div>
            <div class="flex gap-2 items-baseline min-w-0">
              <span class="opacity-60 shrink-0" v-t="'email'"></span>
              <span class="truncate">{{ issue.email }}</span>
            </div>
            <div class="flex gap-2 items-baseline min-w-0">
              <span class="opacity-60 shrink-0" v-t="'target'"></span>
              <IssueTargetLink :target="issue.target" />
            </div>
            <div v-if="issue.related.originalUrl" class="flex gap-2 items-baseline min-w-0">
              <span class="opacity-60 shrink-0" v-t="'original-url'"></span>
              <a :href="issue.related.originalUrl" target="_blank" rel="noopener" class="link link-hover truncate">{{ issue.related.originalUrl }}</a>
            </div>
          </div>
          <div v-if="issue.related.identityProofs?.length" class="flex flex-col gap-1 text-sm">
            <span class="opacity-60" v-t="'identity-proofs'"></span>
            <div class="flex flex-wrap gap-2">
              <a v-for="(f, i) in issue.related.identityProofs" :key="f" :href="fileUrl(f)" target="_blank" rel="noopener" class="badge badge-outline gap-1 hover:badge-neutral">
                <i class="fa-solid fa-file"></i>{{ t('attachment', { n: i + 1 }) }}
              </a>
            </div>
          </div>
          <div v-if="issue.related.evidences?.length" class="flex flex-col gap-1 text-sm">
            <span class="opacity-60" v-t="'evidences'"></span>
            <div class="flex flex-wrap gap-2">
              <a v-for="(f, i) in issue.related.evidences" :key="f" :href="fileUrl(f)" target="_blank" rel="noopener" class="badge badge-outline gap-1 hover:badge-neutral">
                <i class="fa-solid fa-file"></i>{{ t('attachment', { n: i + 1 }) }}
              </a>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div
            v-for="record in issue.records"
            :key="record.id"
            class="card bg-base-100 border shadow p-4 flex flex-col gap-2"
            :class="record.internal ? 'border-warning' : 'border-base-300'">
            <div class="flex items-center gap-2 flex-wrap text-sm">
              <span v-if="recordIsReporter(issue?.createdBy, record)" class="font-bold" v-t="'reporter'"></span>
              <span v-else-if="record.createdBy != null" class="font-bold">
                {{ t('staff') }} · <router-link :to="`/user/${record.createdBy}`" class="link link-hover">{{ staffNames.get(record.createdBy) ?? `#${record.createdBy}` }}</router-link>
              </span>
              <span v-else class="font-bold" v-t="'staff'"></span>
              <span v-if="record.internal" class="badge badge-warning badge-sm" v-t="'internal-note'"></span>
              <!-- `open` is the default state — the initial record always
                   carries it, and it means nothing next to a message. -->
              <span v-if="record.operation && record.operation !== 'open'" class="badge badge-sm badge-outline">
                <i class="fa-solid fa-arrows-rotate text-[0.6rem]"></i>{{ t(statusLabelKey(record.operation)) }}
              </span>
              <span class="opacity-50 text-xs ml-auto" :title="moment(record.createdAt).format('lll')">{{ moment(record.createdAt).fromNow() }}</span>
            </div>
            <p class="whitespace-pre-wrap break-words">{{ record.text }}</p>
          </div>
        </div>

        <form class="card bg-base-100 border border-base-300 shadow-xl p-4 lg:p-6 flex flex-col gap-3" @submit.prevent="send">
          <textarea class="textarea textarea-bordered w-full leading-relaxed" rows="3" :placeholder="t('reply-placeholder')" v-model="replyText"></textarea>
          <!-- Magic-link replies are anonymous and need a captcha; the
               authenticated channel (staff / logged-in creator) does not. -->
          <Turnstile v-if="mode === 'public'" ref="captchaWidget" :site-key="TURNSTILE_SITE_KEY" @token="(t) => (captchaToken = t)" />
          <div v-if="isStaff" class="flex flex-wrap items-center gap-4">
            <label class="flex items-center gap-2">
              <span class="text-sm opacity-60 shrink-0" v-t="'operation'"></span>
              <select class="select select-bordered select-sm" v-model="replyOperation">
                <option value="none" v-t="'operation-none'"></option>
                <option v-for="op in ISSUE_OPERATIONS" :key="op" :value="op">{{ t(statusLabelKey(op)) }}</option>
              </select>
            </label>
            <label class="label cursor-pointer gap-2">
              <span class="label-text" v-t="'internal'"></span>
              <input type="checkbox" class="toggle toggle-warning toggle-sm" v-model="replyInternal" />
            </label>
          </div>
          <button type="submit" class="btn btn-primary self-end" :class="{ 'btn-disabled': sending }">
            <span v-if="sending" class="loading loading-spinner loading-sm"></span>
            {{ sending ? t('sending') : t('send') }}
          </button>
        </form>
      </template>
    </div>
  </div>
</template>
