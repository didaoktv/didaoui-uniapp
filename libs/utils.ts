// ============================================================
// DidaoUI-uniapp Utility Functions
// ============================================================

// 平台检测
// ponytail: vue-tsc 不识别 #ifdef 注释，四个 const 块会被视为重复声明，
// 故改为单次 let 声明 + 条件编译赋值。代价：失去编译期常量的 tree-shake
// （升级路径：改用 process.env.UNI_PLATFORM 判定）。
export let isH5 = false
export let isMP = false
export let isMPWeixin = false
export let isMPToutiao = false
export let isApp = false

// #ifdef H5
isH5 = true
// #endif
// #ifdef MP-WEIXIN
isMP = true
isMPWeixin = true
// #endif
// #ifdef MP-TOUTIAO
isMP = true
isMPToutiao = true
// #endif
// #ifdef APP-PLUS
isApp = true
// #endif

// 防抖
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// 节流
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let last = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - last >= delay) {
      last = now
      fn(...args)
    }
  }
}

// rpx → px (仅 H5 需要)
export function rpx2px(rpx: number): number {
  // #ifdef H5
  const screenWidth = window.screen.width
  return (rpx / 750) * screenWidth
  // #endif
  // #ifndef H5
  return rpx
  // #endif
}

// 获取状态栏高度
export function getStatusBarHeight(): number {
  // #ifdef H5
  return 0
  // #endif
  // ponytail: 运行时兜底 —— 条件编译失效时（如 H5 构建配置错误），
  // 防止走到 MP/APP 分支拿到非零 statusBarHeight
  // #ifndef H5
  const sysInfo = uni.getWindowInfo()
  return sysInfo.statusBarHeight || 20
  // #endif
}

// 获取胶囊按钮位置信息 (仅微信小程序)
export function getMenuButtonBoundingClientRect() {
  // #ifdef MP-WEIXIN
  return uni.getMenuButtonBoundingClientRect()
  // #endif
  // #ifndef MP-WEIXIN
  return null
  // #endif
}

// 查询节点尺寸
export function getRect(selector: string): Promise<UniApp.NodeInfo> {
  return new Promise((resolve) => {
    uni.createSelectorQuery()
      .select(selector)
      .boundingClientRect((rect) => {
        resolve(rect as UniApp.NodeInfo)
      })
      .exec()
  })
}

// 获取事件值 (跨端兼容)
export function getEventValue(e: any): string {
  return e?.detail?.value ?? e?.target?.value ?? ''
}
