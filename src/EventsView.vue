<i18n>
en:
  events: events

zh-CN:
  event: 活动

</i18n>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useI18n } from 'vue-i18n';

import { useFetchApi, loggedIn } from './common';

import type { EventList, User, Page } from './model';

import LoadView from './components/LoadView.vue';
import EventCard from './components/EventCard.vue';

const route = useRoute();

const fetchApi = useFetchApi();

let user: User | null = null;

loggedIn() ? fetchApi('/me', {}, (user) => (user = user as User)) : user;

const totalCount = ref(0);
const events = ref<EventList[]>();
const { t } = useI18n();

watch(
  () => route.query,
  () => {
    let q = route.query;
  },
  { immediate: true },
);

async function fetchEvents() {
  events.value = undefined;
  const resp = (await fetchApi('/event')) as Page<EventList>;
  totalCount.value = resp.count;
  events.value = resp.results;
}

await fetchEvents();
</script>

<style>
@keyframes button-press {
  from {
    transform: scale(1);
  }

  to {
    transform: scale(0.97);
  }
}
</style>

<template>
  <div class="flex items-center mt-8">
    <div class="mx-96">
      <div v-if="events">
        <EventCard v-for="event in events" :key="event.id" :event="event"></EventCard>
      </div>
      <div v-else class="flex flex-col items-center w-full h-16 mb-8">
        <LoadView class="m-8 loading-lg" />
      </div>
    </div>
  </div>
</template>
