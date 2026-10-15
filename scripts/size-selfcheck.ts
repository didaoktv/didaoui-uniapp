// 控件高度档位自检（可运行校验）
// 用法：npx tsc scripts/size-selfcheck.ts --module commonjs --target es2020 --lib es2020 --outDir .check --skipLibCheck
//       然后 node .check/size-selfcheck.js
// 断言：
//  1) 范围组件（控件高度语义的 .vue）内 height/min-height/max-height 声明不得出现 rpx/px 魔数，
//     只允许 $dd-size-control-* 档位 token；内部件/列表项/弹层尺寸行以 `// size-exempt` 注释豁免
//  2) 旧尺寸 token（$dd-size-button* / $dd-size-input-height / $dd-input-height / $dd-button-height*）
//     在 components/、scss/、libs/ 与根 README/llms.txt/uni.scss/index.ts 零残留
//     （ponytail: 不扫 scripts/，本脚本自身含旧名清单）
//  3) 档位等式：_variables.scss sm/compact/md/lg = 64/72/88/100rpx，
//     且分别 = 设计真源 css.json size 块 32/36/44/50px × 2（1px=2rpx）
// 尺寸 token 不发射为 CSS 变量（编译期消费），故组件写裸 $dd-size-control-* 不违反 theme-selfcheck 断言 3。
// ponytail: 用 require shim 免引 @types/node；__dirname 仅 CommonJS 输出下有效
declare function require(id: string): any
declare const __dirname: string
declare const console: { log(...args: any[]): void; error(...args: any[]): void }

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

// ---------- 1) 范围组件控件高度零魔数 ----------
const SCOPE: string[] = [
  'components/dd-button/dd-button.vue',
  'components/dd-capsule-button/dd-capsule-button.vue',
  'components/dd-empty-state/dd-empty-state.vue',
  'components/dd-input/dd-input.vue',
  'components/dd-search-bar/dd-search-bar.vue',
  'components/dd-picker/dd-picker.vue',
  'components/dd-stepper/dd-stepper.vue',
  'components/dd-field/dd-field.vue',
]
// height/min-height/max-height 声明且值含 rpx/px 数字 → 魔数
const magicHeightRe = /^\s*(?:min-|max-)?height\s*:\s*[^;]*\d+(?:rpx|px)/

for (const rel of SCOPE) {
  const file = path.join(ROOT, rel)
  assert(fs.existsSync(file), `范围组件缺失: ${rel}`)
  if (!fs.existsSync(file)) continue
  const src: string = fs.readFileSync(file, 'utf8')
  let inStyle = false
  src.split('\n').forEach((line: string, i: number) => {
    if (/<style[\s>]/.test(line)) { inStyle = true; return }
    if (/<\/style>/.test(line)) { inStyle = false; return }
    if (!inStyle) return
    if (line.includes('size-exempt')) return
    assert(!magicHeightRe.test(line), `${rel}:${i + 1} 控件高度魔数（应消费 $dd-size-control-* 或加 size-exempt 豁免）: ${line.trim()}`)
  })
  // 每个档位消费方组件至少消费一个档位 token（防扫描失效/迁移漏改）
  // dd-picker 为纯弹层（无输入框形态触发器），只参与魔数扫描、不要求消费档位 token
  if (rel !== 'components/dd-picker/dd-picker.vue') {
    assert(/\$dd-size-control-(?:sm|compact|md|lg)\b/.test(src), `${rel} 未消费任何档位 token`)
  }
}

// ---------- 2) 旧尺寸 token 零残留 ----------
const OLD_TOKENS: string[] = ['$dd-size-button', '$dd-size-input-height', '$dd-input-height', '$dd-button-height']
function listFiles(dir: string, exts: string[]): string[] {
  const out: string[] = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...listFiles(p, exts))
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p)
  }
  return out
}
const scanTargets: string[] = []
for (const d of ['components', 'scss', 'libs']) {
  scanTargets.push(...listFiles(path.join(ROOT, d), ['.vue', '.scss', '.ts', '.js', '.css']))
}
for (const f of ['README.md', 'llms.txt', 'uni.scss', 'index.ts']) {
  const p = path.join(ROOT, f)
  if (fs.existsSync(p)) scanTargets.push(p)
}
for (const file of scanTargets) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/')
  const content: string = fs.readFileSync(file, 'utf8')
  for (const old of OLD_TOKENS) {
    const idx = content.indexOf(old)
    const lineNo = idx >= 0 ? content.slice(0, idx).split('\n').length : 0
    assert(idx === -1, `${rel}:${lineNo} 残留旧尺寸 token ${old}`)
  }
}

// ---------- 3) 档位等式 ----------
const varSrc: string = fs.readFileSync(path.join(ROOT, 'scss/_variables.scss'), 'utf8')
function scssVal(name: string): string | null {
  const m = varSrc.match(new RegExp('\\$dd-' + name + '\\s*:\\s*([^;!]+)!'))
  return m ? m[1].trim() : null
}
// [scss 档位名, css.json size 键, 期望 rpx, 设计源 px]
const TIERS: [string, string, number, number][] = [
  ['size-control-sm', 'size-button-sm', 64, 32],
  ['size-control-compact', 'size-control-compact', 72, 36],
  ['size-control-md', 'size-button-md', 88, 44],
  ['size-control-lg', 'size-button-lg', 100, 50],
]
for (const [name, , rpx] of TIERS) {
  const v = scssVal(name)
  assert(v === `${rpx}rpx`, `档位 $dd-${name} 应为 ${rpx}rpx，实际 ${v === null ? '未定义' : v}`)
}

const cssJsonPath = path.resolve(ROOT, '../.design_library/didao-ktv/css.json')
assert(fs.existsSync(cssJsonPath), `设计真源不存在: ${cssJsonPath}（应位于仓库同级的 ../.design_library/didao-ktv/css.json，检查目录布局）`)
if (fs.existsSync(cssJsonPath)) {
  const sizeBlock = JSON.parse(fs.readFileSync(cssJsonPath, 'utf8')).size
  assert(!!sizeBlock, 'css.json 缺少 size 块')
  for (const [, key, rpx, px] of TIERS) {
    assert(sizeBlock[key] === `${px}px`, `css.json size["${key}"] 应为 ${px}px，实际 ${sizeBlock[key]}`)
    assert(px * 2 === rpx, `换算等式 ${px}px × 2 = ${rpx}rpx 不成立`)
  }
}

if (failed === 0) {
  console.log(`size self-check: OK (${checked} assertions passed)`)
} else {
  throw new Error(`size self-check: ${failed} FAILURES`)
}

// 顶层全局名（fs/path/assert…）与 scripts/ 其他自检脚本冲突，声明为模块隔离作用域（对齐 zindex-selfcheck）
export {}
