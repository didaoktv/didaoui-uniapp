// libs/config/zIndex.js 的类型声明（该库多为 JS 文件，allowJs 未开启，TS 侧导入需要此声明）
declare const zIndex: {
  base: number
  sticky: number
  overlay: number
  popup: number
  dialogMask: number
  dialog: number
  noNetwork: number
  cropper: number
  loading: number
  toast: number
}
export default zIndex
