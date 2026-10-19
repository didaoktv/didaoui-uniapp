// dd-package-sku 纯逻辑自检（可运行校验）
// 用法：npx tsc components/dd-package-sku/package-sku.ts scripts/package-sku-selfcheck.ts --module commonjs --target es2019 --outDir .check --skipLibCheck
//       然后 node .check/scripts/package-sku-selfcheck.js
// 断言：置灰判定、N选M 文案、min/max 校验、加价合计、options/摘要构建。
import {
  type PackageSkuGroup,
  type PackageSkuSelections,
  isItemDisabled,
  groupHint,
  isGroupSatisfied,
  canConfirm,
  unmetText,
  buildOptions,
  computeSurchargeFen,
  buildSelectedText,
  surchargeLabel,
} from '../components/dd-package-sku/package-sku'

let failed = 0

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    failed++
    console.error('FAIL: ' + msg)
  }
}

function main(): void {
  const fixedGroup: PackageSkuGroup = {
    id: 'g1', name: '果盘', groupType: 'FIXED',
    items: [{ id: 'i1', name: '西瓜拼盘' }],
  }
  const optGroup: PackageSkuGroup = {
    id: 'g2', name: '饮料', minSel: 1, maxSel: 1,
    items: [
      { id: 'a', name: '可乐', priceFen: 0, qty: 5, enabled: true },
      { id: 'b', name: '啤酒', priceFen: 1000, qty: 0, enabled: true },
      { id: 'c', name: '果汁', priceFen: 50, enabled: false },
    ],
  }
  const groups = [fixedGroup, optGroup]

  // === 置灰判定 ===
  assert(isItemDisabled(optGroup.items[0]) === false, 'qty>0 且 enabled 应可选')
  assert(isItemDisabled(optGroup.items[1]) === true, 'qty=0 应置灰')
  assert(isItemDisabled(optGroup.items[2]) === true, 'enabled=false 应置灰')
  assert(isItemDisabled({ id: 'x', name: 'x' }) === false, 'qty/enabled 缺省应可选')

  // === 加价标签 ===
  assert(surchargeLabel(optGroup.items[0]) === '', '0 加价无标签')
  assert(surchargeLabel(optGroup.items[1]) === '+¥10', '1000 分 = +¥10')
  assert(surchargeLabel(optGroup.items[2]) === '+¥0.5', '50 分 = +¥0.5')

  // === N选M 文案 ===
  assert(groupHint(fixedGroup) === '', 'FIXED 组无文案')
  assert(groupHint(optGroup) === '3选1', 'min=max 输出 N选M')
  assert(groupHint({ id: 'g', name: 'g', minSel: 1, maxSel: 2, items: [{ id: '1', name: '1' }, { id: '2', name: '2' }, { id: '3', name: '3' }] }) === '选1~2项', 'min<max 输出区间')
  assert(groupHint({ id: 'g', name: 'g', items: [{ id: '1', name: '1' }] }) === '最多选1项', 'min 缺省 0 输出上限')

  // === min/max 校验 ===
  const empty: PackageSkuSelections = {}
  const one: PackageSkuSelections = { g2: ['a'] }
  const two: PackageSkuSelections = { g2: ['a', 'b'] }
  assert(isGroupSatisfied(optGroup, empty) === false, 'minSel=1 未选不满足')
  assert(isGroupSatisfied(optGroup, one) === true, 'minSel=1 选 1 满足')
  assert(isGroupSatisfied(fixedGroup, empty) === true, 'FIXED 恒满足')
  assert(canConfirm(groups, empty) === false, '含未选满组不可确认')
  assert(canConfirm(groups, one) === true, '选满可确认')
  assert(unmetText(groups, empty) === '「饮料」还需选择 1 项', '未满足提示文案')
  assert(unmetText(groups, one) === '', '全部满足提示为空')

  // === options / 加价合计 / 摘要 ===
  assert(
    JSON.stringify(buildOptions(groups, one)) === JSON.stringify([{ groupId: 'g2', skuId: 'a' }]),
    'options 形状 [{groupId,skuId}] 且不含 FIXED'
  )
  assert(computeSurchargeFen(groups, one) === 0, '选可乐加价 0')
  assert(computeSurchargeFen(groups, { g2: ['b'] }) === 1000, '选啤酒加价 1000 分')
  assert(buildSelectedText(groups, { g2: ['a', 'b'] }) === '可乐、啤酒', '摘要顿号拼接（上限点击拦截，此处仅测合计）')
  assert(computeSurchargeFen(groups, two) === 1000, '两项合计 1000 分')

  if (failed > 0) {
    throw new Error(`${failed} assertion(s) failed`)
  }
  console.log('package-sku self-check: all assertions passed')
}

main()
