<template>
  <view class="dd-order-list" :class="customClass" :style="customStyle">
    <view
      v-for="item in orders"
      :key="item.id"
      class="dd-order-list__card"
      :class="{ 'dd-order-list__card--on': isPicked(item.id) }"
      @click="onCardTap(item)"
    >
      <!-- 选择器：卡片最左侧，垂直居中（不占内容行） -->
      <view
        v-if="checkable"
        class="dd-order-list__check"
        :class="{ 'dd-order-list__check--on': isPicked(item.id) }"
      >
        <dd-icon :name="isPicked(item.id) ? 'success' : 'circle'" />
      </view>

      <view class="dd-order-list__body">
        <!-- 第一行：订单号 + 收款状态 -->
        <view class="dd-order-list__header">
          <text class="dd-order-list__title">{{ item.title }}</text>
          <text v-if="item.statusText" class="dd-order-list__status">{{ item.statusText }}</text>
        </view>

        <!-- 第二行：商品卡片横向滚动（竖向超小号）+ 右侧总价与件数（渐变蒙版压在最右侧） -->
        <view class="dd-order-list__goods">
          <scroll-view scroll-x :show-scrollbar="false" class="dd-order-list__goods-scroll">
            <view class="dd-order-list__goods-track">
              <view v-for="line in item.lines" :key="line.id" class="dd-order-list__goods-cell">
                <dd-goods-card
                  layout="vertical"
                  size="xs"
                  :thumb="line.thumb || ''"
                  :title="line.name"
                  :price="line.priceFen / 100"
                  :num="lineQty(line)"
                  :hoverable="false"
                />
              </view>
            </view>
          </scroll-view>
          <view class="dd-order-list__amount">
            <dd-price :rate="item.totalFen / 100" />
            <text class="dd-order-list__amount-count">共 {{ totalCount(item) }} 件</text>
          </view>
        </view>

        <view class="dd-order-list__bill-container">
          <!-- 第三行：账单信息（账单号/备注等，由消费方拼好文案） -->
          <view v-if="item.remark" class="dd-order-list__bill">
            <dd-icon name="notes-o" class="dd-order-list__bill-icon" />
            <text class="dd-order-list__bill-text">{{ item.remark }}</text>
          </view>

          <!-- 第四行：时间 -->
          <text v-if="item.timeText" class="dd-order-list__time">{{ item.timeText }}</text>
        </view>
      </view>
    </view>

    <slot v-if="orders.length === 0" name="empty"></slot>
  </view>
</template>

<script setup lang="ts">
import DdIcon from '../dd-icon/dd-icon.vue'
import DdPrice from '../dd-price/dd-price.vue'
import DdGoodsCard from '../dd-goods-card/dd-goods-card.vue'
import type { DdOrderItem, DdOrderLine } from './order-list'

interface Props {
  /** 订单列表（受控数据） */
  orders: DdOrderItem[]
  /** 已选订单 id 集合（v-model:selected，checkable 时生效） */
  selected?: (string | number)[]
  /** 是否显示多选（点卡片切换选中） */
  checkable?: boolean
  customStyle?: string
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  selected: () => [],
  checkable: true,
  customStyle: '',
  customClass: '',
})

const emit = defineEmits<{
  (e: 'update:selected', ids: (string | number)[]): void
  (e: 'item-click', item: DdOrderItem): void
}>()

function isPicked(id: string | number): boolean {
  return props.selected.includes(id)
}

function totalCount(item: DdOrderItem): number {
  return item.lines.reduce((sum, l) => sum + l.qty, 0)
}

/** 单件不用标数量（×1 是噪音），与外卖订单卡一致 */
function lineQty(line: DdOrderLine): number | string {
  return line.qty > 1 ? line.qty : ''
}

function onCardTap(item: DdOrderItem): void {
  emit('item-click', item)
  if (!props.checkable) return
  const next = isPicked(item.id)
    ? props.selected.filter((id) => id !== item.id)
    : [...props.selected, item.id]
  emit('update:selected', next)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-order-list__card {
  display: flex;
  align-items: center;
  padding: $dd-space-3;
  margin-bottom: $dd-space-2;
  background: var(--dd-bg-card, #{$dd-bg-card});
  border: 2rpx solid transparent;
  border-radius: $dd-radius-lg;

  // 选中态：主色描边（多选反馈与底部合计联动）
  &--on {
    border-color: var(--dd-primary, #{$dd-primary});
  }
}

// 内容列：撑满选择器右侧剩余宽度
.dd-order-list__body {
  flex: 1;
  min-width: 0;
}

.dd-order-list__header {
  display: flex;
  align-items: center;
}

.dd-order-list__check {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  margin-right: $dd-space-3;
  color: var(--dd-text-tertiary, #{$dd-text-tertiary});
  font-size: 40rpx;

  &--on {
    overflow: hidden;
    background: var(--dd-primary, #{$dd-primary});
    border-radius: 50%;
    color: $dd-color-white;
    font-size: 28rpx;
  }
}

.dd-order-list__title {
  flex: 1;
  overflow: hidden;
  min-width: 0;
  font-weight: 600;
  color: var(--dd-text-primary, #{$dd-text-primary});
  font-size: $dd-font-size-body;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dd-order-list__status {
  flex-shrink: 0;
  margin-left: $dd-space-2;
  color: var(--dd-warning, #{$dd-warning});
  font-size: $dd-font-size-caption;
  font-weight: 600;
}

// 商品行：横向滚动（不换行），总价块绝对定位压在最右侧、与商品卡等高，左侧渐变蒙版让卡片从下方滑过
.dd-order-list__goods {
  position: relative;
  margin-top: $dd-space-3;
}

.dd-order-list__goods-scroll {
  width: 100%;
  white-space: nowrap;
  // 隐藏滚动条、保留横向滚动：H5/App-vue 走 CSS，小程序默认不显，App-nvue 由 show-scrollbar=false 兜底
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
}

.dd-order-list__goods-track {
  display: inline-flex;
  align-items: flex-start;
  // ponytail: 尾部留白 = 蒙版宽度，保证最后一张卡能滚出蒙版；蒙版改宽这里要同步
  padding-right: 200rpx;
  gap: $dd-space-2;
}

.dd-order-list__goods-cell {
  flex-shrink: 0;
  width: 140rpx;
  min-width: 0;
}

.dd-order-list__amount {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-left: $dd-space-5;
  // 蒙版底色必须与卡片底色一致，否则滚动时穿帮
  background: linear-gradient(
    to right,
    transparent,
    var(--dd-bg-card, #{$dd-bg-card}) 45%
  );
  // 不拦横向滑动
  pointer-events: none;
  color: var(--dd-text-primary, #{$dd-text-primary});
}

.dd-order-list__amount-count {
  margin-top: $dd-space-1;
  color: var(--dd-text-tertiary, #{$dd-text-tertiary});
  font-size: $dd-font-size-caption;
}

.dd-order-list__bill-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: $dd-space-2;
  padding-top: $dd-space-2;
  border-top: 1rpx solid var(--dd-border-subtle, #{$dd-border-subtle});
}

// 账单信息占剩余宽度，时间贴右
.dd-order-list__bill {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
}

.dd-order-list__bill-icon {
  flex-shrink: 0;
  margin-right: $dd-space-1;
  color: var(--dd-text-tertiary, #{$dd-text-tertiary});
  font-size: 24rpx;
}

.dd-order-list__bill-text {
  overflow: hidden;
  color: var(--dd-text-secondary, #{$dd-text-secondary});
  font-size: $dd-font-size-caption;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dd-order-list__time {
  flex-shrink: 0;
  margin-left: $dd-space-2;
  color: var(--dd-text-tertiary, #{$dd-text-tertiary});
  font-size: $dd-font-size-caption;
}
</style>
