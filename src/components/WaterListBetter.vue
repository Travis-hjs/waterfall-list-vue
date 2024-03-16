<template>
  <div class="top fvc">
    <button :disabled="page.loading" @click="getData(false)">{{ page.loading ? '加载中..' : '加载更多'}}</button>
    <button :disabled="page.loading" @click="refresh">{{ page.loading ? '加载中..' : '重新获取'}}</button>
    <button @click="page.move = !page.move">{{ page.move ? '关闭动画' : '开启动画'}}</button>
    <a class="link" href="#/">基础版</a>
  </div>
  <TransitionGroup :name="page.move ? 'group' : ''" tag="div" class="water-list flex" ref="wrapEl">
    <TransitionGroup
      v-for="column in page.columnList"
      :name="page.move ? 'group' : ''"
      tag="div"
      class="water-list-column"
      :key="'col-' + column.index"
      :data-height="column.height"
      :data-index="column.index"
    >
      <div class="water-list-item" v-for="item in column.list" :key="item.id">
        <img class="pic" :src="item.photo" alt="">
        <div class="title">{{ item.title }}</div>
        <div class="content ellipsis_2">{{ item.text }}</div>
        <!-- TODO: 调试用 -->
        <!-- <div class="content ellipsis_2">当前节点的所在列的高度 - {{ item.currentColumnHeight }}</div> -->
      </div>
    </TransitionGroup>
  </TransitionGroup>
</template>
<script lang="ts" setup>
import { reactive, onMounted, onUnmounted } from "vue";
import { useRequest, type ItemList, type ItemInfo } from "./hooks";

const { getList, defaultPic } = useRequest();

const page = reactive({
  loading: false,
  column: 4,
  move: true,
  columnList: [] as Array<{ index: number, list: ItemList, height: number }>
});

let cacheList: ItemList = [];

/**
 * 
 * @param addList 添加的列表
 * @param reset 是否重置（重新组装数据）
 */
function setColumnList(addList: ItemList, reset = false) {
  let result = JSON.parse(JSON.stringify(page.columnList)) as typeof page.columnList;
  if (reset) {
    result = new Array(page.column).fill(0).map((_, index) => ({ index: index, list: [], height: 0 }));
    cacheList = [];
  }
  addList.forEach(item => {
    result.sort((a, b) => a.height - b.height);
    // console.log("数据添加前 >>", item.id, result.map(ele => ({ index: ele.index, height: ele.height })));
    const target = result[0]; 
    target.height += item.height!;
    item.currentColumnHeight = target.height; // TODO: 设置一个调试值
    target.list.push(item);
    // console.log("数据添加后 >>", item.id, result.map(ele => ({ index: ele.index, height: ele.height })));
    // console.log("--------------------");

  });
  cacheList = cacheList.concat(addList);
  // 最后排一下原来的顺序再返回即可
  result.sort((a, b) => a.index - b.index);
  page.columnList = result;
}

/**
 * 加载所有图片并设置对应的宽高
 * @param list
 */
async function setImageSize(list: ItemList): Promise<ItemList> {
  const total = list.length;
  let count = 0;
  return new Promise(function(resolve) {
    function loadImage(item: ItemInfo) {
      const img = new Image();
      img.src = item.photo;
      function complete<T extends { width: number, height: number }>(target: T) {
        count++;
        item.width = target.width;
        item.height = target.height;
        if (count >= total) {
          resolve(list);
        }
      }
      img.onload = () => complete(img);
      img.onerror = function() {
        item.photo = defaultPic.data;
        complete(defaultPic);
      };
    }
    for (let i = 0; i < total; i++) {
      loadImage(list[i]);
    }
  });
}

async function getData(reset = false) {
  page.loading = true;
  const res = await getList(20);
  // page.loading = false;
  if (res.code === 1) {
    const list = await setImageSize(res.data);
    page.loading = false;
    setColumnList(list, reset);
  }
}

function refresh() {
  getData(true);
}

let observer: ResizeObserver;

onMounted(function() {
  refresh();
  observer = new ResizeObserver(function(entries) {
    const rect = entries[0].contentRect;
    let before = page.column;
    if (rect.width > 1200) {
      before = 4;
    } else if (rect.width > 900) {
      before = 3;
    } else if (rect.width > 600) {
      before = 2;
    }
    if (page.column !== before) {
      page.column = before;
      setColumnList(cacheList, true);
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