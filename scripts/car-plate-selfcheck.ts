// dd-car-keyboard 车牌键盘纯逻辑自检（可运行校验）
// 用法：npx tsc scripts/car-plate-selfcheck.ts components/dd-car-keyboard/carPlate.js --module commonjs --target es2019 --outDir .check --skipLibCheck --allowJs
//       然后 node .check/scripts/car-plate-selfcheck.js
// 断言 getKeyRows/getLockedKeys/nextPos 的不变量：省份键盘、按位锁键（参考 car-number-input 锁键表）、新能源位变体、光标推进。
import { MAX_LEN, getKeyRows, getLockedKeys, nextPos } from '../components/dd-car-keyboard/carPlate'

let failed = 0

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    failed++
    console.error('FAIL: ' + msg)
  }
}

declare const process: any

function labels(rows: { label: string; locked: boolean }[][]): string[] {
  return rows.flatMap((r) => r.map((k) => k.label))
}

function rowLabels(row: { label: string; locked: boolean }[]): string[] {
  return row.map((k) => k.label)
}

function lockedLabels(rows: { label: string; locked: boolean }[][]): string[] {
  return rows.flatMap((r) => r.filter((k) => k.locked).map((k) => k.label))
}

function main(): void {
  assert(MAX_LEN === 8, '车牌长度应为 8（7 位普通 + 1 位新能源）')

  // === pos 0：省份键盘，无锁键 ===
  const province = getKeyRows(0)
  assert(province.length === 4, '省份键盘应为 4 行')
  assert(lockedLabels(province).length === 0, '省份键盘不应有锁键')
  assert(labels(province).includes('京') && labels(province).includes('澳'), '省份键盘应含 京/澳')
  assert(!labels(province).includes('W'), '省份键盘不应含字母 W（参考实现笔误已修正）')

  // === pos 1：第二位必须字母（数字与特殊字锁定，O/I 允许——对齐参考实现） ===
  const pos1 = getKeyRows(1)
  assert(lockedLabels(pos1).includes('1'), 'pos1 应锁数字 1')
  assert(lockedLabels(pos1).includes('0'), 'pos1 应锁数字 0')
  assert(lockedLabels(pos1).includes('挂') && lockedLabels(pos1).includes('警'), 'pos1 应锁特殊字')
  assert(!lockedLabels(pos1).includes('A') && !lockedLabels(pos1).includes('O'), 'pos1 不应锁字母')

  // === pos 2-5/7：禁 O 与特殊字，数字可用；「学」不在布局中（仅新能源位变体出现） ===
  for (const pos of [2, 3, 4, 5, 7]) {
    const rows = getKeyRows(pos)
    const locked = lockedLabels(rows)
    assert(locked.includes('O') && locked.includes('挂'), `pos${pos} 应锁 O/挂`)
    assert(!labels(rows).includes('学'), `pos${pos} 布局中不应出现「学」`)
    assert(!locked.includes('1') && !locked.includes('A'), `pos${pos} 不应锁数字/普通字母`)
  }

  // === pos 6（新能源位）：O 从布局移除，行 2 为 ENERGY 变体（含 学/挂）；警/港/澳 可用 ===
  const pos6 = getKeyRows(6)
  assert(!labels(pos6).includes('O'), 'pos6 布局中不应出现 O')
  assert(pos6.every((row) => !row.some((k) => k.locked)), 'pos6 不应有任何锁键（O 已移除、特殊字全放行）')
  const pos6Row2 = rowLabels(pos6[1])
  assert(pos6Row2.includes('学') && pos6Row2.includes('挂'), 'pos6 行 2 应为新能源变体')
  assert(getLockedKeys(6).length === 1 && getLockedKeys(6)[0] === 'O', 'getLockedKeys(6) 应仅含 O（防御布局漏移除 O）')

  // === nextPos：填完第 7 位收起键盘（-1），新能源位不自动进入 ===
  assert(nextPos(0) === 1 && nextPos(5) === 6, '光标应逐位推进')
  assert(nextPos(6) === -1, '填完第 7 位应收起键盘')
  assert(nextPos(7) === -1, '第 8 位输入后应收起键盘')

  if (failed > 0) {
    console.error(`\n${failed} 项断言失败`)
    process.exit(1)
  }
  console.log('car-plate-selfcheck: all assertions passed')
}

main()
