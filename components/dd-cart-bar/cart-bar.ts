/** 购物车条目（dd-cart-bar 配套；price 单位与全库一致为「分」） */
export interface DdCartItem {
  /** 唯一标识 */
  id: string | number
  /** 商品名 */
  name: string
  /** 商品图（不传渲染占位图标） */
  image?: string
  /** 单价，单位：分 */
  price: number
  /** 数量（减到 1 再减 = 移除该项，由 change 回传剔除后的数组） */
  count: number
  /** 已选规格/备注文案（如「大杯 / 少冰」） */
  specs?: string
}
