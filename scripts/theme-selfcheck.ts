// 主题机制自检（可运行校验）
// 用法：npx tsc scripts/theme-selfcheck.ts --module commonjs --target es2020 --lib es2020 --outDir .check --skipLibCheck
//       然后 node .check/theme-selfcheck.js
// 断言：
//  1) theme.scss 编译通过
//  2) 产物结构：:root/page = base(59) ∪ dark(44)；.dark/.light 键集一致且恰为 44 翻转 delta；
//     明暗核心值确实翻转（bg/fg/surface/border-default/muted），品牌色不翻转
//  3) 组件源码无变量全集内 token 的裸引用（必须 var(--dd-x, #{$dd-x}) 形态；
//     rgba($dd-x) 编译期包裹为已知豁免——见下方 ponytail）
//  4) 编译后组件消费的每个 --dd-* 都在 theme.scss 产物中有定义（消费 ⊆ 发射）
//  5) _variables.scss 每条声明以 !default 结尾
//  6) 组件中不再存在 $dd-{brand}-500 直引（vip-500 仅允许作为 #{$dd-vip-500} 兜底出现）
// ponytail: 用 require shim 免引 @types/node；__dirname 仅 CommonJS 输出下有效
declare function require(id: string): any
declare const __dirname: string

const fs: any = require('fs')
const path: any = require('path')
const sass: any = require('sass')

const ROOT = path.resolve(__dirname, '..')
const COMP = path.join(ROOT, 'components')

let failed = 0
let checked = 0

function assert(cond: boolean, msg: string): void {
  checked++
  if (!cond) {
    failed++
    console.error('FAIL: ' + msg)
  }
}

// ---------- 1+2) 编译 theme.scss 并解析产物 ----------
const themeCss: string = sass.compileString("@import 'scss/theme';", {
  loadPaths: [ROOT],
  logger: sass.Logger.silent,
}).css

// 提取选择器块内的 --dd-* 声明
function varsOf(selector: string): Map<string, string> {
  const re = new RegExp(selector + '\\s*\\{([\\s\\S]*?)\\}', 'g')
  const out = new Map<string, string>()
  for (const m of themeCss.matchAll(re)) {
    for (const d of m[1].matchAll(/--dd-([a-z0-9-]+)\s*:\s*([^;]+);/g)) out.set(d[1], d[2].trim())
  }
  return out
}

const rootVars = varsOf(':root')
const pageVars = varsOf('page')
const darkVars = varsOf('\\.dark')
const lightVars = varsOf('\\.light')

assert(rootVars.size === 103, `:root 应发射 103 个变量（base 59 + dark 44），实际 ${rootVars.size}`)
assert(pageVars.size === 103, `page 应发射 103 个变量，实际 ${pageVars.size}`)
assert(darkVars.size === 44, `.dark 应恰为 44 个翻转 delta，实际 ${darkVars.size}`)
assert(lightVars.size === 44, `.light 应恰为 44 个翻转 delta，实际 ${lightVars.size}`)

const darkKeys = [...darkVars.keys()].sort()
const lightKeys = [...lightVars.keys()].sort()
assert(JSON.stringify(darkKeys) === JSON.stringify(lightKeys), '.dark 与 .light 键集必须一致')

// :root ⊇ dark（且 dark 键值一致）
for (const [k, v] of darkVars) {
  assert(rootVars.has(k), `:root 缺少翻转变量 --dd-${k}`)
  assert(rootVars.get(k) === v, `:root 与 .dark 的 --dd-${k} 值不一致`)
}
// base = :root − dark，恰 59 个
const baseKeys = [...rootVars.keys()].filter((k) => !darkVars.has(k))
assert(baseKeys.length === 59, `base 集应为 59 个，实际 ${baseKeys.length}`)

// 明暗核心值确实翻转（暗色为默认值）
assert(darkVars.get('bg') === '#0A0A0A', `.dark --dd-bg 应为 #0A0A0A，实际 ${darkVars.get('bg')}`)
assert(lightVars.get('bg') === '#FAFAFA', `.light --dd-bg 应为 #FAFAFA，实际 ${lightVars.get('bg')}`)
assert(lightVars.get('fg') === '#0A0A0A', `.light --dd-fg 应为 #0A0A0A，实际 ${lightVars.get('fg')}`)
assert(lightVars.get('surface') === '#FFFFFF', `.light --dd-surface 应为 #FFFFFF，实际 ${lightVars.get('surface')}`)
assert(lightVars.get('border-default') !== darkVars.get('border-default'), 'border-default 明暗必须不同')
assert(lightVars.get('muted') !== darkVars.get('muted'), 'muted 明暗必须不同')
assert(lightVars.get('primary') === darkVars.get('primary'), '品牌色 primary 明暗不翻转')

// ---------- 3+4) 组件扫描 ----------
function listVueFiles(dir: string): string[] {
  const out: string[] = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...listVueFiles(p))
    else if (e.name.endsWith('.vue')) out.push(p)
  }
  return out
}

const emitted = new Set<string>([...rootVars.keys()])
const consumed = new Set<string>()
const localAssigned = new Set<string>() // 组件私有 --dd-*（--dd-loading-color 等，非主题变量）
// 组件私有且「只消费不赋值」的公开定制变量（消费者可覆盖；新增时在此登记）
const KNOWN_LOCAL = new Set(['overlay-duration', 'popup-duration'])
const bareRefs: string[] = []
const x500Refs: string[] = []
const wrapRe = /\$dd-([a-z0-9-]+)/g

for (const file of listVueFiles(COMP)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/')
  const src = fs.readFileSync(file, 'utf8')
  let inStyle = false
  src.split('\n').forEach((line: string, i: number) => {
    if (/<style[\s>]/.test(line)) { inStyle = true; return }
    if (/<\/style>/.test(line)) { inStyle = false; return }
    if (!inStyle) return
    // 切掉行尾注释（"//" 且非 "://"）
    const cm = line.match(/(^|[^:])\/\//)
    const cut = cm ? line.indexOf(cm[0]) + cm[0].length - 2 : -1
    const code = cut >= 0 ? line.slice(0, cut) : line
    // 组件私有变量赋值（--dd-loading-color: ...）
    for (const m of code.matchAll(/--dd-([a-z0-9-]+)\s*:/g)) localAssigned.add(m[1])
    // 裸引用：变量全集内 token 出现且不在 #{} 兜底里
    // ponytail: rgba($dd-x) 编译期包裹是已知豁免——var() 无法进 rgba() 旧语法，
    // 品牌色明暗不翻转故浅色无碍；代价是不跟随运行时品牌换肤（升级路径：ColorMix/相对色或停靠点变量）
    const isRgbaLine = /rgba\(\s*\$dd-/.test(code)
    for (const m of code.matchAll(wrapRe)) {
      const name = m[1]
      const isFallback = code.slice(Math.max(0, m.index - 2), m.index) === '#{'
      if (!isFallback && !isRgbaLine && emitted.has(name)) bareRefs.push(`${rel}:${i + 1}: $dd-${name}`)
    }
    // X-500 直引（vip-500 仅允许 #{$dd-vip-500} 兜底）
    for (const m of code.matchAll(/\$dd-(primary|accent|success|warning|error|info|vip)-500\b/g)) {
      const isFallback = code.slice(Math.max(0, m.index - 2), m.index) === '#{'
      if (!(isFallback && m[0] === '$dd-vip-500')) x500Refs.push(`${rel}:${i + 1}: ${m[0]}`)
    }
  })

  // 编译后收集消费的变量名（含 mixin 动态拼名的产物）
  const blocks = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m: any) => m[1])
  if (!blocks.length) continue
  const content = blocks.join('\n').replace(/@import '\.\.\/\.\.\/scss\//g, "@import 'scss/")
  const css = sass.compileString(content, {
    loadPaths: [ROOT],
    logger: sass.Logger.silent,
  }).css
  for (const m of css.matchAll(/var\(--dd-([a-z0-9-]+)/g)) consumed.add(m[1])
}

assert(bareRefs.length === 0, `组件存在变量全集内 token 裸引用 ${bareRefs.length} 处:\n${bareRefs.join('\n')}`)
assert(x500Refs.length === 0, `组件存在 X-500 直引 ${x500Refs.length} 处:\n${x500Refs.join('\n')}`)

const unconsumed = [...consumed].filter((v) => !emitted.has(v) && !localAssigned.has(v) && !KNOWN_LOCAL.has(v))
assert(unconsumed.length === 0, `组件消费了未发射且非组件私有的变量: ${unconsumed.join(', ')}`)
assert(consumed.size > 50, `消费变量数异常偏少（${consumed.size}），扫描可能失效`)

// ---------- 5) _variables.scss 全量 !default ----------
const varLines = fs
  .readFileSync(path.join(ROOT, 'scss/_variables.scss'), 'utf8')
  .split('\n')
  .map((l: string, i: number) => ({ l, i: i + 1 }))
  .filter(({ l }: { l: string }) => /^\s*\$dd-[a-z0-9-]+\s*:/.test(l))
const noDefault = varLines.filter(({ l }: { l: string }) => !/!\s*default\s*;/.test(l))
assert(varLines.length > 250, `_variables.scss 声明数异常（${varLines.length}）`)
assert(noDefault.length === 0, `缺 !default 的声明 ${noDefault.length} 条:\n${noDefault.map((x: any) => `line ${x.i}: ${x.l.trim()}`).join('\n')}`)

// ---------- 6) 编译期覆盖链路：消费者先声明 $dd-primary 再引入库 ----------
const overrideCss: string = sass.compileString("$dd-primary: #d32f2f;\n@import 'scss/theme';", {
  loadPaths: [ROOT],
  logger: sass.Logger.silent,
}).css
assert(overrideCss.includes('--dd-primary: #d32f2f'), '编译期覆盖链路失效：theme.scss 产物未采用消费者覆盖值')

// 组件层：var() 兜底也必须是覆盖后的值
const btnSrc = fs.readFileSync(path.join(COMP, 'dd-button', 'dd-button.vue'), 'utf8')
const btnStyle = btnSrc.match(/<style[^>]*>([\s\S]*?)<\/style>/)![1].replace(/@import '\.\.\/\.\.\/scss\//g, "@import 'scss/")
const btnCss: string = sass.compileString("$dd-primary: #d32f2f;\n" + btnStyle, {
  loadPaths: [ROOT],
  logger: sass.Logger.silent,
}).css
assert(btnCss.includes('var(--dd-primary, #d32f2f)'), 'dd-button 的 var() 兜底未采用编译期覆盖值')

if (failed === 0) {
  console.log(`theme self-check: OK (${checked} assertions passed, ${consumed.size} vars consumed)`)
} else {
  throw new Error(`theme self-check: ${failed} FAILURES`)
}
