// libs/function/test.js 的类型声明（allowJs 未开启，TS 侧导入 .js 需要此声明）
// ponytail: 校验函数统一 `(value: any, ...) => boolean`，实现细节以 JS 为准。

export function email(value: any): boolean
export function mobile(value: any): boolean
export function url(value: any): boolean
export function date(value: any): boolean
export function dateISO(value: any): boolean
export function number(value: any): boolean
export function string(value: any): boolean
export function digits(value: any): boolean
export function idCard(value: any): boolean
export function carNo(value: any): boolean
export function amount(value: any): boolean
export function chinese(value: any): boolean
export function letter(value: any): boolean
export function enOrNum(value: any): boolean
export function contains(value: any, param: any): boolean
export function range(value: any, param: [number, number]): boolean
export function rangeLength(value: any, param: [number, number]): boolean
export function landline(value: any): boolean
export function empty(value: any): boolean
export function jsonString(value: any): boolean
export function array(value: any): boolean
export function object(value: any): boolean
export function objectPromise(value: any): boolean
export function code(value: any, len?: number): boolean
export function func(value: any): boolean
export function promise(value: any): boolean
export function image(value: any): boolean
export function video(value: any): boolean
export function regExp(o: any): boolean

declare const _default: {
  email: typeof email
  mobile: typeof mobile
  url: typeof url
  date: typeof date
  dateISO: typeof dateISO
  number: typeof number
  digits: typeof digits
  idCard: typeof idCard
  carNo: typeof carNo
  amount: typeof amount
  chinese: typeof chinese
  letter: typeof letter
  enOrNum: typeof enOrNum
  contains: typeof contains
  range: typeof range
  rangeLength: typeof rangeLength
  empty: typeof empty
  isEmpty: typeof empty
  jsonString: typeof jsonString
  landline: typeof landline
  object: typeof object
  array: typeof array
  code: typeof code
  func: typeof func
  promise: typeof promise
  video: typeof video
  image: typeof image
  regExp: typeof regExp
  string: typeof string
}
export default _default
