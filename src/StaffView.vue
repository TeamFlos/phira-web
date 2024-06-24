<i18n lang="yml" src="@/locales/staff.yml"></i18n>
<script setup lang="ts">
import { useFetchApi } from './common'
import { ref } from 'vue';

import { useI18n } from 'vue-i18n';

import SimpleUserCard from './components/SimpleUserCard.vue';

const { t } = useI18n();
const fetchApi = useFetchApi()

type Roles = {
  admins: number[];
  headSupervisors: number[];
  supervisors: number[];
  headReviewers: number[];
  reviewers: number[];
};

let staff = ref(await fetchApi('/staff') as Roles);
let roles: (keyof Roles)[] = ['admins', 'headSupervisors', 'supervisors', 'headReviewers', 'reviewers'];

function toKebab(str: string) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

staff.value.admins = staff.value.admins.sort((a, b) => a - b);
staff.value.headSupervisors = staff.value.headSupervisors.sort((a, b) => a - b);
staff.value.supervisors = staff.value.supervisors.sort((a, b) => a - b);
staff.value.headReviewers = staff.value.headReviewers.sort((a, b) => a - b);
staff.value.reviewers = staff.value.reviewers.sort((a, b) => a - b);
</script>

<template>
  <div>
    <h1 class="text-center text-3xl font-bold mb-4">{{ t('staff-title') }}</h1>
    <div class="flex flex-row justify-center w-full">
      <div class="mx-8 max-w-none w-full lg:w-3/4 flex flex-col items-end">
        <div class="card bg-base-100 shadow-xl p-4 mt-4 w-full">
          <div class="overflow-x-auto w-full flex flex-col gap-4">
            <div v-for="role in roles" :key="role">
              <p class="text-grey text-start text-xl font-bold px-4">{{ t(toKebab(role)) }}</p>
              <!-- <SimpleUserCard :id="id" /> -->
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <SimpleUserCard v-for="id in staff[role]" :key="id" :id="id" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
