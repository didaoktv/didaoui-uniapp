// z-index 唯一真源自检（可运行校验，ADR 0013）
// 用法（PowerShell 两命令用 ; 分隔；bash 用 &&）：
//   npx tsc scripts/zindex-selfcheck.ts --module commonjs --target es2020 --lib es2020,dom --outDir .check --skipLibCheck ; node .check/zindex-selfcheck.js
// 断言：
//  1) libs/config/zIndex.js 键集恰为 10 档且值精确
//  2) 档序严格递增（base < sticky < overlay < popup < dialogMask < dialog < noNetwork < cropper < loading < toast）
//  3) components/**/*.vue 与 libs/**/*.{js,ts} 剥注释后无裸 z-index/zIndex 魔数；
//     残留 z-index: 仅允许 var(--dd-*) CSS 变量透传；模板禁止 :z-index 属性（白名单：无）
//  4) scss/ 无 $dd-z-index-* 残留（SCSS 变量已由 zIndex.js 取代）
//  5) dd-popup/dd-overlay/dd-popover/dd-cascader/dd-keyboard 源码不再含 zIndex prop 定义
// ponytail: 用 require shim 免引 @types/node；__dirname 仅 CommonJS 输出下有效
declare function require(id: string): any
declare const __dirname: string
declare const process: any

const fs: any = require('fs')
const path: any = require('path')

const ROOT = path.resolve(__dirname, '..')

let failed = 0
let checked = 0

function assert(cond: boolean, msg: string): void {
  checked++
  if (!cond) {
    failed++
    console.error('FAIL: ' + msg)
  }
}

// 剥三类注释：模板 HTML 注释、块注释、行注释（避免文档性数字干扰断言）
function stripComments(src: string): string {
  return src
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
}

// ---------- 1) 档位表键集恰 10 键、值精确 ----------
const EXPECTED: Record<string, number> = {
  base: 1,
  sticky: 100,
  overlay: 2000,
  popup: 2001,
  dialogMask: 2010,
  dialog: 2011,
  noNetwork: 2020,
  cropper: 2025,
  loading: 2030,
  toast: 2040,
}

const cfgSrc: string = stripComments(fs.readFileSync(path.join(ROOT, 'libs/config/zIndex.js'), 'utf8'))
const body: string = cfgSrc.slice(cfgSrc.indexOf('{'), cfgSrc.lastIndexOf('}') + 1)
const actualKeys: string[] = Array.from(body.matchAll(/([A-Za-z_]\w*)\s*:/g), (m) => m[1])
const expectedKeys = Object.keys(EXPECTED)

assert(
  actualKeys.length === expectedKeys.length && expectedKeys.every((k) => actualKeys.includes(k)),
  `zIndex.js 键集应恰为 ${expectedKeys.join('/')}，实际：${actualKeys.join('/') || '（空）'}`
)

function num(key: string): number {
  const m = cfgSrc.match(new RegExp('\\b' + key + '\\s*:\\s*(\\d+)'))
  assert(!!m, `zIndex.js 缺少 ${key} 定义`)
  return m ? Number(m[1]) : 0
}

const values: Record<string, number> = {}
for (const k of expectedKeys) values[k] = num(k)
for (const k of expectedKeys) {
  assert(values[k] === EXPECTED[k], `zIndex.js ${k} 应为 ${EXPECTED[k]}，实际 ${values[k]}`)
}

// ---------- 2) 档序严格递增 ----------
for (let i = 1; i < expectedKeys.length; i++) {
  const prev = expectedKeys[i - 1]
  const cur = expectedKeys[i]
  assert(
    values[cur] > values[prev],
    `档序应递增：${prev}(${values[prev]}) < ${cur}(${values[cur]})`
  )
}

// ---------- 3) 全库无裸 z-index/zIndex 魔数（components/ + libs/，白名单：无） ----------
function walk(dir: string, exts: string[], out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(p, exts, out)
    else if (exts.some((e) => entry.name.endsWith(e))) out.push(p)
  }
  return out
}

const scanFiles: string[] = [
  ...walk(path.join(ROOT, 'components'), ['.vue']),
  ...walk(path.join(ROOT, 'libs'), ['.js', '.ts']),
]
assert(scanFiles.length > 0, 'components/ 与 libs/ 下应存在可扫描文件')

for (const f of scanFiles) {
  const rel = path.relative(ROOT, f)
  const src = stripComments(fs.readFileSync(f, 'utf8'))
  // 3a) 模板禁止 :z-index 传参（弹层 prop 已删，防止复活）
  assert(!/:z-index\s*=/.test(src), `${rel} 含 :z-index 模板属性（prop 已删，统一走档位表）`)
  // 3b) CSS/SCSS 禁止裸 z-index 数字
  assert(!/z-index\s*:\s*-?\d/.test(src), `${rel} 含裸 z-index 数字（伪元素只准 var(--dd-*) 透传）`)
  // 3c) 残留 z-index: 值必须为 var(--dd-*) CSS 变量透传形式
  for (const m of src.matchAll(/z-index\s*:\s*([^;\n}]+)/g)) {
    assert(
      /^var\(--dd-/.test(m[1].trim()),
      `${rel} 的 z-index 值 "${m[1].trim()}" 必须为 var(--dd-*) 形式`
    )
  }
  // 3d) JS/TS 对象字面量禁止裸 zIndex 数字字面量
  assert(
    !/zIndex\s*:\s*-?\d/.test(src),
    `${rel} 含裸 zIndex 数字（只准 zIndexConfig.* 选档或档内 +1 派生）`
  )
}

// ---------- 4) scss/ 无 $dd-z-index 残留 ----------
for (const f of walk(path.join(ROOT, 'scss'), ['.scss'])) {
  const rel = path.relative(ROOT, f)
  assert(!/\$dd-z-index/.test(fs.readFileSync(f, 'utf8')), `${rel} 残留 $dd-z-index 变量（已由 zIndex.js 取代）`)
}

// ---------- 5) 五个弹层组件源码不再含 zIndex prop 定义 ----------
const noPropFiles = [
  'components/dd-popup/dd-popup.vue',
  'components/dd-overlay/dd-overlay.vue',
  'components/dd-popover/dd-popover.vue',
  'components/dd-cascader/dd-cascader.vue',
  'components/dd-keyboard/keyboard.js',
  'components/dd-keyboard/props.js',
]
for (const rel of noPropFiles) {
  const src = stripComments(fs.readFileSync(path.join(ROOT, rel), 'utf8'))
  assert(!/zIndex\?\s*:/.test(src), `${rel} 不得再声明 zIndex prop（TS 可选属性）`)
  assert(!/['"]?zIndex['"]?\s*:\s*\{/.test(src), `${rel} 不得再声明 zIndex prop（对象式 props）`)
  assert(!/zIndex\s*:\s*-?\d/.test(src), `${rel} 不得再含 zIndex 数字默认值`)
}

if (failed) {
  console.error(`zindex-selfcheck: ${failed}/${checked} FAILED`)
  process.exit(1)
}
console.log(`zindex-selfcheck: ${checked} checks OK（已扫描 ${scanFiles.length} 个 components/libs 文件）`)

// 转为 ES 模块：避免本文件的全局 declare 与其他 selfcheck 脚本在 vue-tsc 下撞名
export {}
