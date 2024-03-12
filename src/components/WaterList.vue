<template>
  <div class="top fvc">
    <button :disabled="page.loading" @click="getData">{{ page.loading ? '加载中..' : '加载更多'}}</button>
    <button :disabled="page.loading" @click="refresh">{{ page.loading ? '加载中..' : '重新获取'}}</button>
    <button @click="page.move = !page.move">{{ page.move ? '关闭动画' : '开启动画'}}</button>
    <a class="link" href="#/better">进阶版</a>
  </div>
  <TransitionGroup :name="page.move ? 'group' : ''" tag="div" class="water-list flex" ref="wrapEl">
    <TransitionGroup :name="page.move ? 'group' : ''" tag="div" class="water-list-column" v-for="column in pageList" :key="'col-' + column.id">
      <div class="water-list-item" v-for="item in column.list" :key="item.id">
        <img class="pic" :src="item.photo" alt="">
        <div class="title">{{ item.title }}</div>
        <div class="content ellipsis_2">{{ item.text }}</div>
      </div>
    </TransitionGroup>
  </TransitionGroup>
</template>
<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRequest, type ItemList } from "./hooks";

const { getList } = useRequest();

const page = reactive({
  loading: false,
  column: 4,
  update: 0,
  move: true
});

let cacheList: ItemList = [];

const pageList = computed(function() {
  const result = new Array(page.column).fill(0).map((_, index) => ({ id: index, list: [] as ItemList }));
  let columnIndex = 0;
  page.update; // TODO: 这里放一个引用值，用于手动更新；
  for (let i = 0; i < cacheList.length; i++) {
    const item = cacheList[i];
    result[columnIndex].list.push(item);
    columnIndex++;
    if (columnIndex >= page.column) {
      columnIndex = 0;
    }
  }
  console.log("重新计算列表 !!----------!!");
  return result;
});


async function getData() {
  page.loading = true;
  const res = await getList(20);
  page.loading = false;
  if (res.code === 1) {
    cacheList = cacheList.concat(res.data);
    // TODO: 手动更新，这里不把`cacheList`放进`page`里面是因为响应数据列表过多会影响性能
    page.update++;
  }
}

function refresh() {
  cacheList = [];
  page.update++;
  getData();
}

let observer: ResizeObserver;

onMounted(function() {
  getData();
  observer = new ResizeObserver(function(entries) {
    const rect = entries[0].contentRect;
    if (rect.width > 1200) {
      page.column = 4;
    } else if (rect.width > 900) {
      page.column = 3;
    } else if (rect.width > 600) {
      page.column = 2;
    }
  });
  observer.observe(document.querySelector(".water-list")!);
});

onUnmounted(function() {
  observer.disconnect();
})

</script>
<style lang="scss">
@import url("./main.scss");
</style>