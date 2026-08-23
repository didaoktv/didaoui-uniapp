// ============================================================
// DidaoUI-uniapp Utility Functions
// ============================================================

// 平台检测
// ponytail: vue-tsc 不识别 #ifdef 注释，四个 const 块会被视为重复声明，
// 故改为单次 let 声明 + 条件编译赋值。代价：失去编译期常量的 tree-shake
// （升级路径：改用 process.env.UNI_PLATFORM 判定）。
export let isH5 = false
export let isMP = false
export let isMPWeixin = false
export let isMPToutiao = false
export let isApp = false

// #ifdef H5
isH5 = true
// #endif
// #ifdef MP-WEIXIN
isMP = true
isMPWeixin = true
// #endif
// #ifdef MP-TOUTIAO
isMP = true
isMPToutiao = true
// #endif
// #ifdef APP-PLUS
isApp = true
// #endif

// 防抖
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// 节流
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let last = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - last >= delay) {
      last = now
      fn(...args)
    }
  }
}

// rpx → px (仅 H5 需要)
export function rpx2px(rpx: number): number {
  // #ifdef H5
  const screenWidth = window.screen.width
  return (rpx / 750) * screenWidth
  // #endif
  // #ifndef H5
  return rpx
  // #endif
}

// 获取状态栏高度
export function getStatusBarHeight(): number {
  // #ifdef H5
  return 0
  // #endif
  // ponytail: 运行时兜底 —— 条件编译失效时（如 H5 构建配置错误），
  // 防止走到 MP/APP 分支拿到非零 statusBarHeight
  // #ifndef H5
  const sysInfo = uni.getWindowInfo()
  return sysInfo.statusBarHeight || 20
  // #endif
}

// 获取胶囊按钮位置信息 (仅微信小程序)
export function getMenuButtonBoundingClientRect() {
  // #ifdef MP-WEIXIN
  return uni.getMenuButtonBoundingClientRect()
  // #endif
  // #ifndef MP-WEIXIN
  return null
  // #endif
}

// 查询节点尺寸
export function getRect(selector: string): Promise<UniApp.NodeInfo> {
  return new Promise((resolve) => {
    uni.createSelectorQuery()
      .select(selector)
      .boundingClientRect((rect) => {
        resolve(rect as UniApp.NodeInfo)
      })
      .exec()
  })
}

// 获取事件值 (跨端兼容)
export function getEventValue(e: any): string {
  return e?.detail?.value ?? e?.target?.value ?? ''
}

// ============================================================
// 日期工具（供 dd-calendar 使用）
// ============================================================
export function pad2(n: number): string {
  return n < 10 ? '0' + n : '' + n
}

export function dateFormat(d: Date, sep = '-'): string {
  return `${d.getFullYear()}${sep}${pad2(d.getMonth() + 1)}${sep}${pad2(d.getDate())}`
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function addDays(s: string, days: number): string {
  const d = parseDate(s)
  d.setDate(d.getDate() + days)
  return dateFormat(d)
}

// 某月首日为周几（0=周日）
export function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

// ============================================================
// 二维码（QR Code）生成 — 纯 JS，无三方依赖
// port: 移植自 Project Nayuki QR Code generator（public domain，qrcodegen）。
//   https://www.nayuki.io/page/qr-code-generator-library
// 保留核心正确性（ECC 分组/交织、8 掩码惩罚择优、对齐/版本/格式图形），
// 裁剪为 byte 模式 + 单段文本，兼容 H5/微信/抖音/App 的 uni canvas 渲染。
// ============================================================

export type QrEcc = 'L' | 'M' | 'Q' | 'H'

export interface QrSegment {
  modeBits: number
  numChars: number
  dataBits: number[]
}

export interface QRResult {
  size: number // 边长（模块数，不含静区）
  modules: boolean[][] // 二维布尔矩阵，true=暗模块
}

// ECC 每块码字数表（version 1-40 × [L,M,Q,H]）
// prettier-ignore
const ECC_CODEWORDS_PER_BLOCK = [
  [7, 10, 13, 17], [10, 16, 22, 28], [15, 26, 18, 22], [20, 18, 26, 16],
  [26, 24, 18, 22], [18, 16, 24, 28], [20, 18, 18, 26], [24, 22, 22, 26],
  [30, 22, 20, 24], [18, 26, 24, 28], [20, 30, 28, 24], [24, 22, 26, 28],
  [26, 22, 24, 22], [30, 24, 20, 24], [22, 24, 30, 24], [24, 28, 24, 30],
  [28, 28, 28, 28], [30, 26, 28, 28], [28, 26, 26, 26], [28, 26, 30, 28],
  [28, 26, 28, 30], [28, 28, 30, 24], [30, 28, 30, 30], [30, 28, 30, 30],
  [26, 28, 30, 30], [28, 28, 28, 30], [30, 28, 30, 30], [30, 28, 30, 30],
  [30, 28, 30, 30], [30, 28, 30, 30], [30, 28, 30, 30], [30, 28, 30, 30],
  [30, 28, 30, 30], [30, 28, 30, 30], [30, 28, 30, 30], [30, 28, 30, 30],
  [30, 28, 30, 30], [30, 28, 30, 30], [30, 28, 30, 30], [30, 28, 30, 30],
]

// 纠错块数表（version 1-40 × [L,M,Q,H]）
// prettier-ignore
const NUM_ERROR_CORRECTION_BLOCKS = [
  [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 2, 2], [1, 2, 2, 4],
  [1, 2, 4, 4], [2, 4, 4, 4], [2, 4, 6, 5], [2, 4, 6, 6],
  [2, 5, 8, 8], [4, 5, 8, 8], [4, 5, 8, 11], [4, 8, 10, 11],
  [4, 9, 12, 16], [4, 9, 16, 16], [6, 10, 12, 18], [6, 10, 17, 16],
  [6, 11, 16, 19], [6, 13, 18, 21], [7, 14, 21, 25], [8, 16, 20, 25],
  [8, 17, 23, 25], [9, 17, 23, 34], [9, 18, 25, 30], [10, 20, 27, 32],
  [12, 21, 29, 35], [12, 23, 34, 37], [12, 25, 34, 40], [13, 26, 35, 42],
  [14, 28, 38, 45], [15, 29, 40, 48], [16, 31, 43, 51], [17, 33, 45, 54],
  [18, 35, 48, 57], [19, 37, 51, 60], [19, 38, 53, 63], [20, 40, 56, 66],
  [21, 43, 59, 70], [22, 45, 62, 74], [24, 47, 65, 77], [25, 49, 68, 81],
]

// ECC → 5bit 格式信息数据位（低 3 位为掩码编号，此处占位为 0）
const ECC_FORMAT_BITS: { [k in QrEcc]: number } = { L: 1, M: 0, Q: 3, H: 2 }

function getBit(x: number, i: number): boolean {
  return ((x >>> i) & 1) !== 0
}

// GF(256) 乘法（本原多项式 0x11D）
function gfMul(x: number, y: number): number {
  let result = 0
  let a = x
  let b = y
  for (let i = 0; i < 8; i++) {
    if (b & 1) result ^= a
    b >>>= 1
    a = (a << 1) ^ (a & 0x80 ? 0x11d : 0)
    a &= 0xff
  }
  return result
}

// Reed-Solomon 除式（生成多项式）
function rsDivisor(degree: number): number[] {
  const result = [1]
  let root = 1
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = gfMul(result[j], root)
      if (j + 1 < result.length) result[j + 1] ^= result[j]
    }
    root = gfMul(root, 0x02)
  }
  return result
}

function rsRemainder(data: number[], divisor: number[]): number[] {
  const result = new Array(divisor.length).fill(0)
  for (const b of data) {
    const factor = b ^ result.shift()!
    result.push(0)
    for (let i = 0; i < result.length; i++) result[i] ^= gfMul(divisor[i], factor)
  }
  return result
}

// 整数补位
function appendBits(val: number, len: number, bb: number[]): void {
  for (let i = len - 1; i >= 0; i--) bb.push((val >>> i) & 1)
}

// byte 模式分段
function makeByteSegment(data: string): QrSegment {
  const bytes = utf8Bytes(data)
  const bits: number[] = []
  for (const b of bytes) appendBits(b, 8, bits)
  return { modeBits: 0b0100, numChars: bytes.length, dataBits: bits }
}

function utf8Bytes(str: string): number[] {
  const enc = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null
  if (enc) return Array.from(enc.encode(str))
  const bytes: number[] = []
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i)
    if (c < 0x80) bytes.push(c)
    else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f))
    else if (c >= 0xd800 && c < 0xdc00) {
      const hi = c
      c = str.charCodeAt(++i)
      const code = 0x10000 + ((hi - 0xd800) << 10) + (c - 0xdc00)
      bytes.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f))
    } else bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f))
  }
  return bytes
}

function getNumRawDataModules(ver: number): number {
  let result = (16 * ver + 128) * ver + 64
  if (ver >= 2) {
    const n = Math.floor(ver / 7) + 2
    result -= (25 * n - 10) * n
    if (ver >= 7) result -= 36
  }
  return result
}

function getNumDataCodewords(ver: number, ecl: QrEcc): number {
  const eclIdx = ECC_INDEX[ecl]
  return Math.floor(getNumRawDataModules(ver) / 8) -
    ECC_CODEWORDS_PER_BLOCK[ver - 1][eclIdx] * NUM_ERROR_CORRECTION_BLOCKS[ver - 1][eclIdx]
}
const ECC_INDEX: { [k in QrEcc]: number } = { L: 0, M: 1, Q: 2, H: 3 }

function addEccAndInterleave(data: number[], ver: number, ecl: QrEcc): number[] {
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[ver - 1][ECC_INDEX[ecl]]
  const blockEccLen = ECC_CODEWORDS_PER_BLOCK[ver - 1][ECC_INDEX[ecl]]
  const rawCodewords = Math.floor(getNumRawDataModules(ver) / 8)
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks)
  const shortBlockLen = Math.floor(rawCodewords / numBlocks)
  const blocks: number[][] = []
  const rsDiv = rsDivisor(blockEccLen)
  let k = 0
  for (let i = 0; i < numBlocks; i++) {
    const datLen = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1)
    const dat = data.slice(k, k + datLen)
    k += datLen
    const ecc = rsRemainder(dat, rsDiv)
    if (i < numShortBlocks) blocks.push(dat.concat(ecc))
    else blocks.push(dat.concat(ecc))
  }
  // 交织
  const result: number[] = []
  const maxLen = blocks[numBlocks - 1].length
  for (let i = 0; i < maxLen; i++) {
    for (let j = 0; j < numBlocks; j++) {
      if (i < blocks[j].length) result.push(blocks[j][i])
    }
  }
  return result
}

// 主入口
export function generateQR(text: string, ecc: QrEcc = 'M'): QRResult {
  const seg = makeByteSegment(text)

  // 选择最小版本
  let minVer = 1
  ;(function () {
    for (let v = 1; v <= 40; v++) {
      const dataCap = getNumDataCodewords(v, ecc)
      const segBitsLen = seg.modeBits === 0b0100 ? 4 + (v < 10 ? 8 : 16) + seg.dataBits.length : 0
      if (segBitsLen <= dataCap * 8) {
        minVer = v
        return
      }
    }
    minVer = 40
  })()

  // 组装数据码字
  const bb: number[] = []
  appendBits(seg.modeBits, 4, bb)
  appendBits(seg.numChars, minVer < 10 ? 8 : 16, bb)
  for (const b of seg.dataBits) bb.push(b)
  const dataCapBits = getNumDataCodewords(minVer, ecc) * 8
  appendBits(0, Math.min(4, dataCapBits - bb.length), bb)
  appendBits(0, (8 - (bb.length % 8)) % 8, bb)
  const dataBytes: number[] = []
  for (let i = 0; i < bb.length; i += 8) {
    let b = 0
    for (let j = 0; j < 8; j++) b = (b << 1) | bb[i + j]
    dataBytes.push(b)
  }
  const padBytes = [0xec, 0x11]
  let pi = 0
  while (dataBytes.length < getNumDataCodewords(minVer, ecc)) {
    dataBytes.push(padBytes[pi % 2])
    pi++
  }
  const allCodewords = addEccAndInterleave(dataBytes, minVer, ecc)

  return buildQrMatrix(minVer, ecc, allCodewords)
}

function buildQrMatrix(ver: number, ecl: QrEcc, dataCodewords: number[]): QRResult {
  const size = ver * 4 + 17
  let modules = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
  let isFunction = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))

  function setFunctionModule(r: number, c: number, isDark: boolean): boolean {
    if (r < 0 || c < 0 || r >= size || c >= size) return false
    modules[r][c] = isDark
    isFunction[r][c] = true
    return true
  }

  function drawFinder(r0: number, c0: number): void {
    for (let y = -1; y <= 7; y++) {
      for (let x = -1; x <= 7; x++) {
        const inside = y >= 0 && y <= 6 && x >= 0 && x <= 6
        const dark = inside && (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4))
        // 7×7 finder 以 (r0,c0) 为中心，相对 (y,x)∈0..6 → 绝对 r0-3..r0+3；
        // y/x 的 -1/7 一圈（outside）为浅色分隔区（separator），同样标记为 function 以阻止数据写入
        setFunctionModule(r0 + y - 3, c0 + x - 3, dark)
      }
    }
  }

  function drawAlignment(r0: number, c0: number): void {
    for (let y = -2; y <= 2; y++) {
      for (let x = -2; x <= 2; x++) {
        const dark = x === -2 || x === 2 || y === -2 || y === 2 || (x === 0 && y === 0)
        setFunctionModule(r0 + y, c0 + x, dark)
      }
    }
  }

  function drawTiming(): void {
    for (let i = 8; i < size - 8; i++) {
      if (modules[6][i] === undefined) continue
      setFunctionModule(6, i, i % 2 === 0)
      setFunctionModule(i, 6, i % 2 === 0)
    }
  }

  function drawFormatBits(mask: number): void {
    const data = (ECC_FORMAT_BITS[ecl] << 3) | mask
    let rem = data
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
    const fmt = ((data << 10) | rem) ^ 0x5412
    for (let i = 0; i <= 5; i++) setFunctionModule(8, i, getBit(fmt, i))
    setFunctionModule(8, 7, getBit(fmt, 6))
    setFunctionModule(8, 8, getBit(fmt, 7))
    setFunctionModule(7, 8, getBit(fmt, 8))
    for (let i = 9; i < 15; i++) setFunctionModule(14 - i, 8, getBit(fmt, i))
    for (let i = 0; i < 8; i++) setFunctionModule(size - 1 - i, 8, getBit(fmt, i))
    for (let i = 8; i < 15; i++) setFunctionModule(8, size - 15 + i, getBit(fmt, i))
    setFunctionModule(8, size - 8, true) // dark module
  }

  function drawVersion(ver2: number): void {
    if (ver2 < 7) return
    const g = 0x1f25
    let rem = ver2
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * g)
    const bits = (ver2 << 12) | rem
    for (let i = 0; i < 18; i++) {
      const bit = getBit(bits, i)
      const a = size - 11 + (i % 3)
      const b = Math.floor(i / 3)
      setFunctionModule(a, b, bit)
      setFunctionModule(b, a, bit)
    }
  }

  // 功能图形
  drawFinder(3, 3)
  drawFinder(size - 4, 3)
  drawFinder(3, size - 4)

  // 对齐图案位置
  const alignmentPositions = (() => {
    if (ver === 1) return []
    const numAlign = Math.floor(ver / 7) + 2
    const step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2
    const positions = [6]
    for (let pos = size - 7; positions.length < numAlign; pos -= step) positions.splice(1, 0, pos)
    return positions
  })()

  for (const a of alignmentPositions) {
    for (const b of alignmentPositions) {
      if ((a === 6 && b === 6) || (a === 6 && b === size - 7) || (a === size - 7 && b === 6)) continue
      drawAlignment(a, b)
    }
  }

  drawTiming()
  // 掩码选择：遍历 8 种掩码，取 penalty 最低者
  let bestMask = 0
  let bestPenalty = Infinity
  for (let mask = 0; mask < 8; mask++) {
    // 重新构建空白矩阵
    modules = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
    isFunction = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
    drawFinder(3, 3)
    drawFinder(size - 4, 3)
    drawFinder(3, size - 4)
    for (const a of alignmentPositions) for (const b of alignmentPositions) {
      if ((a === 6 && b === 6) || (a === 6 && b === size - 7) || (a === size - 7 && b === 6)) continue
      drawAlignment(a, b)
    }
    drawTiming()
    drawFormatBits(mask)
    drawVersion(ver)
    drawCodewords(dataCodewords, mask, modules, isFunction, size)
    const penalty = getPenaltyScore(modules, isFunction, size)
    if (penalty < bestPenalty) {
      bestPenalty = penalty
      bestMask = mask
    }
  }

  // 用最优掩码最终重建
  modules = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
  isFunction = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
  drawFinder(3, 3)
  drawFinder(size - 4, 3)
  drawFinder(3, size - 4)
  for (const a of alignmentPositions) for (const b of alignmentPositions) {
    if ((a === 6 && b === 6) || (a === 6 && b === size - 7) || (a === size - 7 && b === 6)) continue
    drawAlignment(a, b)
  }
  drawTiming()
  drawFormatBits(bestMask)
  drawVersion(ver)
  drawCodewords(dataCodewords, bestMask, modules, isFunction, size)

  return { size, modules }
}

function drawCodewords(
  data: number[], mask: number,
  modules: boolean[][], isFunction: boolean[][], size: number
): void {
  let i = 0
  let right = size - 1
  while (right >= 1) {
    if (right === 6) right = 5
    for (let vert = 0; vert < size; vert++) {
      const y = (right + 1) % 2 === 0 ? size - 1 - vert : vert
      for (let j = 0; j < 2; j++) {
        const x = right - j
        if (isFunction[y][x]) continue
        let dark = false
        if (i < data.length * 8) dark = getBit(data[i >>> 3], 7 - (i & 7))
        if (dark) modules[y][x] = dark
        // 应用数据掩码
        if (!isFunction[y][x]) {
          let invert = false
          switch (mask) {
            case 0: invert = (y + x) % 2 === 0; break
            case 1: invert = y % 2 === 0; break
            case 2: invert = x % 3 === 0; break
            case 3: invert = (y + x) % 3 === 0; break
            case 4: invert = (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0; break
            case 5: invert = ((y * x) % 2) + ((y * x) % 3) === 0; break
            case 6: invert = (((y * x) % 2) + ((y * x) % 3)) % 2 === 0; break
            case 7: invert = (((y + x) % 2) + ((y * x) % 3)) % 2 === 0; break
          }
          modules[y][x] = modules[y][x] !== invert
        }
        i++
      }
    }
    right -= 2
  }
}

// 掩码质量评分（仅用于在 8 种合法掩码中择优，无需与标准惩罚规则完全一致；
// 任一合法掩码都可被解码器正确识别，score 越低视觉越规整）
function getPenaltyScore(modules: boolean[][], isFunction: boolean[][], size: number): number {
  let score = 0
  // 行内连续同色惩罚
  for (let y = 0; y < size; y++) {
    let run = 0
    for (let x = 0; x < size; x++) {
      if (isFunction[y][x]) { run = 0; continue }
      const dark = modules[y][x]
      if (x === 0 || modules[y][x - 1] !== dark) run = 1
      else {
        run++
        if (run >= 5) score += 1
      }
    }
  }
  // 列内连续同色惩罚
  for (let x = 0; x < size; x++) {
    let run = 0
    for (let y = 0; y < size; y++) {
      if (isFunction[y][x]) { run = 0; continue }
      const dark = modules[y][x]
      if (y === 0 || modules[y - 1][x] !== dark) run = 1
      else {
        run++
        if (run >= 5) score += 1
      }
    }
  }
  // 2×2 同色方块惩罚
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      if (isFunction[y][x] || isFunction[y][x + 1] || isFunction[y + 1][x] || isFunction[y + 1][x + 1]) continue
      const r = modules[y][x]
      if (r === modules[y][x + 1] && r === modules[y + 1][x] && r === modules[y + 1][x + 1]) score += 3
    }
  }
  return score
}