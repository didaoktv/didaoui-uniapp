// 打 tag 发版后，把 ktv-system 三端的 @didaoktv/didaoui-uniapp 版本号对齐到本次发布版本。
// 用法：推完 tag 后立即 npm run bump:consumers（省略参数自动取最新 git tag；也可显式 npm run bump:consumers -- 1.3.4）。
// 脚本会先轮询等 npm 上出现该版本（即 CI 发布完成）再改依赖，锁文件才能解析成功。
// 注意：pnpm install --lockfile-only 需在用户终端执行（沙箱禁写 .pnpm-store），改完由人工在 ktv-system 提交。
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..')
const ktvRoot = join(repoRoot, '..', 'ktv-system')
const PKG = '@didaoktv/didaoui-uniapp'

// 版本号：参数优先，否则从最新 tag 推导（v1.3.4 -> 1.3.4）
let version = process.argv[2]
if (!version) {
  version = execSync('git describe --tags --abbrev=0', { cwd: repoRoot }).toString().trim().replace(/^v/, '')
}
if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) {
  console.error(`非法版本号: ${version}（应形如 1.3.4，不带 v 前缀）`)
  process.exit(1)
}

// 等 npm 上该版本可解析（CI 发布通常 1-3 分钟）
const npmHasVersion = () =>
  spawnSync('npm', ['view', `${PKG}@${version}`, 'version'], { shell: process.platform === 'win32' }).status === 0
if (!npmHasVersion()) {
  console.log(`npm 上还没有 ${version}，等待 CI 发布完成（最多 5 分钟）...`)
  const deadline = Date.now() + 5 * 60_000
  while (Date.now() < deadline && !npmHasVersion()) {
    await new Promise((r) => setTimeout(r, 10_000))
  }
  if (!npmHasVersion()) {
    console.error(`超时：npm 上仍查不到 ${version}，请确认 tag 已推送且 CI 发布成功后重跑本脚本`)
    process.exit(1)
  }
}

for (const app of ['uniapp-boss', 'uniapp-customer', 'uniapp-staff']) {
  const f = join(ktvRoot, 'apps', app, 'package.json')
  const pkg = JSON.parse(readFileSync(f, 'utf8'))
  pkg.dependencies[PKG] = `^${version}`
  writeFileSync(f, JSON.stringify(pkg, null, 2) + '\n')
  console.log(`${app}: ${PKG} -> ^${version}`)
}

// 同步 pnpm-lock.yaml（只更新锁文件，不真正装依赖）
execSync('pnpm install --lockfile-only', { cwd: ktvRoot, stdio: 'inherit' })
console.log('完成。请在 ktv-system 自行提交三端 package.json 与 pnpm-lock.yaml。')
