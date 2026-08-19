# @didaoktv/uniapp-ui

> 帝到KTV UniApp 组件库 — 帝王金 · 皇家蓝 · 抖音商城风

专为 KTV 场景打造的 UniApp 组件库，采用帝王金与皇家蓝的高端配色方案，融合抖音商城级别的交互质感。

## 特性

- **帝王级配色** — 帝王金 `#F5A623` + 皇家蓝 `#2D4BA0` 双主色，暗色主题默认
- **玻璃拟态设计** — 多层级玻璃拟态效果，打造高端夜店沉浸感
- **61 个精心打磨的组件** — 覆盖表单、导航、布局、数据展示、浮层反馈、交互六大类
- **Vue3 + TypeScript** — 完整类型定义，Composition API
- **多端兼容** — H5 / 微信小程序 / 抖音小程序 / Android / iOS

## 安装

```bash
npm install @didaoktv/uniapp-ui
```

## 快速开始

### 全局引入

```ts
import { createSSRApp } from 'vue'
import App from './App.vue'
import DdktvUI from '@didaoktv/uniapp-ui'
import '@didaoktv/uniapp-ui/uni.scss'

export function createApp() {
  const app = createSSRApp(App)
  app.use(DdktvUI)
  return { app }
}
```

### 按需引入

```vue
<script setup lang="ts">
import { DdButton, DdInput } from '@didaoktv/uniapp-ui'
</script>

<template>
  <dd-button type="primary">预订包房</dd-button>
  <dd-input v-model="value" placeholder="请输入" />
</template>
```

## 组件分类

| 分类 | 数量 | 组件 |
|------|------|------|
| 表单输入 | 13 | Button, Input, Field, Switch, Checkbox, Radio, Stepper, SearchBar, Slider, DatePicker, Picker, Rate, Upload |
| 导航 | 12 | Navigation, TopNavbar, SwipeableTab, SegmentedTab, Drawer, Tabbar, TabbarItem, Backtop, Collapse, CollapseItem, DropdownMenu, DropdownItem |
| 布局 | 4 | Card, RoomCard, FeatureGrid, Sticky |
| 数据展示 | 16 | Tag, StatCard, ChampionCard, Avatar, Badge, ListCell, Cell, CellGroup, CountDown, Divider, Image, Progress, Skeleton, EmptyState, Step, Steps |
| 浮层反馈 | 11 | Modal, ActionSheet, Toast, Alert, Loading, Dialog, Overlay, Popup, Popover, PopoverItem, SwipeAction |
| 交互 | 3 | Swipe, SwipeItem, PullRefresh |
| 小程序专属 | 2 | CapsuleButton, MiniProgramNavbar |

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

## License

[MIT](./LICENSE) &copy; 帝到KTV
