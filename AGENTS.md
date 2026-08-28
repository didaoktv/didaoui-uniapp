# AGENTS.md — DidaoUI-uniapp 组件库编码守则

> 适用：本组件库仓库。消费方（ktv-system 三端 UniApp 应用）的 UI 使用规则见 [`ktv-system/packages/uniapp-shared/AGENTS.md`](../ktv-system/packages/uniapp-shared/AGENTS.md)。npm 包名 `@didaoktv/didaoui-uniapp`。

## 技术栈与形态

- Vue3 Composition API + TS + SCSS，多端（H5 / 微信小程序 / 抖音小程序 / App）。
- **源码直发包**：`main` 直接指向 `index.ts`，无构建产物；消费方用自己的编译链编译本库的 Vue/SCSS。因此禁止引入需要构建的依赖，`devDependencies` 保持最小。
- 组件互引只走相对路径 `../dd-xxx/dd-xxx.vue`；对外统一从 `index.ts` 导出。

## 目录与组件规范

- 每组件一个目录：`components/dd-<名>/dd-<名>.vue`；复杂逻辑拆 `props.js` / `<名>.js`，表单类组件可带 `rules.ts`。
- 组件名 `dd-` 前缀 kebab-case，导出名 PascalCase（`DdButton`）；新增组件必须登记进 `index.ts`（按现有分类注释归组）并同步 `README.md` 组件表。
- Props 用 `defineProps<Props>()` + `withDefaults`，事件用带类型的 `defineEmits`；通用兜底 prop：`customStyle` / `customClass` 思路对齐 Vant / uview-plus。
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
/* 头部固定引入；只消费 $dd-* token，写 var(--dd-x, #{$dd-x}) 兜底形式 */
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-demo {
  padding: var(--dd-space-4, #{$dd-space-4});
  border-radius: var(--dd-radius-lg, #{$dd-radius-lg});
  background: var(--dd-primary, #{$dd-primary});
  color: var(--dd-primary-contrast, #{$dd-primary-contrast});
  &--sm { padding: var(--dd-space-2, #{$dd-space-2}); }
}
</style>
```

## 样式与主题（硬性基准）

- 只消费 `scss/_variables.scss` 的 `$dd-*` token（全量 `!default`），**禁止硬编码色值/间距/圆角**；已知例外仅两处：qrcode 前景/背景（可扫描性）、1px 发丝线。
- 组件样式统一写 `var(--dd-x, #{$dd-x})` 形式（CSS 变量运行时可换肤，SCSS 值兜底）；组件 `<style scoped>` 头部 `@import '../../scss/variables'` + `'../../scss/mixins'`。
- 三层主题：SCSS 编译期覆盖（消费者先声明变量再引入）→ CSS 变量运行时 → `scss/theme.scss` 发射 `:root`/`page` 默认值，`.dark`/`.light` 类只声明 delta（定义于 `_theme-tokens.scss`）。**新增主题 = 纯 delta 覆盖，零组件改动**；改主题 token 或组件消费后必须跑 `scripts/theme-selfcheck.ts`（组件消费 ⊆ 发射、明暗翻转等断言）。
- 新算法/纯逻辑类改动跑对应自检：`scripts/qr-selfcheck.ts`、`scripts/form-selfcheck.ts`；自检脚本保持 assert 风格、无框架依赖。

## 多端约束

- 平台差异用条件编译（`#ifdef`），不写运行时平台嗅探；API 一律 `uni.*`，不用 `window`/`document`（H5 专属逻辑必须包在条件编译内）。
- 尺寸单位 rpx；z-index 统一取 `libs/config/zIndex.js`，不手写魔数。
- 小程序端注意：模板内不能用复杂表达式、组件需在消费方 `easycom` 或全局注册可用（路径即 `components/dd-x/dd-x.vue`）。

## 校验与发布

- 提交前 `npm run type-check`（vue-tsc），必须零错误。
- **发布只走 GitHub Actions**：推送 `v*` tag 自动对齐版本号并发布；**禁止手动 `npm publish`**（npm 不允许同版本重复发布，手动先行会弄炸 CI 发布）。
- `prepublishOnly` 会校验 `publishConfig.access === public`，勿移除。
- 发布流程/Secrets/注意事项 → [`../ktv-system/docs/平行项目/DidaoUI-uniapp发布流程.md`](../ktv-system/docs/平行项目/DidaoUI-uniapp发布流程.md)

## 指针

- 文档站与可视化调试：`../DidaoUI-uniapp-docs`（`npm run dev:h5` 起 h5-demo，vite alias 指向本库源码）；新组件/新 demo 在该仓库补页面。
- 设计 token 数据源：`.design_library/didao-ktv/css.json`；组件承接性/补齐决策见 [`../ktv-system/docs/调研报告/DidaoUI组件承接性评估-20260822.md`](../ktv-system/docs/调研报告/DidaoUI组件承接性评估-20260822.md)
