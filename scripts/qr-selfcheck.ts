// QR 编码器自检（可运行校验）
// 用法：npx tsc libs/utils.ts scripts/qr-selfcheck.ts --module commonjs --target es2019 --outDir .check --skipLibCheck
//       然后 node .check/scripts/qr-selfcheck.js
// 断言 QR 矩阵的结构不变量：方形/版本尺寸、三个定位符、时序线、深色模块、确定性、输入相关性。
import { generateQR } from '../libs/utils'

let failed = 0

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    failed++
    console.error('FAIL: ' + msg)
  }
}

// 单个定位符 7×7 期望形态
const FINDER: boolean[][] = [
  [true, true, true, true, true, true, true],
  [true, false, false, false, false, false, true],
  [true, false, true, true, true, false, true],
  [true, false, true, true, true, false, true],
  [true, false, true, true, true, false, true],
  [true, false, false, false, false, false, true],
  [true, true, true, true, true, true, true],
]

function checkFinder(modules: boolean[][], size: number): void {
  const corners: Array<[number, number]> = [
    [0, 0],
    [0, size - 7],
    [size - 7, 0],
  ]
  for (const [r0, c0] of corners) {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const expect = FINDER[y][x]
        const got = modules[r0 + y][c0 + x]
        assert(got === expect, `finder corner (${r0},${c0}) mismatch at (${r0 + y},${c0 + x})`)
      }
    }
  }
}

function checkTiming(modules: boolean[][], size: number): void {
  for (let i = 8; i <= size - 9; i++) {
    const rowExpect = i % 2 === 0
    const colExpect = i % 2 === 0
    assert(modules[6][i] === rowExpect, `timing row at col ${i} dark=${modules[6][i]}`)
    assert(modules[i][6] === colExpect, `timing col at row ${i} dark=${modules[i][6]}`)
  }
}

function checkDarkModule(modules: boolean[][], size: number): void {
  assert(modules[8][size - 8] === true, `dark module at (8,${size - 8}) should be dark`)
}

const VALID_SIZES = new Set(Array.from({ length: 40 }, (_, i) => 21 + i * 4))

function check(text: string, ecc: 'L' | 'M' | 'Q' | 'H'): boolean[][] {
  const qr = generateQR(text, ecc)
  assert(VALID_SIZES.has(qr.size), `size ${qr.size} invalid for version`)
  assert(qr.modules.length === qr.size && qr.modules.every((r) => r.length === qr.size), 'matrix must be square')
  checkFinder(qr.modules, qr.size)
  checkTiming(qr.modules, qr.size)
  checkDarkModule(qr.modules, qr.size)
  return qr.modules
}

const inputs = ['HELLO WORLD', 'https://m.didaoktv.com/member/1288', '会员码:1234567890', '收款¥128.00 KTV-01']
for (const ecc of ['L', 'M', 'Q', 'H'] as const) {
  for (const s of inputs) check(s, ecc)
}

// 确定性：同样输入两次必须完全一致
const a = generateQR('DETERMINISM', 'M')
const b = generateQR('DETERMINISM', 'M')
assert(JSON.stringify(a.modules) === JSON.stringify(b.modules), 'same input must produce identical matrix')

// 输入相关性：不同内容必须不同
const c = generateQR('AAAA', 'M')
const d = generateQR('BBBB', 'M')
assert(JSON.stringify(c.modules) !== JSON.stringify(d.modules), 'different input must produce different matrix')

// 短码为 version1（尺寸 21），长码版本更大
const short = generateQR('hi', 'L')
const long = generateQR('a'.repeat(80), 'L')
assert(short.size === 21, 'tiny input should be version-1 (size 21), got ' + short.size)
assert(long.size > short.size, 'long input should use larger version')

if (failed === 0) {
  console.log('QR self-check: OK (all ' + (inputs.length * 4 + 4) + ' assertions passed)')
} else {
  throw new Error('QR self-check: ' + failed + ' FAILURES')
}