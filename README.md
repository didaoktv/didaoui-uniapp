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
