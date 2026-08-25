# @didaoktv/didaoui-uniapp

专为 KTV 场景打造的 UniApp 组件库。

## 特性

- **帝王级配色** — 帝王金 `#F5A623` + 皇家蓝 `#2D4BA0` 双主色，暗色主题默认
- **玻璃拟态设计** — 多层级玻璃拟态效果，打造高端夜店沉浸感
- **67 个精心打磨的组件** — 覆盖表单、导航、布局卡片、数据展示、浮层反馈、交互六大类，含 KTV 业务组件（房态卡、账单明细、工单卡、日历、二维码）
- **Vue3 + TypeScript** — 完整类型定义，Composition API
- **多端兼容** — H5 / 微信小程序 / 抖音小程序 / Android / iOS

## 安装

```bash
npm install @didaoktv/didaoui-uniapp
```

## 快速开始

### 全局引入

```ts
import { createSSRApp } from 'vue'
import App from './App.vue'
import DdktvUI from '@didaoktv/didaoui-uniapp'
import '@didaoktv/didaoui-uniapp/uni.scss'

export function createApp() {
  const app = createSSRApp(App)
  app.use(DdktvUI)
  return { app }
}
```

### 按需引入

```vue
<script setup lang="ts">
import { DdButton, DdInput } from '@didaoktv/didaoui-uniapp'
</script>

<template>
  <dd-button type="primary">预订包房</dd-button>
  <dd-input v-model="value" placeholder="请输入" />
</template>
```

## 组件分类

| 分类    | 数量 | 组件                                                                                                                                            |
| ----- | -- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 表单输入  | 17 | Button, Input, Form, Field, Switch, Checkbox, CheckboxGroup, Radio, RadioGroup, Stepper, SearchBar, Slider, DatePicker, Picker, Rate, Upload, Icon                             |
| 导航    | 12 | Navigation, TopNavbar, SwipeableTab, SegmentedTab, Drawer, Tabbar, TabbarItem, Backtop, Collapse, CollapseItem, DropdownMenu, DropdownItem    |
| 布局/卡片 | 8  | Card, RoomCard, FeatureGrid, Sticky, BillDetail, WorkorderCard, Calendar, Qrcode                                                              |
| 数据展示  | 16 | Tag, StatCard, ChampionCard, Avatar, Badge, ListCell, Cell, CellGroup, CountDown, Divider, Image, Progress, Skeleton, EmptyState, Step, Steps |
| 浮层反馈  | 10 | Modal, ActionSheet, Toast, Alert, Loading, Dialog, Overlay, Popup, Popover, PopoverItem                                                       |
| 交互    | 5  | SwipeAction, Swipe, SwipeItem, PullRefresh, Loadmore                                                                                         |
| 小程序专属 | 2  | CapsuleButton, MiniProgramNavbar                                                                                                              |

## 设计规范

### 色彩系统

- **帝王金** `#F5A623` — 主操作、强调、高光
- **皇家蓝** `#2D4BA0` — 辅助色、深色基底
- **星空黑** `#0A0A0A` — 页面底色
- 语义色: success `#4CAF50` / warning `#F9A825` / error `#E53935` / info `#00BCD4`

### 字体

- 主字体: 'Noto Sans SC', sans-serif
- 展示字体: 'Playfair Display', serif
- 等宽字体: 'JetBrains Mono', monospace
- 字号阶梯: 12 / 14 / 16 / 18 / 20 / 24 / 32 px

### 圆角

2 / 4 / 8 / 12 / 16 / 9999 px (Vant 对齐小圆角)

### 间距

4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px (8pt 基础网格)

### 主题与浅色模式（v1.3.0+）

默认主题为暗色（dark-first）。主题机制分三层，**新增任何主题都不需要改动组件**：

| 层 | 机制 | 适用场景 |
|----|------|---------|
| SCSS 编译期 | `_variables.scss` 全量 `!default`，消费者先声明变量再引入即可覆盖 | 整个 App 固定品牌换肤 |
| CSS 变量运行时 | 组件消费 `var(--dd-x, #{$dd-x})`，SCSS 值为兜底（不引入主题文件时与旧版渲染一致） | 明暗切换、多主题共存 |
| delta 级联 | `:root`/`page` 发射全量默认值（base 59 + 暗色 44），主题类只声明与默认不同的变量，未声明自动继承 | 快速配置新主题 |

**启用运行时主题**：在 `App.vue` 全局样式引入：

```scss
@import '@didaoktv/didaoui-uniapp/scss/theme';
```

**切换明暗**（默认暗色，`.light` 为 opt-in）：

```ts
// H5
document.documentElement.classList.toggle('light')
// 小程序：页面根节点挂类（自定义属性沿节点树继承进组件）
<view :class="isLight ? 'light' : 'dark'">…</view>
```

**明暗核心对照**（翻转 delta 共 44 个，完整清单见 `scss/_theme-tokens.scss`）：

| Token | Dark（默认） | Light |
|---|---|---|
| `--dd-bg` / `--dd-fg` | `#0A0A0A` / `#F5F5F5` | `#FAFAFA` / `#0A0A0A` |
| `--dd-surface` / `--dd-bg-card` | `#0A0A0A` / `#171717` | `#FFFFFF` |
| `--dd-border-default` / `--dd-rule` | `#2A2A2A` | `#BDBDBD` |
| `--dd-muted` | `#757575` | `#616161` |
| 品牌色 `--dd-primary` 等 | 不随明暗翻转 | 同暗色 |

**快速配置新主题**（两法互补）：

```scss
// 法一（编译期）：uni.scss 中一行换品牌色，全库（含 var 兜底值）生效
$dd-primary: #d32f2f;
@import '@didaoktv/didaoui-uniapp/scss/variables';

// 法二（运行时）：全局样式中声明 delta 类，页面根节点挂类即生效；可与 .light 并列
.cny-red {
  @include dd-theme((
    'primary': #d32f2f,
    'primary-contrast': #ffffff,
    'gradient-primary': linear-gradient(135deg, #f44336, #b71c1c),
  ));
}
```

注意事项：

- `$dd-primary-contrast`（金底文字）刻意**不随明暗翻转**（保持 `#0A0A0A`）：品牌金不翻转，白字在金底对比度不可用；品牌主题可覆盖。
- 少数 `rgba($dd-brand, a)` 包裹处（checkbox/switch/slider 各 1 处）为编译期值，不跟随运行时品牌换肤（明暗无碍）。
- nvue 不支持 CSS 变量，不在主题机制支持范围内。
- 自检：`npx tsc scripts/theme-selfcheck.ts --module commonjs --target es2020 --lib "es2020,dom" --outDir .check --skipLibCheck; node .check/theme-selfcheck.js`

## 新增业务组件（2026-08-22 纳入设计系统）

> 新组件统一以主流组件库（Vant 等）同名/同类组件为 API 设计基准，符合 uni-app 多端规范，只消费上层 `scss/_variables.scss` 既有 token。

| 组件 | 用途 | 参考基准 |
|------|------|---------|
| `dd-bill-detail` | 账单明细（商品项/小计/合计/支付状态/操作按钮 slot） | Vant `Card` + GoodsAction 聚合 |
| `dd-workorder-card` | 工单条目卡片（类型/状态/进度/布置 checklist/完成确认） | Vant `Card` + `Tag` + Checklist |
| `dd-calendar` | 月历 + 时段（日期多选区间/禁选/时段格） | Vant `Calendar` + 主流日历组件 |
| `dd-qrcode` | 二维码渲染（canvas，内容/尺寸/前景色/背景色/logo） | 主流二维码组件 API |

## License

[MIT](./LICENSE) © 帝到KTV
