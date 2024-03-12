/**
 * 范围随机整数
 * @param min 最小数
 * @param max 最大数
 */
export function ranInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * 随机生成中文
 * @param min 
 * @param max 
 */
export function randomText(min: number, max: number) {
  const len = parseInt((Math.random() * max).toString()) + min;
  const base = 20000;
  const range = 1000;
  let str = '';
  let i = 0;
  while (i < len) {
    i++;
    const lower = parseInt((Math.random() * range).toString());
    str += String.fromCharCode(base + lower);
  }
  return str;
}

interface RouterChangeOptions {
  /** 路由标题 */
  title: string
  /** 路由路径 */
  path: string
  /** 路由传参对象 */
  data: Record<string, any>
  /** 路由传参`?`后面的参数对象 */
  params: Record<string, any>
}

/**
 * 路由组件
 * - `hash`模式
 */
function moduleRouter() {
  const routeInfo: Record<string, () => void> = {};
  /** 当前路径传参对象 */
  let currentPathParams = {};
  /** 当前路由路径 */
  let currentPath = getHashPath();

  /**
   * 格式化传参字段
   * @param parmas 传参对象
   */
  function formatParams(parmas: Record<string, any>) {
    let result = "";
    for (const key in parmas) {
      result += `&${key}=${parmas[key]}`;
    }
    return result ? `?${result.slice(1)}` : "";
  }

  /** 获取`hash`模式下的路由路径，并设置当前路由参数 */
  function getHashPath() {
    const values = location.href.split("#");
    if (values.length > 1) {
      const list = values[1].split("?");
      currentPathParams = list.length > 1 ? formatSearch(list[1]) : {};
      return list[0];
    } else {
      return "";
    }
  }

  /**
   * 获取处理过后的路径信息
   * @param value 
   */
  function getPathInfo(value: string) {
    const list = value.split("?");
    return {
      path: list[0],
      params: list.length > 1 ? formatSearch(list[1]) : {}
    }
  }

  /**
   * 格式化`?`后面的参数成对象
   * @param value `key=value`
   */
  function formatSearch(value: string) {
    const result: Record<string, string> = {};
    const values = value.split("&");
    for (let i = 0; i < values.length; i++) {
      const item = values[i];
      const items = item.split("=");
      if (items.length > 1) {
        result[items[0]] = item.replace(`${items[0]}=`, "");
      }
    }
    return result;
  }

  /**
   * 设置路由变动
   * @param options 路由传参
   * @param type 变动类型
   */
  function setRoute(options: RouterChangeOptions, type: "replaceState"|"pushState") {
    const data = options.data || {};
    const title = options.title || "";
    let path = typeof options === "string" ? options : options.path;
    let params = options.params || {};
    // 判断处理一下路径带参数和
    const pathInfo = getPathInfo(path);
    path = pathInfo.path;
    params = { ...params, ...pathInfo.params };
    if (currentPath == path && JSON.stringify(currentPathParams) == JSON.stringify(params)) return console.warn("重复的路由路径和参数，不作任何处理");
    history[type](data, title, "#" + path + formatParams(params));
    routeChange();
  }

  /** 路由变动 */
  function routeChange() {
    currentPath = getHashPath();
    const callback = routeInfo[currentPath];
    if (typeof callback === "function") callback();
  }

  // 注意这里外部设置到 window.addEventListener("popstate") 的话会影响到路由跳转，好像修复了
  window.addEventListener("load", routeChange, false);
  window.addEventListener("hashchange", routeChange, false);
  window.addEventListener("popstate", routeChange, false);

  return {
    /** 路由传参对象 */
    get data() {
      return history.state;
    },
    /** 路由参数，url?后面的参数 */
    get params() {
      return currentPathParams;
    },
    /**
     * 路由重定向
     * @param options 可以传字符串：`/home`
     */
    replace(options: RouterChangeOptions) {
      setRoute(options, "replaceState");
    },
    /**
     * 路由跳转
     * @param options 可以传字符串：`/home`
     */
    push(options: RouterChangeOptions) {
      setRoute(options, "pushState");
    },
    /**
     * 监听路由变动
     * @param path 路由路径
     * @param callback 路由回调
     */
    onchange(path: string, callback: () => void) {
      routeInfo[path] = callback;
    }
  }
}

/**
 * 自定义路由
 */
export const router = moduleRouter();
