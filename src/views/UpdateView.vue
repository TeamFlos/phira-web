<i18n>
en:
  title: Redirecting
  redirecting: Redirecting in {seconds}s…
  redirect: Go now

zh-CN:
  title: 正在跳转
  redirecting: "{seconds} 秒后跳转…"
  redirect: 立即前往
</i18n>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const NEW_URL = 'https://phira.dmocken.top';
const COUNTDOWN = 3;

const { t } = useI18n();

const seconds = ref(COUNTDOWN);
let timer: ReturnType<typeof setInterval> | undefined;

function redirect() {
  if (timer) clearInterval(timer);
  window.location.href = NEW_URL;
}

onMounted(() => {
  timer = setInterval(() => {
    seconds.value -= 1;
    if (seconds.value <= 0) redirect();
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div class="flex justify-center items-center p-8">
    <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100 mt-16">
      <div class="card-body gap-4">
        <p class="text-base-content/70">{{ t('redirecting', { seconds }) }}</p>
        <div class="card-actions mt-2">
          <button class="btn btn-primary w-full" @click="redirect">{{ t('redirect') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
