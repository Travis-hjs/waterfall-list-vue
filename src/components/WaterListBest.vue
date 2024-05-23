<template>
  <div class="top fvc">
    <button :disabled="page.loading" @click="getData(false)">{{ page.loading ? '加载中..' : '加载更多'}}</button>
    <button :disabled="page.loading" @click="refresh">{{ page.loading ? '加载中..' : '重新获取'}}</button>
    <button @click="page.move = !page.move">{{ page.move ? '关闭动画' : '开启动画'}}</button>
    <a class="link" href="#/">基础版</a>
    <a class="link" href="#/better">进阶版</a>
  </div>
  <TransitionGroup :name="page.move ? 'group' : ''" tag="div" class="waterfall-box">
    <div class="waterfall-item" v-for="(item, index) in page.list" :key="item.id">
      <img class="pic" :src="item.photo" alt="" :ref="e => setItemStyle(e as any, index)">
      <div class="title">{{ item.title }}</div>
      <div class="content ellipsis_2">{{ item.text }}</div>
    </div>
  </TransitionGroup>
</template>
<script lang="ts" setup>
import { reactive, onMounted, onUnmounted } from "vue";
import { useRequest, type ItemList } from "./hooks";

const { getList, defaultPic } = useRequest();

const page = reactive({
  loading: false,
  column: 4,
  move: true,
  list: [] as ItemList,
});

function setItemStyle(img: HTMLImageElement, index: number) {
  // console.log(index, img);
  if (!img) return;
  function update() {
    const item = img.parentElement;
    if (!item) return;
    const gapRows = index >= page.column ? (page.column * 2) : 0;
    const rows = Math.ceil(item.clientHeight / 2) + gapRows;
    item.style.gridRowEnd = `span ${rows}`;
  }
  update();
  img.onload = update;
  img.onerror = function() {
    img.src = defaultPic.data;
    update();
  };
}

async function getData(reset = false) {
  page.loading = true;
  const res = await getList(20);
  page.loading = false;
  if (res.code === 1) {
    if (reset) {
      page.list = res.data;
    } else {
      page.list = page.list.concat(res.data);
    }
  }
}

function refresh() {
  getData(true);
}

let observer: ResizeObserver;

onMounted(function() {
  refresh();
  const el = document.querySelector(".waterfall-box")! as HTMLElement;
  observer = new ResizeObserver(function(entries) {
    const rect = entries[0].contentRect;
    if (rect.width > 1200) {
      page.column = 4;
    } else if (rect.width > 900) {
      page.column = 3;
    } else if (rect.width > 600) {
      page.column = 2;
    }
    el.style.setProperty("--column", page.column.toString());
  });
  observer.observe(el);
});

onUnmounted(function() {
  observer.disconnect();
})

</script>
<style lang="scss">
@import url("./main.scss");
.waterfall-box {
  --column: 4;
  display: grid;
  grid-template-columns: repeat(var(--column), 1fr);
  grid-gap: 0 20px;
  padding: 20px 0;
  align-items: end;
  .waterfall-item {
    background-color: #fff;
    margin-bottom: 20px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0px 0px 12px rgba(0, 0, 0, .12);
    padding: 10px;
    .pic {
      display: block;
      width: 100%;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 14px;
    }
    .title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .content {
      font-size: 14px;
      color: #222;
      line-height: 20px;
      height: 40px;
    }
  }
}
</style>