<i18n>
en:
  title: Review
  checks-loading: Running checks…
  checks-clean: Automated checks found nothing.
  findings: Findings
  g-stolen: Stolen file
  g-duplicate: Duplicate upload
  g-copyright: Copyright lookup
  g-censored: Blocked words
  ignore: Ignore
  unignore: Unignore
  decision: Decision
  approve: Approve
  deny: Deny
  manual: Manual verification
  cl-sync: Audio and chart are in sync
  cl-content: Illustration content is appropriate
  cl-thorough: Reviewed the full chart (audio and notes), no spelled-out text or other inappropriate content
  cl-play: The chart file downloads and plays correctly
  auto-reply: Auto-reply from remaining findings
  quick-templates: Quick templates
  reason-label: Rejection message
  tpl-pirate: Duplicate file
  tpl-copyright-forbidden: Copyright (forbidden)
  tpl-copyright-restricted: Copyright (restricted)
  tpl-censored: Blocked words
  tpl-duplicate: Duplicate upload
  tpl-metadata: Metadata issues
  tpl-body-duplicate: 'This file is byte-identical to a chart you already uploaded (chart #{id}). Do not submit duplicates. Edit the existing chart instead.'
  tpl-body-pirate: 'This file is byte-identical to an existing chart ({detail}). Re-uploading another author''s work constitutes piracy and may result in account suspension. Please upload only your own original charts.'
  tpl-body-forbidden: This version uses a track that is forbidden by the content policy ({detail}). Please replace the track and upload again.
  tpl-body-restricted: This version matched a restricted content-policy entry ({detail}). Please make sure the conditions in the note are met, or adjust and upload again.
  tpl-body-censored: 'Inappropriate words were found in: {fields}. Please revise and resubmit.'
  reason-placeholder: Tell the uploader what needs fixing…
  confirm-approve-title: Approve this version?
  confirm-approve-text: The vote is final and cannot be changed.
  confirm-deny-title: Deny with this message?
  approved: Vote recorded
  approved-passed: Approved, the chart is now public
  denied: The chart has been denied

zh-CN:
  title: 审核
  checks-loading: 正在检查…
  checks-clean: 自动检查未发现问题。
  findings: 检查发现
  g-stolen: 盗传
  g-duplicate: 重复上传
  g-copyright: 版权检索
  g-censored: 屏蔽词
  ignore: 忽略
  unignore: 取消忽略
  decision: 决定
  approve: 通过
  deny: 拒绝
  manual: 人工核查
  cl-sync: 音画同步无异常
  cl-content: 插图内容适宜
  cl-thorough: 已完整浏览谱面（音频与谱面内容），无拼字等不当内容
  cl-play: 谱面文件可正常下载游玩
  auto-reply: 自动回复（未忽略的问题）
  quick-templates: 快速模板
  reason-label: 拒绝理由
  tpl-pirate: 撞车
  tpl-copyright-forbidden: 版权（禁止）
  tpl-copyright-restricted: 版权（受限）
  tpl-censored: 屏蔽词
  tpl-duplicate: 重复上传
  tpl-metadata: 信息填写
  tpl-body-duplicate: 该文件与你已上传的谱面（编号 {id}）完全一致，请勿重复提交，修改现有谱面即可。
  tpl-body-pirate: 该文件与已有谱面完全一致（{detail}）。盗传他人作品属违规行为，情节严重者将封停账号。请仅上传本人原创谱面。
  tpl-body-forbidden: 该版本使用了政策库中标记为禁止的曲目（{detail}），请更换曲目后重新上传。
  tpl-body-restricted: 该版本命中了受限政策条目（{detail}），请确认满足备注中的附加条件，或修改后重新上传。
  tpl-body-censored: 以下字段包含不适宜内容：{fields}。请修改后重新提交。
  reason-placeholder: 告诉上传者需要修改什么…
  confirm-approve-title: 确认通过该版本？
  confirm-approve-text: 投票后无法更改。
  confirm-deny-title: 确认以此理由拒绝？
  approved: 已记录你的投票
  approved-passed: 审核通过，谱面已公开
  denied: 谱面已被拒绝
</i18n>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { toast, toastError, type IConfirmDialog } from '../../common';
import { useApi } from '../../api/client';
import { reviewChart } from '../../api/review';
import type { ChartVersion } from '../../model';
import { REVIEW_MANUAL_ITEMS, censoredFields, problemDetail, useReviewChecks } from '../../review';
import type { MetadataFinding } from '../../review/metadata';

import ConfirmDialog from '../ConfirmDialog.vue';
import LoadOr from '../LoadOr.vue';
import CensorResults from './CensorResults.vue';
import CopyrightResults from './CopyrightResults.vue';
import PirateResults from './PirateResults.vue';

const { t, locale } = useI18n();

/** The censor template names the offending fields but never quotes the words. */
function censorTemplateBody(): string {
  const fields = censoredFields(censorHits.value).map((f) => t(`chart-field.${f}`));
  return t('tpl-body-censored', { fields: fields.join(locale.value === 'en' ? ', ' : '、') });
}
const api = useApi();

const props = defineProps<{ chart: number; uploaderId: number | undefined; version: ChartVersion; findings: MetadataFinding[] }>();
const emit = defineEmits<{ (e: 'reviewed'): void }>();

const { loading, copyright, copyrightQuery, copyrightSuppressed, censorHits, stolenMatches, duplicateMatches, problem, hasProblems } = useReviewChecks(
  () => props.version,
  () => props.uploaderId,
);

/** First stolen match as `name by uploader (chart #id)`, for templates. */
function pirateDetail(): string {
  const m = stolenMatches.value[0];
  return m ? `${m.name} by ${m.uploaderName} (chart #${m.chartId})` : '';
}

/** First same-uploader duplicate's chart id, for the rejection template. */
function duplicateDetail(): Record<string, unknown> {
  const m = duplicateMatches.value[0];
  return m ? { id: m.chartId } : {};
}

// --- findings triage ---------------------------------------------------------

/** Warnings get a collapsible and an ignore toggle; info findings stay inline
 * hints on the detail panel only. */
const warningFindings = computed(() => props.findings.filter((f) => f.level === 'warning'));
const warningReasons = computed(() => warningFindings.value.map((f) => t(`metadata-finding-reason.${f.key}`)));

/** One collapsible row per finding. Every listed row is a problem the reviewer
 * must triage: a copyright lookup that matched nothing problematic gets no row
 * at all. Metadata warnings get one row each — they are independent issues,
 * and several can share the same wording (e.g. the three "UK" fields). */
type FindingGroup = {
  key: string;
  label: string;
  count: number;
  /** Metadata rows carry their reason sentence instead of a results component. */
  finding?: MetadataFinding;
};

const shownGroups = computed<FindingGroup[]>(() => {
  const groups: FindingGroup[] = [];
  if (stolenMatches.value.length) groups.push({ key: 'stolen', label: t('g-stolen'), count: stolenMatches.value.length });
  if (duplicateMatches.value.length) groups.push({ key: 'duplicate', label: t('g-duplicate'), count: duplicateMatches.value.length });
  if (problem.value) groups.push({ key: 'copyright', label: t('g-copyright'), count: 0 });
  if (censorHits.value.length) groups.push({ key: 'censored', label: t('g-censored'), count: censorHits.value.length });
  for (const f of warningFindings.value) {
    groups.push({ key: `metadata:${f.key}`, label: `${t(`chart-field.${f.field}`)} — ${t(`metadata-finding.${f.key}`)}`, count: 0, finding: f });
  }
  return groups;
});

/** Undismissed rows — the ones that block approval and feed the auto-reply. */
const remaining = computed(() => shownGroups.value.filter((g) => !ignored.value[g.key]));

const openGroups = ref<Record<string, boolean>>({});
const ignored = ref<Record<string, boolean>>({});

function toggleIgnore(key: string) {
  ignored.value[key] = !ignored.value[key];
}

// --- decision & reply --------------------------------------------------------

type Action = 'approve' | 'deny';
const action = ref<Action>();
const autoReply = ref(true);
const reason = ref('');
const submitting = ref(false);

/** The message composed from whatever problem rows are still un-ignored. */
const composedReply = computed(() => {
  const parts: string[] = [];
  const on = (key: string) => !ignored.value[key];
  if (on('stolen') && stolenMatches.value.length) parts.push(t('tpl-body-pirate', { detail: pirateDetail() }));
  if (on('duplicate') && duplicateMatches.value.length) parts.push(t('tpl-body-duplicate', duplicateDetail()));
  if (on('copyright') && problem.value) parts.push(t(`tpl-body-${problem.value}`, { detail: problemDetail(copyright.value, problem.value, copyrightQuery.value) }));
  if (on('censored') && censorHits.value.length) parts.push(censorTemplateBody());
  parts.push(...warningFindings.value.filter((f) => !ignored.value[`metadata:${f.key}`]).map((f) => t(`metadata-finding-reason.${f.key}`)));
  return parts.join('\n');
});

// While auto-reply is on, the message mirrors the remaining findings — toggling
// an ignore rewrites it immediately. The first manual edit (or a template)
// turns auto-reply off and freezes the text as written.
watch(composedReply, (text) => {
  if (autoReply.value) reason.value = text;
});
watch(autoReply, (on) => {
  if (on) reason.value = composedReply.value;
});
function onReasonInput(e: Event) {
  autoReply.value = false;
  reason.value = (e.target as HTMLTextAreaElement).value;
}

function applyTemplate(kind: 'pirate' | 'duplicate' | 'forbidden' | 'restricted' | 'censored' | 'metadata') {
  autoReply.value = false;
  if (kind === 'metadata') {
    reason.value = warningReasons.value.join('\n');
  } else if (kind === 'censored') {
    reason.value = censorTemplateBody();
  } else if (kind === 'pirate') {
    reason.value = t('tpl-body-pirate', { detail: pirateDetail() });
  } else if (kind === 'duplicate') {
    reason.value = t('tpl-body-duplicate', duplicateDetail());
  } else {
    reason.value = t(`tpl-body-${kind}`, { detail: problemDetail(copyright.value, problem.value ?? 'forbidden', copyrightQuery.value) });
  }
}

const manualChecks = ref<Record<string, boolean>>({});

const canSubmit = computed(() => {
  if (loading.value || !action.value) return false;
  if (action.value === 'deny') return reason.value.trim().length > 0;
  return REVIEW_MANUAL_ITEMS.every((item) => manualChecks.value[item]) && remaining.value.length === 0;
});

// Once the checks for a version land, reset the triage and pick the default
// decision — deny when anything was flagged — without clobbering an in-flight
// vote on a previous version.
watch(loading, (isLoading) => {
  if (isLoading) return;
  ignored.value = {};
  openGroups.value = {};
  autoReply.value = true;
  manualChecks.value = {};
  action.value = hasProblems.value ? 'deny' : 'approve';
  reason.value = composedReply.value;
});

// --- submission -----------------------------------------------------------

const approveDialog = ref<IConfirmDialog>();
const denyDialog = ref<IConfirmDialog>();

function openConfirm() {
  (action.value === 'approve' ? approveDialog : denyDialog).value!.showModal();
}

async function submitVote() {
  if (submitting.value) return;
  submitting.value = true;
  try {
    const { passed } = await reviewChart(api, props.chart, action.value === 'approve' ? { approve: true } : { approve: false, reason: reason.value.trim() });
    toast(t(action.value === 'approve' ? (passed ? 'approved-passed' : 'approved') : 'denied'), 'success');
    emit('reviewed');
  } catch (e) {
    toastError(e);
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="card bg-base-100 border border-base-300 shadow-lg p-4 flex flex-col gap-4">
    <h2 class="font-bold text-lg flex flex-row items-center gap-2 flex-wrap">
      <span>
        <i class="fa-solid fa-gavel opacity-60"></i>
        {{ t('title') }}
      </span>
      <span v-if="loading" class="text-sm font-normal opacity-60">
        <span class="loading loading-spinner loading-xs"></span>
        {{ t('checks-loading') }}
      </span>
    </h2>

    <template v-if="!loading">
      <!-- findings: one collapsible per finding, ignore toggle on the right -->
      <div v-if="shownGroups.length" class="flex flex-col gap-2">
        <h3 class="text-xs font-bold tracking-wider opacity-50" v-t="'findings'"></h3>
        <div v-for="g in shownGroups" :key="g.key" class="rounded-lg border" :class="ignored[g.key] ? 'border-base-200 opacity-50' : 'border-base-300'">
          <!-- the whole row toggles the collapse; only the ignore button is its own target -->
          <div class="flex items-center gap-3 px-3 py-2.5">
            <button class="flex items-center gap-3 grow min-w-0 text-left cursor-pointer" @click="openGroups[g.key] = !openGroups[g.key]">
              <i class="fa-solid text-xs opacity-60 w-3 text-center shrink-0" :class="openGroups[g.key] ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
              <span class="font-medium min-w-0" :class="{ 'line-through': ignored[g.key] }">{{ g.label }}</span>
              <span v-if="g.count" class="badge badge-ghost font-mono shrink-0">{{ g.count }}</span>
            </button>
            <button class="btn btn-sm shrink-0" :class="ignored[g.key] ? 'btn-ghost' : 'btn-outline'" @click="toggleIgnore(g.key)">
              {{ t(ignored[g.key] ? 'unignore' : 'ignore') }}
            </button>
          </div>
          <div v-if="openGroups[g.key]" class="px-4 pb-3 flex flex-col gap-2">
            <PirateResults v-if="g.key === 'stolen'" kind="stolen" :matches="stolenMatches" />
            <PirateResults v-else-if="g.key === 'duplicate'" kind="duplicate" :matches="duplicateMatches" />
            <CopyrightResults v-else-if="g.key === 'copyright'" :result="copyright" :query="copyrightQuery" :suppressed="copyrightSuppressed" />
            <CensorResults v-else-if="g.key === 'censored'" :hits="censorHits" />
            <p v-else-if="g.finding" class="text-sm opacity-70">{{ t(`metadata-finding-reason.${g.finding.key}`) }}</p>
          </div>
        </div>
      </div>
      <p v-else class="text-sm opacity-60">
        <i class="fa-solid fa-circle-check text-success"></i>
        {{ t('checks-clean') }}
      </p>

      <!-- decision -->
      <div class="flex flex-col gap-2">
        <h3 class="text-xs font-bold tracking-wider opacity-50" v-t="'decision'"></h3>
        <div class="join self-start">
          <button class="btn btn-sm join-item" :class="action === 'approve' ? 'btn-success' : 'btn-ghost'" @click="action = 'approve'">{{ t('approve') }}</button>
          <button class="btn btn-sm join-item" :class="action === 'deny' ? 'btn-error' : 'btn-ghost'" @click="action = 'deny'">{{ t('deny') }}</button>
        </div>
      </div>

      <!-- approve: what automation cannot check -->
      <div v-if="action === 'approve'" class="flex flex-col gap-1">
        <h3 class="text-xs font-bold tracking-wider opacity-50" v-t="'manual'"></h3>
        <label class="label cursor-pointer justify-start gap-2 py-1" v-for="item in REVIEW_MANUAL_ITEMS" :key="item">
          <input type="checkbox" class="checkbox checkbox-sm" v-model="manualChecks[item]" />
          <span class="label-text">{{ t(item) }}</span>
        </label>
      </div>

      <!-- deny: the message, auto-composed from remaining findings unless overridden -->
      <div v-else-if="action === 'deny'" class="flex flex-col gap-2">
        <div class="flex items-center gap-3 flex-wrap">
          <h3 class="text-xs font-bold tracking-wider opacity-50" v-t="'reason-label'"></h3>
          <span class="grow"></span>
          <label class="label cursor-pointer gap-2 py-0">
            <input type="checkbox" class="checkbox checkbox-sm" v-model="autoReply" />
            <span class="label-text" v-t="'auto-reply'"></span>
          </label>
          <div class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-sm btn-outline" v-t="'quick-templates'"></label>
            <ul tabindex="0" class="dropdown-content menu bg-base-100 border border-base-300 rounded-box shadow-lg w-44 p-2">
              <li :class="{ disabled: !stolenMatches.length }">
                <a @click="stolenMatches.length && applyTemplate('pirate')">{{ t('tpl-pirate') }}</a>
              </li>
              <li :class="{ disabled: !duplicateMatches.length }">
                <a @click="duplicateMatches.length && applyTemplate('duplicate')">{{ t('tpl-duplicate') }}</a>
              </li>
              <li>
                <a @click="applyTemplate('forbidden')">{{ t('tpl-copyright-forbidden') }}</a>
              </li>
              <li>
                <a @click="applyTemplate('restricted')">{{ t('tpl-copyright-restricted') }}</a>
              </li>
              <li :class="{ disabled: !censorHits.length }">
                <a @click="censorHits.length && applyTemplate('censored')">{{ t('tpl-censored') }}</a>
              </li>
              <li :class="{ disabled: !warningReasons.length }">
                <a @click="warningReasons.length && applyTemplate('metadata')">{{ t('tpl-metadata') }}</a>
              </li>
            </ul>
          </div>
        </div>
        <textarea class="textarea textarea-bordered w-full h-28 resize-y" :value="reason" @input="onReasonInput" :placeholder="t('reason-placeholder')"></textarea>
      </div>

      <!-- submit -->
      <div class="flex justify-end">
        <button class="btn" :class="action === 'deny' ? 'btn-error' : 'btn-success'" :disabled="!canSubmit || submitting" @click="openConfirm">
          <LoadOr :loading="submitting">{{ action ? t(action) : '' }}</LoadOr>
        </button>
      </div>
    </template>
  </div>

  <ConfirmDialog ref="approveDialog" :do="submitVote" :confirmText="t('approve')">
    <h3 class="font-bold text-lg">{{ t('confirm-approve-title') }}</h3>
    <p class="py-2 opacity-80">{{ t('confirm-approve-text') }}</p>
  </ConfirmDialog>

  <ConfirmDialog ref="denyDialog" :do="submitVote" :confirmText="t('deny')">
    <h3 class="font-bold text-lg">{{ t('confirm-deny-title') }}</h3>
    <p class="py-2 whitespace-pre-wrap break-words border border-base-300 rounded-lg p-2 mt-2">{{ reason }}</p>
  </ConfirmDialog>
</template>
