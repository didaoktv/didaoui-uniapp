// libs/function/index.js 的类型声明（allowJs 未开启，TS 侧导入 .js 需要此声明）
// ponytail: 只声明导出签名，实现仍以 JS 为准；返回值宽泛标注以免与运行时用法冲突。

export interface NodeInfo {
  width: number
  height: number
  top: number
  left: number
  right: number
  bottom: number
  [key: string]: any
}

export function getRect(selector: string, all?: false, comp?: any): Promise<NodeInfo>
export function getRect(selector: string, all: true, comp?: any): Promise<NodeInfo[]>
export function range(min?: number, max?: number, value?: number): number
export function getPx(value: number | string, unit?: boolean): any
export function rpx2px(value: number): number
export function rpxToPx(rpx: number): number
export function sleep(value?: number): Promise<void>
export function os(): string
export function sys(): any
export function getWindowInfo(): any
export function getDeviceInfo(): any
export function random(min: number, max: number): number
export function guid(len?: number, firstU?: boolean, radix?: number | null): string
export function $parent(name?: string): any
export function addStyle(customStyle: any, target?: 'object' | 'string'): any
export function addUnit(value?: number | string, unit?: string): any
export function deepClone<T>(obj: T): T
export function deepMerge<T = any>(targetOrigin?: any, source?: any): T
export function shallowMerge<T = any>(target: any, source?: any): T
export function error(err: any): void
export function randomArray<T>(array?: T[]): T[]
export function timeFormat(dateTime?: any, formatStr?: string): string
export function timeFrom(timestamp?: any, format?: string): string
export function trim(str: string, pos?: 'both' | 'left' | 'right' | 'all'): string
export function queryParams(data?: Record<string, any>, isPrefix?: boolean, arrayFormat?: string): string
export function toast(title: string, duration?: number): void
export function type2icon(type?: string, fill?: boolean): string
export function priceFormat(number: number | string, decimals?: number, decimalPoint?: string, thousandsSeparator?: string): string
export function getDuration(value: any, unit?: boolean): any
export function padZero(value: number): string
export function formValidate(instance: any, event: any): any
export function getProperty(obj: any, key: string): any
export function setProperty(obj: any, key: string, value: any): void
export function page(): any
export function pages(): any
export function getValueByPath(obj: any, path: string): any
export function genLightColor(textColor: string, lightness?: number): string

declare const _default: {
  getRect: typeof getRect
  range: typeof range
  getPx: typeof getPx
  sleep: typeof sleep
  os: typeof os
  sys: typeof sys
  getWindowInfo: typeof getWindowInfo
  random: typeof random
  guid: typeof guid
  $parent: typeof $parent
  addStyle: typeof addStyle
  addUnit: typeof addUnit
  deepClone: typeof deepClone
  deepMerge: typeof deepMerge
  shallowMerge: typeof shallowMerge
  error: typeof error
  randomArray: typeof randomArray
  timeFormat: typeof timeFormat
  timeFrom: typeof timeFrom
  trim: typeof trim
  queryParams: typeof queryParams
  toast: typeof toast
  type2icon: typeof type2icon
  priceFormat: typeof priceFormat
  getDuration: typeof getDuration
  padZero: typeof padZero
  formValidate: typeof formValidate
  getProperty: typeof getProperty
  setProperty: typeof setProperty
  page: typeof page
  pages: typeof pages
  getValueByPath: typeof getValueByPath
  genLightColor: typeof genLightColor
  rpx2px: typeof rpx2px
}
export default _default
