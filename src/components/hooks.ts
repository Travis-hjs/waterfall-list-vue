import { randomText, ranInt } from "@/utils";
import loadFail from "../assets/load-fail.png";

export interface ItemInfo {
  id: number
  title: string
  text: string
  /** 图片路径 */
  photo: string
  /** 图片的宽度，前端获取图片信息之后设置 */
  width?: number
  /** 图片的高度，前端获取图片信息之后设置 */
  height?: number
}

export type ItemList = Array<ItemInfo>;

let id = 0;

/**
 * 
 * @param maxDelay 最大延迟毫秒数，不能低于`100`
 */
export function useRequest(maxDelay = 1000) {
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
      }, ranInt(100, maxDelay));
    });
  }

  const defaultPic = {
    data: loadFail,
    width: 200,
    height: 200
  };

  return {
    getList,
    defaultPic
  }
}
