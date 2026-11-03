import { assignColumns } from '../components/dd-waterfall/waterfall'

/**
 * dd-waterfall 列分配自检（assert 风格，无框架依赖）：
 * 1. 等高空位 → 左右交替（0,1 | 2,3 …）
 * 2. 末项跟「插入时更矮」的那列，不是按奇偶固定
 * 3. 每列内下标递增（数据顺序不被打散，只是分列）
 */

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`FAIL: ${msg}`)
  console.log(`ok: ${msg}`)
}

// 1) 等高 6 项 2 列 → 0,1 / 2,3 / 4,5
assert(
  JSON.stringify(assignColumns([100, 100, 100, 100, 100, 100], 2, 16)) ===
    JSON.stringify([0, 1, 0, 1, 0, 1]),
  '等高时左右交替（读序成对）',
)

// 2) 前 10 项让右列累计更矮，第 11 项必须进右列（而不是奇偶固定进左列）
//    （对应房态看板 11 间时「最后一张跟在较矮那列下面」的诉求）
const heights = [150, 120, 150, 110, 150, 130, 110, 110, 150, 300, 100]
const cols = assignColumns(heights, 2, 0)
assert(cols[10] === 1, '末项进更矮的右列')

// 3) 每列内下标递增
for (const col of [0, 1]) {
  const idx = cols.map((c, i) => (c === col ? i : -1)).filter((i) => i >= 0)
  assert(
    idx.every((v, i) => i === 0 || v > idx[i - 1]),
    `第 ${col + 1} 列下标递增`,
  )
}

// 4) 每一步都选当时累计最矮的列（与实现口径自洽）
const totals = [0, 0]
cols.forEach((col, i) => {
  const min = Math.min(...totals)
  assert(totals[col] === min, `第 ${i + 1} 项选中的列是当前最矮列`)
  totals[col] += heights[i]
})

console.log('waterfall-selfcheck passed')
