<script setup lang="ts">
withDefaults(defineProps<{ badges: string[]; names?: Record<string, string>; sm?: boolean }>(), { sm: false });

// Colors/icons are handled client-side (kept consistent with `userNameClass` in common.ts).
// Display names come from the server (`badgeNames`), falling back to the raw identifier.
const BADGE_STYLES: Record<string, { color: string; icon: string }> = {
  admin: { color: '#673ab7', icon: 'fa-solid fa-shield-halved' },
  sponsor: { color: '#ff7043', icon: 'fa-solid fa-heart' },
};

function styleOf(badge: string) {
  const s = BADGE_STYLES[badge];
  if (!s) return {};
  return { backgroundColor: s.color, borderColor: s.color, color: 'white' };
}

function iconOf(badge: string) {
  return BADGE_STYLES[badge]?.icon ?? 'fa-solid fa-certificate';
}

function labelOf(badge: string, names?: Record<string, string>) {
  return names?.[badge] ?? badge;
}
</script>

<template>
  <div v-if="badges.length" class="flex flex-row flex-wrap gap-1">
    <span v-for="badge in badges" :key="badge" class="badge badge-neutral gap-1" :class="{ 'badge-sm': sm }" :style="styleOf(badge)">
      <i :class="iconOf(badge)"></i>
      {{ labelOf(badge, names) }}
    </span>
  </div>
</template>
