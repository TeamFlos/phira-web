<script setup lang="ts">
// Cloudflare Turnstile widget, explicitly rendered (SPA-friendly). Emits the
// single-use response token; tokens are redeemed exactly once server-side,
// so forms must call `reset()` (via the template ref) before allowing a
// retry after a failed submission.
//
// When the script or the widget fails to load (offline, dev, blocked
// network), the component emits `null` and stays silent: the backend
// decides whether a captcha is actually required (`turnstileSecret` unset
// skips verification), so a missing token should not block the form UI.
import { onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps<{ siteKey: string }>();
const emit = defineEmits<{ (e: 'token', token: string | null): void }>();

const el = ref<HTMLElement | null>(null);
let widgetId: string | null = null;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
    turnstileOnLoad?: () => void;
  }
}

// One shared api.js load across all mounted widgets.
let apiLoader: Promise<void> | null = null;
function loadApi(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  apiLoader ??= new Promise((resolve, reject) => {
    window.turnstileOnLoad = () => resolve();
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=turnstileOnLoad&render=explicit';
    s.async = true;
    s.onerror = () => {
      apiLoader = null;
      reject(new Error('Turnstile failed to load'));
    };
    document.head.appendChild(s);
  });
  return apiLoader;
}

onMounted(async () => {
  try {
    await loadApi();
    if (!el.value || !window.turnstile) return;
    widgetId = window.turnstile.render(el.value, {
      sitekey: props.siteKey,
      callback: (token: string) => emit('token', token),
      'error-callback': () => emit('token', null),
      'expired-callback': () => emit('token', null),
    });
  } catch {
    emit('token', null);
  }
});

onBeforeUnmount(() => {
  if (widgetId != null) window.turnstile?.remove(widgetId);
});

function reset() {
  if (widgetId != null) window.turnstile?.reset(widgetId);
}
defineExpose({ reset });
</script>

<template>
  <div ref="el"></div>
</template>
