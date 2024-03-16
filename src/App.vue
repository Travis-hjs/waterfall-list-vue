<template>
  <WaterListBest v-if="pageType === 'best'" />
  <WaterListBetter v-else-if="pageType === 'better'" />
  <WaterList v-else-if="pageType === 'base'" />
</template>

<script setup lang="ts">
import WaterList from "./components/WaterList.vue";
import WaterListBetter from "./components/WaterListBetter.vue";
import WaterListBest from "./components/WaterListBest.vue";

import { onMounted, ref } from "vue";
import { router } from "./utils";

const pageType = ref<""|"base"|"better"|"best">("");

router.onchange("/best", function() {
  pageType.value = "best";
});

router.onchange("/better", function() {
  pageType.value = "better";
});

router.onchange("/", function() {
  pageType.value = "base";
});

onMounted(function() {
  !router.path && router.push({
    title: "base",
    path: "/"
  });
})

</script>

<style>

</style>
