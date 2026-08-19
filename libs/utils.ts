// ============================================================
// ddktv-ui Utility Functions
// ============================================================

// 平台检测
// #ifdef H5
export const isH5 = true
export const isMP = false
export const isMPWeixin = false
export const isMPToutiao = false
export const isApp = false
// #endif

// #ifdef MP-WEIXIN
export const isH5 = false
export const isMP = true
export const isMPWeixin = true
export const isMPToutiao = false
export const isApp = false
// #endif

// #ifdef MP-TOUTIAO
export const isH5 = false
export const isMP = true
export const isMPWeixin = false
export const isMPToutiao = true
export const isApp = false
// #endif

// #ifdef APP-PLUS
export const isH5 = false
export const isMP = false
export const isMPWeixin = false
export const isMPToutiao = false
export const isApp = true
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
