// dd-package-sku 纯逻辑（可选组 N选M 校验/加价合计/文案），供组件与 scripts/package-sku-selfcheck.ts 共用
// ponytail: 通用形状不绑业务 DTO；qty 缺省视为不限量（enabled 缺省视为可选）

export interface PackageSkuItem {
  id: string | number
  name: string
  /** 加价金额（分），0/缺省 = 不加价 */
  priceFen?: number
  /** 库存数量，<=0 置灰；缺省视为有货 */
  qty?: number
  /** false 置灰；缺省视为可用 */
  enabled?: boolean
}

export interface PackageSkuGroup {
  id: string | number
  name: string
  /** 最少选择数，缺省 0 */
  minSel?: number
  /** 最多选择数，缺省 = items.length */
  maxSel?: number
  /** FIXED = 只读展示不可选；缺省 OPTIONAL */
  groupType?: 'FIXED' | 'OPTIONAL'
  items: PackageSkuItem[]
}

export interface PackageSkuOption {
  groupId: string | number
  skuId: string | number
}

/** 选择状态：key = String(group.id)，value = 已选 item.id 数组 */
export type PackageSkuSelections = Record<string, (string | number)[]>

export function isFixed(group: PackageSkuGroup): boolean {
  return group.groupType === 'FIXED'
}

export function isItemDisabled(item: PackageSkuItem): boolean {
  return item.enabled === false || (item.qty !== undefined && item.qty <= 0)
}

export function groupMin(group: PackageSkuGroup): number {
  return group.minSel ?? 0
}

export function groupMax(group: PackageSkuGroup): number {
  return group.maxSel ?? group.items.length
}

/** 组标题右侧文案：N选M / 选x~y项 / 最多选y项；FIXED 无文案 */
export function groupHint(group: PackageSkuGroup): string {
  if (isFixed(group)) return ''
  const min = groupMin(group)
  const max = groupMax(group)
  if (min === max) return `${group.items.length}选${max}`
  if (min > 0) return `选${min}~${max}项`
  return `最多选${max}项`
}

/** 单选组：上限为 1 的 OPTIONAL 组（N选1），点非选中项直接替换选中，无需先取消 */
export function isSingleSelect(group: PackageSkuGroup): boolean {
  return !isFixed(group) && groupMax(group) === 1
}

/**
 * 点击可选项后的新选中集（纯逻辑，供组件与自检共用）
 * 返回 null 表示多选上限拦截；FIXED/售罄由调用方先行拦截，不在此处理
 */
export function nextSelection(
  group: PackageSkuGroup,
  selected: (string | number)[],
  itemId: string | number,
): (string | number)[] | null {
  const at = selected.indexOf(itemId)
  if (at >= 0) {
    const copy = selected.slice()
    copy.splice(at, 1)
    return copy
  }
  if (isSingleSelect(group)) return [itemId]
  if (selected.length >= groupMax(group)) return null
  return [...selected, itemId]
}

/** 组是否已选满最低要求（上限在点击时拦截，不会超） */
export function isGroupSatisfied(group: PackageSkuGroup, selections: PackageSkuSelections): boolean {
  if (isFixed(group)) return true
  const selected = selections[String(group.id)] ?? []
  return selected.length >= groupMin(group)
}

export function canConfirm(groups: PackageSkuGroup[], selections: PackageSkuSelections): boolean {
  return groups.every((g) => isGroupSatisfied(g, selections))
}

/** 首个未满足组的提示文案（全部满足返回空串） */
export function unmetText(groups: PackageSkuGroup[], selections: PackageSkuSelections): string {
  for (const g of groups) {
    if (isFixed(g)) continue
    const need = groupMin(g) - (selections[String(g.id)] ?? []).length
    if (need > 0) return `「${g.name}」还需选择 ${need} 项`
  }
  return ''
}

export function buildOptions(groups: PackageSkuGroup[], selections: PackageSkuSelections): PackageSkuOption[] {
  const options: PackageSkuOption[] = []
  for (const g of groups) {
    if (isFixed(g)) continue
    for (const skuId of selections[String(g.id)] ?? []) {
      options.push({ groupId: g.id, skuId })
    }
  }
  return options
}

/** 已选 OPTIONAL 项加价合计（分） */
export function computeSurchargeFen(groups: PackageSkuGroup[], selections: PackageSkuSelections): number {
  let sum = 0
  for (const g of groups) {
    if (isFixed(g)) continue
    for (const skuId of selections[String(g.id)] ?? []) {
      const item = g.items.find((it) => it.id === skuId)
      sum += item?.priceFen ?? 0
    }
  }
  return sum
}

/** 已选 OPTIONAL 项名称顿号拼接 */
export function buildSelectedText(groups: PackageSkuGroup[], selections: PackageSkuSelections): string {
  const names: string[] = []
  for (const g of groups) {
    if (isFixed(g)) continue
    for (const skuId of selections[String(g.id)] ?? []) {
      const item = g.items.find((it) => it.id === skuId)
      if (item) names.push(item.name)
    }
  }
  return names.join('、')
}

/** 加价标签：「+¥X」（元，去尾零）；无加价返回空串 */
export function surchargeLabel(item: PackageSkuItem): string {
  const fen = item.priceFen ?? 0
  if (fen <= 0) return ''
  return `+¥${fen / 100}`
}
