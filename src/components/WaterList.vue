<template>
  <div class="top fvc">
    <button :disabled="page.loading" @click="getData">{{ page.loading ? '加载中..' : '加载更多'}}</button>
    <button :disabled="page.loading" @click="refresh">{{ page.loading ? '加载中..' : '重新获取'}}</button>
    <button @click="page.move = !page.move">{{ page.move ? '关闭动画' : '开启动画'}}</button>
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
<script lang="ts">
let id = 0;
</script>
<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { randomText, ranInt } from "@/utils";

interface ItemInfo {
  id: number,
  title: string
  text: string
  photo: string
}

type ItemList = Array<ItemInfo>;

/**
 * 模拟接口请求列表
 * @param total 条数
 */
function getList(total: number): Promise<{ code: number, data: ItemList }> {
  return new Promise(function(resolve, reject) {
    const list: ItemList = [];
    for (let i = 0; i < total; i++) {
      id++;
      list.push({
        id: id,
        title: "卡片标题-" + id,
        text: randomText(4, 58),
        photo: `https://picsum.photos/300/${ranInt(200, 500)}`
      });
    }
    setTimeout(function() {
      resolve({ code: 1, data: list});
    }, ranInt(100, 1000));
  });
}

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
  page.update; // 这里放一个引用值，用于手动更新；
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
.water-list {
  width: 100%;
  padding: 20px 14px;
  .water-list-column {
    flex: 1;
    padding: 0 6px;
    .water-list-item {
      // width: 100%;
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
      }
    }
  }
  .water-list-column + .water-list-column {
    margin-left: 14px;
  }
}
.water-list.develop {
  outline: #13ce66 dashed 1px;
  .water-list-column {
    outline: #1890FF solid 1px;
    .water-list-item {
      outline: #fdd835 solid 1px;
    }
  }
}
.top {
  width: 100%;
  height: 80px;
  border-bottom: solid 1px #ddd;
  background-color: #fff;
  position: sticky;
  top: 0;
  left: 0;
  z-index: 10;
  button {
    font-size: 14px;
    padding: 0px 15px;
    min-width: 88px;
    height: 36px;
    line-height: 1;
    border-radius: 2px;
    background-color: #fff;
    color: rgba(0,0,0,.87);
    box-shadow: 0 3px 1px -2px rgba(0,0,0,0.2), 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12);
    transition: .2s;
    outline: none;
    text-align: center;
    border: none;
    cursor: pointer;
    background-color: #1890FF;
    color: #fff;
    &:active {
      box-shadow: 0 5px 5px -3px rgba(0,0,0,0.2), 0 8px 10px 1px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12);
    }
    &:disabled {
      cursor: no-drop;
      opacity: 0.7;
    }
  }
  button + button {
    margin-left: 10px;
  }
}

.group-move,
.group-enter-active,
.group-leave-active {
  transition: .8s all;
}

.group-enter-from,
.group-leave-to {
  opacity: 0;
  transform: scale(.5);
}

.group-leave-active {
  position: absolute;
}

</style>