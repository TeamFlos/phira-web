<i18n>
en:
  title: Review
  checks-loading: Running checks…
  checks-clean: Automated checks found nothing.
  checklist: Checklist
  cl-copyright: Copyright matches reviewed, false positives ruled out
  cl-pirate: Duplicate-file matches checked; the uploader is not the original author
  cl-censor: Blocked-word hits reviewed
  cl-metadata: Metadata checked, flagged fields confirmed acceptable
  cl-sync: Audio and chart are in sync
  cl-content: Illustration content is appropriate
  cl-thorough: Reviewed the full chart (audio and notes), no spelled-out text or other inappropriate content
  cl-play: The chart file downloads and plays correctly
  cl-override: I have reviewed the issues above and approve anyway
  templates: Templates
  tpl-auto: Auto
  tpl-pirate: Duplicate file
  tpl-copyright-forbidden: Copyright (forbidden)
  tpl-copyright-restricted: Copyright (restricted)
  tpl-censored: Blocked words
  tpl-duplicate: Duplicate upload
  tpl-body-duplicate: 'This file is byte-identical to a chart you already uploaded (chart #{id}). Do not submit duplicates. Edit the existing chart instead.'
  tpl-metadata: Metadata issues
  tpl-body-pirate: 'This file is byte-identical to an existing chart ({detail}). Re-uploading another author''s work constitutes piracy and may result in account suspension. Please upload only your own original charts.'
  tpl-body-forbidden: This version uses a track that is forbidden by the content policy ({detail}). Please replace the track and upload again.
  tpl-body-restricted: This version matched a restricted content-policy entry ({detail}). Please make sure the conditions in the note are met, or adjust and upload again.
  tpl-body-censored: 'Inappropriate words were found in: {fields}. Please revise and resubmit.'
  reason-label: Rejection message
  reason-placeholder: Tell the uploader what needs fixing…
  reason-empty: Please give a reason
  approve: Approve
  deny: Deny
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
  checklist: 检查清单
  cl-copyright: 版权匹配结果已人工核对，误报已排除
  cl-pirate: 撞车记录已人工核对，上传者非原作者本人
  cl-censor: 屏蔽词命中情况已人工核对
  cl-metadata: 字段信息已核对，提醒项确认无碍
  cl-sync: 音画同步无异常
  cl-content: 插图内容适宜
  cl-thorough: 已完整浏览谱面（音频与谱面内容），无拼字等不当内容
  cl-play: 谱面文件可正常下载游玩
  cl-override: 已知悉上述问题，仍确认通过
  templates: 快速模板
  tpl-auto: 自动
  tpl-pirate: 撞车
  tpl-copyright-forbidden: 版权（禁止）
  tpl-copyright-restricted: 版权（受限）
  tpl-duplicate: 重复上传
  tpl-body-duplicate: 该文件与你已上传的谱面（编号 {id}）完全一致，请勿重复提交，修改现有谱面即可。
  tpl-metadata: 信息填写
  tpl-body-pirate: 该文件与已有谱面完全一致（{detail}）。盗传他人作品属违规行为，情节严重者将封停账号。请仅上传本人原创谱面。
  tpl-body-forbidden: 该版本使用了政策库中标记为禁止的曲目（{detail}），请更换曲目后重新上传。
  tpl-body-restricted: 该版本命中了受限政策条目（{detail}），请确认满足备注中的附加条件，或修改后重新上传。
  tpl-body-censored: 以下字段包含不适宜内容：{fields}。请修改后重新提交。
  reason-label: 拒绝理由
  reason-placeholder: 告诉上传者需要修改什么…
  reason-empty: 请填写拒绝理由
  approve: 通过
  deny: 拒绝
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

// --- action & message -----------------------------------------------------

type Action = 'approve' | 'deny';
const action = ref<Action>();
const reason = ref('');
const submitting = ref(false);

/** Warnings get their own rejection sentences; info findings stay display-only. */
const warningFindings = computed(() => props.findings.filter((f) => f.level === 'warning'));
const warningReasons = computed(() => warningFindings.value.map((f) => t(`metadata-finding-reason.${f.key}`)));

/** Compose the rejection message from whichever templates apply. */
const autoReason = computed(() => {
  const parts: string[] = [];
  if (stolenMatches.value.length) parts.push(t('tpl-body-pirate', { detail: pirateDetail() }));
  if (duplicateMatches.value.length) parts.push(t('tpl-body-duplicate', duplicateDetail()));
  if (problem.value) parts.push(t(`tpl-body-${problem.value}`, { detail: problemDetail(copyright.value, problem.value, copyrightQuery.value) }));
  if (censorHits.value.length) parts.push(censorTemplateBody());
  parts.push(...warningReasons.value);
  return parts.join('\n');
});

// Once the checks for a version land, pick the default action — deny with a
// prefilled message when anything was flagged (problems or metadata
// warnings), approve with a checklist when clean — without clobbering a
// choice the reviewer already made.
watch(loading, (isLoading) => {
  if (isLoading) return;
  action.value = hasProblems.value || warningFindings.value.length ? 'deny' : 'approve';
  reason.value = autoReason.value;
  manualChecks.value = {};
});
function applyTemplate(kind: 'pirate' | 'duplicate' | 'forbidden' | 'restricted' | 'censored' | 'metadata') {
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
  const manualOk = REVIEW_MANUAL_ITEMS.every((item) => manualChecks.value[item]);
  return hasProblems.value ? manualOk && !!manualChecks.value['cl-override'] : manualOk;
});

// --- submission -----------------------------------------------------------

const approveDialog = ref<IConfirmDialog>();
const denyDialog = ref<IConfirmDialog>();

function openConfirm() {
  (action.value === 'approve' ? approveDialog : denyDialog).value!.showModal();
}

async function submitVote() {
  if (submitting.value) return;
  if (action.value === 'deny' && !reason.value.trim().length) throw new Error(t('reason-empty'));
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
  <div class="card bg-base-100 border border-base-300 shadow-lg p-4 flex flex-col gap-3">
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

    <!-- automated checks -->
    <div v-if="!loading" class="flex flex-col gap-2">
      <PirateResults v-if="stolenMatches.length" kind="stolen" :matches="stolenMatches" />
      <PirateResults v-if="duplicateMatches.length" kind="duplicate" :matches="duplicateMatches" />
      <CopyrightResults v-if="copyright || copyrightSuppressed.length" :result="copyright" :query="copyrightQuery" :suppressed="copyrightSuppressed" />
      <p v-if="!hasProblems && !copyrightSuppressed.length && !duplicateMatches.length && !warningFindings.length" class="text-sm opacity-60">
        <i class="fa-solid fa-circle-check text-success"></i>
        {{ t('checks-clean') }}
      </p>
    </div>

    <!-- action area (pending versions only) -->
    <template v-if="version.status === 'pending'">
      <!-- clean: checklist; deny: message -->
      <div v-if="action === 'approve'" class="flex flex-col gap-1">
        <h3 class="text-xs font-bold tracking-wider opacity-50">{{ t('checklist') }}</h3>
        <label class="label cursor-pointer justify-start gap-2 py-1" v-for="item in REVIEW_MANUAL_ITEMS" :key="item">
          <input type="checkbox" class="checkbox checkbox-sm" v-model="manualChecks[item]" />
          <span class="label-text">{{ t(item) }}</span>
        </label>
        <label v-if="hasProblems" class="label cursor-pointer justify-start gap-2 py-1">
          <input type="checkbox" class="checkbox checkbox-sm checkbox-warning" v-model="manualChecks['cl-override']" />
          <span class="label-text font-semibold">{{ t('cl-override') }}</span>
        </label>
      </div>

      <div v-else-if="action === 'deny'" class="flex flex-col gap-2">
        <div class="flex flex-row items-center gap-2 flex-wrap">
          <h3 class="text-xs font-bold tracking-wider opacity-50">{{ t('templates') }}</h3>
          <button class="btn btn-ghost btn-xs" :disabled="!stolenMatches.length" @click="applyTemplate('pirate')">{{ t('tpl-pirate') }}</button>
          <button class="btn btn-ghost btn-xs" :disabled="!duplicateMatches.length" @click="applyTemplate('duplicate')">{{ t('tpl-duplicate') }}</button>
          <button class="btn btn-ghost btn-xs" @click="applyTemplate('forbidden')">{{ t('tpl-copyright-forbidden') }}</button>
          <button class="btn btn-ghost btn-xs" @click="applyTemplate('restricted')">{{ t('tpl-copyright-restricted') }}</button>
          <button class="btn btn-ghost btn-xs" @click="applyTemplate('censored')">{{ t('tpl-censored') }}</button>
          <button class="btn btn-ghost btn-xs" :disabled="!warningReasons.length" @click="applyTemplate('metadata')">{{ t('tpl-metadata') }}</button>
        </div>
        <textarea v-model="reason" class="textarea textarea-bordered w-full h-28 resize-y" :placeholder="t('reason-placeholder')"></textarea>
      </div>

      <!-- split button, GitHub-style -->
      <div class="flex justify-end">
        <div class="join" v-if="action">
          <button class="btn join-item" :class="action === 'approve' ? 'btn-success' : 'btn-error'" :disabled="!canSubmit" @click="openConfirm">
            <LoadOr :loading="submitting">{{ t(action) }}</LoadOr>
          </button>
          <div class="dropdown dropdown-top dropdown-end join-item">
            <label tabindex="0" class="btn rounded-l-none" :class="action === 'approve' ? 'btn-success' : 'btn-error'">
              <i class="fa-solid fa-caret-up"></i>
            </label>
            <ul tabindex="0" class="dropdown-content menu bg-base-100 border border-base-300 rounded-box shadow-lg w-40 p-2 mb-1">
              <li>
                <a :class="{ 'menu-active': action === 'approve' }" @click="action = 'approve'">{{ t('approve') }}</a>
              </li>
              <li>
                <a :class="{ 'menu-active': action === 'deny' }" @click="action = 'deny'">{{ t('deny') }}</a>
              </li>
            </ul>
          </div>
        </div>
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
