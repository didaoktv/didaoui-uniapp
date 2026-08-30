// libs/config/zIndex.js 的类型声明（该库多为 JS 文件，allowJs 未开启，TS 侧导入需要此声明）
declare const zIndex: {
  toast: number
  noNetwork: number
  popup: number
  mask: number
  dialogMask: number
  dialog: number
  navbar: number
  topTips: number
  sticky: number
  indexListSticky: number
}
export default zIndex
