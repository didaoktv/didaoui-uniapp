/** 订单行（dd-order-list 配套；金额单位与全库一致为「分」） */
export interface DdOrderLine {
  /** 唯一标识 */
  id: string | number
  /** 品项名 */
  name: string
  /** 数量 */
  qty: number
  /** 小计，单位：分 */
  priceFen: number
  /** 商品图（不传则商品卡渲染主题底色 + 名称前 2 字占位） */
  thumb?: string
}

/** 订单卡片（多选列表；checkable 时点卡片切换选中并回传 id 数组） */
export interface DdOrderItem {
  /** 唯一标识 */
  id: string | number
  /** 订单标题（如单号、来源） */
  title: string
  /** 状态文案（如「待结算」，不传不渲染状态角标） */
  statusText?: string
  /** 品项行 */
  lines: DdOrderLine[]
  /** 合计，单位：分 */
  totalFen: number
  /** 下单时间文案（组件只做展示，格式由消费方定） */
  timeText?: string
  /** 备注文案（不传不渲染） */
  remark?: string
}
