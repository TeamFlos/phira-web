<script setup lang="ts">

import { useFetchApi } from '../common'

const props = defineProps<{ chart: number }>();

const fetchApi = useFetchApi();

let resp = await fetchApi(`/record/query?chart=${props.chart}`);

const records = resp.results;

</script>

<template>
  <div class="overflow-x-auto">
    <table class="table">
      <thead>
        <tr>
          <th>排名</th>
          <th>玩家</th>
          <th>分数</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(record, index) in records" class="hover">
          <th>{{ index + 1 }}</th>
          <td>{{ record.player }}</td>
          <td>{{ record.score }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
