/**
 * 瀑布流列分配（纯逻辑，便于自检）：按数据顺序逐项塞进当前累计高度最小的列。
 * 返回每个数据项所在列号（下标 = 数据下标）。
 * 读数顺序保持数据顺序；列内参差由各自堆叠吸收。
 */
export function assignColumns(heights: number[], columnCount: number, gap = 0): number[] {
  const cols = Math.max(1, Math.floor(columnCount) || 1)
  const totals = Array.from({ length: cols }, () => 0)
  return heights.map((h) => {
    let target = 0
    for (let c = 1; c < cols; c++) {
      if (totals[c] < totals[target]) target = c
    }
    totals[target] += h + gap
    return target
  })
}
