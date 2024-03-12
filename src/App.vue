<template>
  <WaterListBetter v-if="pageType === 'better'" />
  <WaterList v-else-if="pageType === 'base'" />
</template>

<script setup lang="ts">
import WaterList from "./components/WaterList.vue";
import WaterListBetter from "./components/WaterListBetter.vue";
import { ref } from "vue";
import { router } from "./utils";

const pageType = ref<""|"base"|"better">("");

router.onchange("/better", function() {
  pageType.value = "better";
});

router.onchange("/", function() {
  pageType.value = "base";
});

</script>

<style>

</style>
