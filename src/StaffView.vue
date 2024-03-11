<i18n lang="yml" src="@/locales/staff.yml"></i18n>
<script setup lang="ts">
import { ref } from 'vue';

import { useI18n } from 'vue-i18n';
import SimpleUserCard from './components/SimpleUserCard.vue';
const { t } = useI18n();

let staff = ref(
  (await fetch('/staff.json').then((res) => res.json())) as {
    admins: number[];
    headSupervisors: number[];
    supervisors: number[];
    headReviewers: number[];
    reviewers: number[];
  },
);
let roles: ['admins', 'headSupervisors', 'supervisors', 'headReviewers', 'reviewers'] = ['admins', 'headSupervisors', 'supervisors', 'headReviewers', 'reviewers'];

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
    <h1 class="text-white text-center text-3xl font-bold">{{ t('staff-title') }}</h1>
    <div class="flex flex-row justify-center w-full">
      <div class="mx-8 max-w-none w-full lg:w-3/4 flex flex-col items-end">
        <div class="card bg-base-100 shadow-xl p-4 mt-4 w-full">
          <div class="overflow-x-auto flex flex-col items-end gap-2">
            <div class="overflow-x-auto w-full">
              <table class="table">
                <div v-for="role in roles" :key="role">
                  <thead>
                    <th>
                      <p class="text-grey text-start text-xl font-bold px-4">{{ t(toKebab(role)) }}</p>
                    </th>
                  </thead>
                  <tbody>
                    <tr v-for="id in staff[role]" :key="id">
                      <td>
                        <SimpleUserCard :id="id" />
                      </td>
                    </tr>
                  </tbody>
                </div>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
