# AGENTS.md — DidaoUI-uniapp 组件库编码守则

> 适用：本组件库仓库。消费方（ktv-system 两端 UniApp 应用）的 UI 使用规则见 [`ktv-system/packages/uniapp-shared/AGENTS.md`](../ktv-system/packages/uniapp-shared/AGENTS.md)。npm 包名 `@didaoktv/didaoui-uniapp`。

## 技术栈与形态

- Vue3 Composition API + TS + SCSS，多端（H5 / 微信小程序 / 抖音小程序 / App）。
- **源码直发包**：`main` 直接指向 `index.ts`，无构建产物；消费方用自己的编译链编译本库的 Vue/SCSS。因此禁止引入需要构建的依赖，`devDependencies` 保持最小。
- 组件互引只走相对路径 `../dd-xxx/dd-xxx.vue`；对外统一从 `index.ts` 导出。

## 目录与组件规范

- 每组件一个目录：`components/dd-<名>/dd-<名>.vue`；纯逻辑拆 `<名>.js` / `<名>.ts`，表单类组件可带 `rules.ts`。**禁止新增 `props.js`**（Options API 时代遗留；存量组件在收尾迁移）。
- 组件名 `dd-` 前缀 kebab-case，导出名 PascalCase（`DdButton`）；新增组件必须登记进 `index.ts`（按现有分类注释归组）。
- **增减组件必须同步五处**：`index.ts`（注册+导出）、`llms.txt` 索引与计数、文档站 `../DidaoUI-uniapp-docs/components/<slug>.md`、h5-demo（`../DidaoUI-uniapp-docs/h5-demo/src/pages/<slug>/demo.vue` + `h5-demo/src/pages.json` 路由 + `h5-demo/src/home-registry.ts` 首页/侧边栏登记）、`README.md`（**仅业务组件**表，通用组件不列表）。完成后跑 `../DidaoUI-uniapp-docs/scripts/check-md.mjs`（md↔demo 1:1 配平自检）+ 本库 `npm run type-check`。
- **新增组件首度可用（发版）时**：在 h5-demo 首页 `../DidaoUI-uniapp-docs/h5-demo/src/pages/index/demo.vue` 该组件条目登记引入版本 `ver: 'vX.Y.Z'`（= 本次发版 tag 数字，如 `v1.4.3`），用于首页展示引入版本徽标。
- Props 用 `defineProps<Props>()` + `withDefaults`，事件用带类型的 `defineEmits`。
- 通用兜底 prop `customStyle` / `customClass`（主流组件库通用思路）：
  - **必须提供**（容器/布局/浮层/固定条，位置与边距由消费方决定，共 25 个）：`dd-card`、`dd-cell`、`dd-cell-group`、`dd-list-cell`、`dd-feature-grid`、`dd-waterfall`、`dd-sticky`、`dd-form`、`dd-collapse`、`dd-sidebar`、`dd-popup`、`dd-drawer`、`dd-dialog`、`dd-modal`、`dd-action-sheet`、`dd-popover`、`dd-overlay`、`dd-submit-bar`、`dd-cart-bar`、`dd-tabbar`、`dd-top-navbar`、`dd-navigation`、`dd-search-bar`、`dd-goods-card`、`dd-room-card`。
  - 其余组件（含插槽型微组件 tag / badge / divider / price / text / icon 等）按需提供，不作硬性要求。
- 模板类名走 BEM：`dd-tag` / `dd-tag__label` / `dd-tag--primary`，修饰符状态类挂根节点。
- 跨组件共享的工具/混入放 `libs/`（`mixin/` / `function/` / `config/`）；不为单组件造 `libs/` 工具。

新组件骨架基准：

```vue
<!-- components/dd-demo/dd-demo.vue -->
<template>
  <view class="dd-demo" :class="[`dd-demo--${size}`]" @click="onClick">
    <text class="dd-demo__label"><slot /></text>
  </view>
</template>

<script setup lang="ts">
// Props 类型化 + withDefaults；事件带类型（对齐库内 dd-tag / dd-button 写法）
interface Props {
  size?: 'sm' | 'md'
  disabled?: boolean
}
const props = withDefaults(defineProps<Props>(), { size: 'md', disabled: false })

const emit = defineEmits<{ (e: 'click', val: Event): void }>()

function onClick(e: Event) {
  if (props.disabled) return
  emit('click', e)
}
</script>

<style lang="scss" scoped>
/* 头部固定两行 import；颜色/背景/阴影走 var()，几何 token 直接 $dd-* */
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-demo {
  padding: $dd-space-4;
  border-radius: $dd-radius-lg;
  background: var(--dd-primary, #{$dd-primary});
  color: var(--dd-primary-contrast, #{$dd-primary-contrast});
  &--sm { padding: $dd-space-2; }
}
</style>
```

## 样式与主题（硬性基准）

- 只消费 `scss/_variables.scss` 的 `$dd-*` token（全量 `!default`），**禁止硬编码色值/间距/圆角**；已知例外三处：qrcode 前景/背景（可扫描性）、1px 发丝线、画布像素尺寸（barcode/poster 的 10000px 遮罩、cropper/canvas 的导出像素）。
- 颜色/背景/渐变/阴影/边框类 token **必须**写 `var(--dd-x, #{$dd-x})`（CSS 变量运行时可换肤，SCSS 值兜底）；纯几何 token（间距/圆角/字号/线宽）允许直接写 `$dd-x`（无换肤收益，加 var 只是噪音）。
- 组件 `<style scoped>` 头部固定两行 `@import '../../scss/variables'` + `'../../scss/mixins'`；**禁止 `@import '../../scss/dd-shared'`**（旧 uview 工具类会在每个 scoped 块里重复发射）。
- 三层主题：SCSS 编译期覆盖（消费者先声明变量再引入）→ CSS 变量运行时 → `scss/theme.scss` 发射 `:root`/`page` 默认值，`.dark`/`.light` 类只声明 delta（定义于 `_theme-tokens.scss`）。**新增主题 = 纯 delta 覆盖，零组件改动**；改主题 token 或组件消费后必须跑 `scripts/theme-selfcheck.ts`（组件消费 ⊆ 发射、明暗翻转等断言）。
- 新算法/纯逻辑类改动跑对应自检：`scripts/qr-selfcheck.ts`、`scripts/form-selfcheck.ts`；自检脚本保持 assert 风格、无框架依赖。

## 多端约束

- 平台差异用条件编译（`#ifdef`），不写运行时平台嗅探；API 一律 `uni.*`，不用 `window`/`document`（H5 专属逻辑必须包在条件编译内）。
- 尺寸单位：字号/间距/圆角一律 rpx（1px=2rpx）；能对上 `$dd-*` 阶梯的必须用 token，阶梯外的组件特有几何值才写 rpx 字面量。px 仅限上文白名单例外（发丝线、画布像素、blur/text-shadow 等视觉效果）。z-index 统一取 `libs/config/zIndex.js`，不手写魔数。档位表即唯一真源（ADR 0013）：组件只准选档或档内 +1 派生，改动后跑 `scripts/zindex-selfcheck.ts`。
- 小程序端注意：模板内不能用复杂表达式、组件需在消费方 `easycom` 或全局注册可用（路径即 `components/dd-x/dd-x.vue`）。

## 校验与发布

- 提交前 `npm run type-check`（vue-tsc），必须零错误。
- 自检脚本统一命令（**必须带 `--lib "es2020,dom"`**，否则 `console` 报 TS2584；多个脚本一次编译时产物落在 `.check/scripts/<名>.js`）：

```bash
npx tsc scripts/theme-selfcheck.ts --module commonjs --target es2020 --lib "es2020,dom" --outDir .check --skipLibCheck && node .check/theme-selfcheck.js
```

  同法替换为 `zindex-selfcheck` / `form-selfcheck` / `qr-selfcheck` / `car-plate-selfcheck` / `size-selfcheck` / `package-sku-selfcheck`。
- **发布只走 GitHub Actions**：推送 `v*` tag 自动对齐版本号并发布；**禁止手动 `npm publish`**（npm 不允许同版本重复发布，手动先行会弄炸 CI 发布）。
- **package.json version 与最新发版 tag 同步**：每次打 `v*` tag 发版时，把 `package.json` 的 `version` 同步改为该 tag 对应数字（如 v1.4.0 → `"version": "1.4.0"`）；CI 发布时会以 tag 为准覆写，仓库内同步仅为保持源码可读。
- `prepublishOnly` 会校验 `publishConfig.access === public`，勿移除。
- 发布流程/Secrets/注意事项 → [`../ktv-system/docs/平行项目/DidaoUI-uniapp发布流程.md`](../ktv-system/docs/平行项目/DidaoUI-uniapp发布流程.md)

## 指针

- Agent 快速索引：[`llms.txt`](./llms.txt)（llmstxt.org 约定；101 个组件清单、关键 API、易混组件选型速查）。新增/删除组件时同步该文件对应条目。
- 文档站与可视化调试：`../DidaoUI-uniapp-docs`（`npm run dev:h5` 起 h5-demo，vite alias 指向本库源码）；新组件/新 demo 在该仓库补页面。
- 设计 token 数据源：`.design_library/didao-ktv/css.json`；组件承接性/补齐决策见 [`../ktv-system/docs/调研报告/DidaoUI组件承接性评估-20260822.md`](../ktv-system/docs/调研报告/DidaoUI组件承接性评估-20260822.md)
