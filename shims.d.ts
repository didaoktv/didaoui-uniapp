// JS 写法组件（uview-plus 迁移件：keyboard/qrcode/avatar/text/canvas 系列等）无 TS 声明时的兜底
// vue-tsc 会为 TS SFC 生成精确类型，优先于本通配声明
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
