<i18n lang="yml" src="@/locales/form.yml"></i18n>
<i18n>
en:
  intent:
    question: Feedback
    feature: Feature Request
    report: Report Content
  intent-desc:
    question: Problems or questions while using Phira
    feature: Features you'd like to see added or improved
    report: Report a rule-breaking chart, collection or user
  category: Category
  target: Target
  target-optional: optional
  target-type:
    chart: Chart
    collection: Collection
    user: User
  target-id: Target ID, found at the end of the corresponding page URL
  email: Contact email
  detail: Details
  detail-placeholder: Describe the situation (10–2000 chars)…
  original-url: Original URL
  real-name: Real name
  real-name-hint: Real name of the rights holder or their delegate
  contact: Contact
  contact-hint: Phone number or another valid contact channel
  delegated: Reporting on behalf of the rights holder
  attachments: Attachments
  attachments-hint: Evidence etc.; delegated reports should include the letter of authorization
  upload: Choose files
  submit: Submit
  submitting: Submitting…
  validate-id: Please enter the target ID
  validate-category: Please choose a category
  validate-text: Description must be 10–2000 characters
  validate-identity: Rights-infringement reports require your real name, a valid contact and evidence
  contact-pre: You can also write to
  contact-post: to reach us
  success-title: Submitted
  success-body: 'We have received your submission. A receipt with a link to follow the progress has been sent to {email}.'

zh-CN:
  intent:
    question: 问题反馈
    feature: 功能请求
    report: 内容举报
  intent-desc:
    question: 使用 Phira 遇到的问题或疑问
    feature: 希望新增或改进的功能
    report: 举报违规的谱面、合集或用户
  category: 举报分类
  target: 举报对象
  target-optional: 选填
  target-type:
    chart: 谱面
    collection: 合集
    user: 用户
  target-id: 对象 ID，可在对应网页链接末尾找到
  email: 联系邮箱
  detail: 详情描述
  detail-placeholder: 请描述具体情况（10–2000 字）…
  original-url: 原作链接
  real-name: 真实姓名
  real-name-hint: 权利人或其受托人的真实姓名
  contact: 联系方式
  contact-hint: 电话或其他有效联系方式
  delegated: 受委托举报（代表权利人）
  attachments: 附件
  attachments-hint: 侵权证据等材料；受委托举报请一并附上委托授权书
  upload: 选择文件
  submit: 提交
  submitting: 提交中…
  validate-id: 请填写对象 ID
  validate-category: 请选择分类
  validate-text: 描述需在 10–2000 字之间
  validate-identity: 侵权举报需填写真实姓名与联系方式，并上传侵权证据
  contact-pre: 你也可以发送邮件至
  contact-post: 来联系我们
  success-title: 提交成功
  success-body: 我们已收到你的反馈，回执邮件已发送到 {email}，可以在邮件中的链接内查看后续进度
</i18n>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { loggedIn, toast, toastError, validateEmail } from '../common';
import { useApi } from '../api/client';
import { uploadTempFile } from '../api/issue';
import { ISSUE_CATEGORIES, TURNSTILE_SITE_KEY } from '../issue';
import type { IssueCategory, IssueDetail } from '../model';
import Turnstile from '../components/Turnstile.vue';

const { t } = useI18n();
const api = useApi();
const route = useRoute();

// Logged-in reporters are exempt from the captcha server-side.
const authed = loggedIn();

// Deep-link prefill: ?type=chart|collection|user&id=… from report buttons,
// ?category=… from the DMCA page (violation categories land on the report
// card). Unknown values are ignored.
const PREFILL_TYPES = { chart: 'Chart', collection: 'Collection', user: 'User' } as const;
type TargetType = (typeof PREFILL_TYPES)[keyof typeof PREFILL_TYPES];

/** The three top-level intents; the last two fix the category themselves. */
type Intent = 'question' | 'feature' | 'report';
const INTENTS: { key: Intent; icon: string; category?: 'question' | 'featureRequest' }[] = [
  { key: 'question', icon: 'fa-solid fa-circle-question', category: 'question' },
  { key: 'feature', icon: 'fa-solid fa-lightbulb', category: 'featureRequest' },
  { key: 'report', icon: 'fa-solid fa-flag' },
];

const prefillType = String(route.query.type ?? '').toLowerCase();
const prefillId = parseInt(String(route.query.id ?? ''));
const prefillCategory = String(route.query.category ?? '');
const isReportCategory = (ISSUE_CATEGORIES as string[]).includes(prefillCategory);

// Plain /issue/submit lands on the question card; deep-link prefills win.
const intent = ref<Intent>(
  prefillCategory === 'question' ? 'question' : prefillCategory === 'featureRequest' ? 'feature' : isReportCategory || prefillType in PREFILL_TYPES ? 'report' : 'question',
);
/** Violation sub-category, only picked on the report card. */
const category = ref<IssueCategory | undefined>(intent.value === 'report' && isReportCategory ? (prefillCategory as IssueCategory) : undefined);

/** What actually gets sent — mirrors `IssueCategory::needs_target` on the server. */
const effectiveCategory = computed<IssueCategory | undefined>(() => {
  const fixed = INTENTS.find((i) => i.key === intent.value)?.category;
  return fixed ?? category.value;
});

const targetType = ref<TargetType>(prefillType in PREFILL_TYPES ? PREFILL_TYPES[prefillType as keyof typeof PREFILL_TYPES] : 'Chart');
const targetId = ref(Number.isInteger(prefillId) && prefillId > 0 ? String(prefillId) : '');
const email = ref('');
const text = ref('');
const originalUrl = ref('');

// Prefill the contact email for logged-in reporters (only if untouched).
if (loggedIn()) {
  api.GET('/me').then(({ data }) => {
    if (data?.email && !email.value) email.value = data.email;
  });
}

// Infringement-specific reporter identity (text fields replaced the old
// file-based identity proofs).
const realName = ref('');
const contact = ref('');
/** Reporting on behalf of the rights holder; the letter of authorization, if
 * any, is uploaded among the regular attachments. */
const delegated = ref(false);

/** A file picked in the form, while its temp upload is in flight / done. */
type Upload = { name: string; tempId?: string; failed?: boolean };
const attachments = ref<Upload[]>([]);

/** The target picker stays visible across the whole report card. The
 * server's `IssueCategory::needs_target` makes it optional only for `other`
 * — filled-in targets are accepted (and existence-checked) regardless. */
const showTarget = computed(() => intent.value === 'report');
const targetRequired = computed(() => showTarget.value && category.value !== 'other');
const needsOriginalUrl = computed(() => intent.value === 'report' && (category.value === 'rightsInfringement' || category.value === 'plagiarism'));
const needsProofs = computed(() => intent.value === 'report' && category.value === 'rightsInfringement');
const busy = computed(() => submitting.value || attachments.value.some((u) => !u.tempId && !u.failed));

async function pickFiles(list: Upload[], files: FileList | null) {
  if (!files) return;
  for (const file of Array.from(files)) {
    const entry: Upload = { name: file.name };
    list.push(entry);
    try {
      const { id } = await uploadTempFile(api, file);
      entry.tempId = id;
    } catch (e) {
      entry.failed = true;
      toastError(e);
    }
  }
}

/** Client-side mirror of the server's checks — it re-validates anyway. */
function validate(): string | null {
  if (!effectiveCategory.value) {
    return t('validate-category');
  }
  try {
    validateEmail(t, email.value);
  } catch (e: any) {
    return e.message;
  }
  const n = Array.from(text.value).length;
  if (n < 10 || n > 2000) return t('validate-text');
  if (targetId.value) {
    const id = parseInt(targetId.value);
    if (!Number.isInteger(id) || id <= 0) return t('validate-id');
  } else if (targetRequired.value) {
    return t('validate-id');
  }
  if (needsProofs.value) {
    if (!realName.value.trim() || !contact.value.trim() || !attachments.value.some((u) => u.tempId)) {
      return t('validate-identity');
    }
  }
  return null;
}

const submitting = ref(false);
const result = ref<IssueDetail>();

// Single-use Turnstile token for anonymous submission.
const captchaToken = ref<string | null>(null);
const captchaWidget = ref<InstanceType<typeof Turnstile>>();

async function submit() {
  const problem = validate();
  if (problem) {
    toast(problem, 'error');
    return;
  }
  submitting.value = true;
  const id = parseInt(targetId.value);
  const attachmentIds = attachments.value.filter((u) => u.tempId).map((u) => u.tempId!);
  const { data, error } = await api.POST('/issue', {
    body: {
      text: text.value,
      category: effectiveCategory.value!,
      email: email.value,
      target: showTarget.value && targetId.value ? { type: targetType.value, id } : undefined,
      related: {
        realName: needsProofs.value ? realName.value.trim() : undefined,
        contact: needsProofs.value ? contact.value.trim() : undefined,
        delegated: needsProofs.value && delegated.value ? true : undefined,
        attachments: attachmentIds,
        originalUrl: originalUrl.value.trim() || undefined,
      },
      files: attachmentIds,
      captcha: captchaToken.value ?? undefined,
    },
    toastError: true,
  });
  submitting.value = false;
  if (error || !data) {
    // The token was consumed (or never obtained); refresh for the retry.
    captchaToken.value = null;
    captchaWidget.value?.reset();
    return;
  }
  result.value = data;
}
</script>

<template>
  <div class="flex flex-col items-center px-4 lg:px-0 mb-24">
    <div class="w-full lg:w-2/3 flex flex-col gap-4">
      <div v-if="!result" class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label
          v-for="opt in INTENTS"
          :key="opt.key"
          class="card border cursor-pointer transition-colors"
          :class="intent === opt.key ? 'border-primary bg-primary/5 shadow-lg' : 'border-base-300 bg-base-100'">
          <div class="card-body p-4 flex-row items-center gap-3">
            <input type="radio" name="issue-intent" class="radio radio-primary radio-sm shrink-0" :value="opt.key" v-model="intent" />
            <i :class="opt.icon" class="text-xl opacity-70 shrink-0"></i>
            <div class="flex flex-col min-w-0">
              <span class="font-bold leading-tight">{{ t(`intent.${opt.key}`) }}</span>
              <span class="text-xs opacity-60 leading-snug">{{ t(`intent-desc.${opt.key}`) }}</span>
            </div>
          </div>
        </label>
      </div>

      <div v-if="result" class="card bg-base-100 border border-base-300 shadow-xl p-8 flex flex-col items-center gap-4 text-center">
        <i class="fa-solid fa-circle-check text-5xl text-success"></i>
        <h2 class="text-xl font-bold" v-t="'success-title'"></h2>
        <p>{{ t('success-body', { email: result.email }) }}</p>
      </div>

      <form v-else class="card bg-base-100 border border-base-300 shadow-xl p-6 lg:p-8 flex flex-col gap-5" @submit.prevent="submit">
        <div v-if="intent === 'report'" class="form-control">
          <label class="label"><span class="label-text" v-t="'category'"></span></label>
          <select class="select select-bordered w-full" v-model="category">
            <option disabled :value="undefined" v-t="'validate-category'"></option>
            <option v-for="c in ISSUE_CATEGORIES" :key="c" :value="c">{{ t(`issue-category.${c}`) }}</option>
          </select>
        </div>

        <div v-if="showTarget" class="form-control">
          <label class="label">
            <span class="label-text">
              {{ t('target') }}
              <span v-if="targetRequired" class="text-error">*</span>
              <span v-else class="text-xs opacity-60">({{ t('target-optional') }})</span>
            </span>
          </label>
          <div class="flex gap-2">
            <select class="select select-bordered w-36" v-model="targetType">
              <option value="Chart" v-t="'target-type.chart'"></option>
              <option value="Collection" v-t="'target-type.collection'"></option>
              <option value="User" v-t="'target-type.user'"></option>
            </select>
            <input type="number" min="1" class="input input-bordered grow" :placeholder="t('target-id')" v-model="targetId" />
          </div>
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text" v-t="'email'"></span></label>
          <input type="email" class="input input-bordered w-full" v-model="email" />
        </div>

        <div v-if="needsOriginalUrl" class="form-control">
          <label class="label"><span class="label-text" v-t="'original-url'"></span></label>
          <input type="url" class="input input-bordered w-full" v-model="originalUrl" />
        </div>

        <div v-if="needsProofs" class="form-control">
          <label class="label">
            <span class="label-text">{{ t('real-name') }} <span class="text-error">*</span></span>
            <span class="label-text-alt opacity-60" v-t="'real-name-hint'"></span>
          </label>
          <input type="text" class="input input-bordered w-full" maxlength="100" v-model="realName" />
        </div>

        <div v-if="needsProofs" class="form-control">
          <label class="label">
            <span class="label-text">{{ t('contact') }} <span class="text-error">*</span></span>
            <span class="label-text-alt opacity-60" v-t="'contact-hint'"></span>
          </label>
          <input type="text" class="input input-bordered w-full" maxlength="200" v-model="contact" />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text" v-t="'detail'"></span>
            <span class="label-text-alt opacity-60">{{ Array.from(text).length }} / 2000</span>
          </label>
          <textarea class="textarea textarea-bordered w-full leading-relaxed" rows="6" :placeholder="t('detail-placeholder')" v-model="text"></textarea>
        </div>

        <div v-if="needsProofs" class="form-control">
          <label class="label justify-start gap-3 cursor-pointer py-1">
            <input type="checkbox" class="checkbox checkbox-sm checkbox-primary" v-model="delegated" />
            <span class="label-text" v-t="'delegated'"></span>
          </label>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">{{ t('attachments') }} <span v-if="needsProofs" class="text-error">*</span></span>
            <span v-if="needsProofs" class="label-text-alt opacity-60" v-t="'attachments-hint'"></span>
          </label>
          <div class="flex flex-wrap gap-2 items-center">
            <span v-for="(u, i) in attachments" :key="i" class="badge badge-lg gap-1 badge-outline">
              <i v-if="!u.tempId && !u.failed" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else-if="u.failed" class="fa-solid fa-triangle-exclamation text-error"></i>
              <span class="max-w-[12rem] truncate">{{ u.name }}</span>
              <button type="button" class="fa-solid fa-xmark" @click="attachments.splice(i, 1)"></button>
            </span>
            <label class="btn btn-sm btn-ghost gap-1">
              <i class="fa-solid fa-paperclip"></i>{{ t('upload') }}
              <input type="file" class="hidden" multiple @change="(e) => pickFiles(attachments, (e.target as HTMLInputElement).files)" />
            </label>
          </div>
        </div>

        <div v-if="!authed" class="form-control">
          <Turnstile ref="captchaWidget" :site-key="TURNSTILE_SITE_KEY" @token="(t) => (captchaToken = t)" />
        </div>

        <button type="submit" class="btn btn-primary self-end" :class="{ 'btn-disabled': busy }">
          <span v-if="submitting" class="loading loading-spinner loading-sm"></span>
          {{ submitting ? t('submitting') : t('submit') }}
        </button>

        <p class="text-sm opacity-60 text-center">
          {{ t('contact-pre') }}
          <a class="link link-hover" href="mailto:contact@phira.cn">contact@phira.cn</a>
          {{ t('contact-post') }}
        </p>
      </form>
    </div>
  </div>
</template>
