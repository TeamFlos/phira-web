<i18n>
en:
  title: Review
  hint: This version is awaiting review. Your vote is final and cannot be changed.
  approve: Approve
  deny: Deny
  reason: Reason for denial
  reason-placeholder: Tell the uploader what needs fixing…
  reason-empty: Please give a reason
  approved: Vote recorded
  approved-passed: Approved — the chart is now public
  denied: The chart has been denied

zh-CN:
  title: 审核
  hint: 该版本正在等待审核。投票后无法更改。
  approve: 通过
  deny: 拒绝
  reason: 拒绝理由
  reason-placeholder: 告诉上传者需要修改什么…
  reason-empty: 请填写拒绝理由
  approved: 已记录你的投票
  approved-passed: 审核通过，谱面已公开
  denied: 谱面已被拒绝
</i18n>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { toast, toastError, type IConfirmDialog } from '../common';
import { useApi } from '../api/client';
import { reviewChart } from '../api/review';

import ConfirmDialog from './ConfirmDialog.vue';
import LoadOr from './LoadOr.vue';

const { t } = useI18n();
const api = useApi();

const props = defineProps<{ chart: number }>();
const emit = defineEmits<{ (e: 'reviewed'): void }>();

const approving = ref(false);
const reason = ref('');
const denyDialog = ref<IConfirmDialog>();

async function approve() {
  if (approving.value) return;
  approving.value = true;
  try {
    const { passed } = await reviewChart(api, props.chart, { approve: true });
    toast(t(passed ? 'approved-passed' : 'approved'), 'success');
    emit('reviewed');
  } catch (e) {
    toastError(e);
  } finally {
    approving.value = false;
  }
}

async function deny() {
  const text = reason.value.trim();
  if (!text.length) throw new Error(t('reason-empty'));
  await reviewChart(api, props.chart, { approve: false, reason: text });
  toast(t('denied'), 'success');
  reason.value = '';
  emit('reviewed');
}
</script>

<template>
  <div class="card bg-base-100 border border-base-300 shadow-lg p-4 flex flex-col gap-3">
    <h2 class="font-bold text-lg">
      <i class="fa-solid fa-gavel opacity-60"></i>
      {{ t('title') }}
    </h2>
    <p class="text-sm opacity-70" v-t="'hint'"></p>
    <div class="flex gap-2 justify-end">
      <button class="btn btn-error btn-outline" @click="denyDialog!.showModal()" v-t="'deny'"></button>
      <button class="btn btn-success" @click="approve">
        <LoadOr :loading="approving">{{ t('approve') }}</LoadOr>
      </button>
    </div>
  </div>

  <ConfirmDialog ref="denyDialog" :do="deny" :confirmText="t('deny')">
    <h3 class="font-bold text-lg" v-t="'reason'"></h3>
    <textarea v-model="reason" class="textarea textarea-bordered w-full h-32 mt-4 resize-y" :placeholder="t('reason-placeholder')"></textarea>
  </ConfirmDialog>
</template>
