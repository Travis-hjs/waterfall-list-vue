<template>
  <div class="top fvc">
    <button :disabled="page.loading" @click="getData">{{ page.loading ? '加载中..' : '加载更多'}}</button>
    <button :disabled="page.loading" @click="refresh">{{ page.loading ? '加载中..' : '重新获取'}}</button>
    <button @click="page.move = !page.move">{{ page.move ? '关闭动画' : '开启动画'}}</button>
    <a class="link" href="#/">基础版</a>
  </div>
  <TransitionGroup :name="page.move ? 'group' : ''" tag="div" class="water-list flex" ref="wrapEl">
    <TransitionGroup :name="page.move ? 'group' : ''" tag="div" class="water-list-column" v-for="column in pageList" :key="'col-' + column.id" :data-height="column.height">
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
import { useRequest, type ItemList, type ItemInfo } from "./hooks";

const { getList, defaultPic } = useRequest();

const page = reactive({
  loading: false,
  column: 4,
  update: 0,
  move: true
});

let cacheList: ItemList = [];

const pageList = computed(function() {
  const result = new Array(page.column).fill(0).map((_, index) => ({ id: index, list: [] as ItemList, height: 0 }));
  /** 设置列的索引 */
  let columnIndex = 0;
  // TODO: 这里放一个引用值，用于手动更新；
  page.update;
  // 开始组装数据
  for (let i = 0; i < cacheList.length; i++) {
    const item = cacheList[i];
    if (columnIndex < 0) {
      // 从这里开始，将以最低高度列的数组进行添加数据，这样就不会出现某一列高度与其他差距较大的情况
      result.sort((a, b) => a.height - b.height);
      // console.log("数据添加前 >>", item.id, result.map(ele => ({ index: ele.id, height: ele.height })));
      result[0].list.push(item);
      result[0].height += item.height!;
      // console.log("数据添加后 >>", item.id, result.map(ele => ({ index: ele.id, height: ele.height })));
      // console.log("--------------------");
    } else {
      result[columnIndex].list.push(item);
      result[columnIndex].height += item.height!;
      columnIndex++;
      if (columnIndex >= page.column) {
        columnIndex = -1;
      }
    }
  }
  console.log("重新计算列表 !!----------!!");
  // 最后排一下原来的顺序再返回即可
  result.sort((a, b) => a.id - b.id);
  // console.log("处理过的数据列表 >>", result);
  return result;
});

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
        item.width = img.width;
        item.height = img.height;
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

async function getData() {
  page.loading = true;
  const res = await getList(20);
  // page.loading = false;
  if (res.code === 1) {
    const list = await setImageSize(res.data);
    page.loading = false;
    cacheList = cacheList.concat(list);
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