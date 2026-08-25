<template>
  <view class="dd-bill-detail">
    <view v-if="header || $slots.header" class="dd-bill-detail__header">
      <slot name="header">{{ header }}</slot>
    </view>

    <view v-if="items.length" class="dd-bill-detail__goods">
      <view
        v-for="(item, idx) in items"
        :key="idx"
        class="dd-bill-detail__row dd-bill-detail__row--goods"
        hover-class="dd-bill-detail__row--press"
        :hover-stay-time="40"
        @click="onClick(item, idx)"
      >
        <view class="dd-bill-detail__gname dd-col">
          <text class="dd-bill-detail__name">{{ item.name }}</text>
          <text v-if="item.price" class="dd-bill-detail__price">{{ item.price }}</text>
        </view>
        <view class="dd-bill-detail__gcount dd-col">
          <text v-if="item.count" class="dd-bill-detail__count">×{{ item.count }}</text>
        </view>
        <view class="dd-bill-detail__gamount dd-col dd-col--right">
          <text class="dd-bill-detail__amount">{{ item.amount }}</text>
        </view>
      </view>
    </view>
    <view v-else class="dd-bill-detail__empty">
      <slot name="empty"><text class="dd-bill-detail__empty-text">暂无商品</text></slot>
    </view>

    <view v-if="subtotal || deliveryFee || total" class="dd-bill-detail__summary">
      <view v-if="subtotal" class="dd-bill-detail__sum-row">
        <text class="dd-bill-detail__sum-label">小计</text>
        <text class="dd-bill-detail__sum-value">{{ subtotal }}</text>
      </view>
      <view v-if="deliveryFee" class="dd-bill-detail__sum-row">
        <text class="dd-bill-detail__sum-label">服务/配送费</text>
        <text class="dd-bill-detail__sum-value">{{ deliveryFee }}</text>
      </view>
      <view v-if="total" class="dd-bill-detail__sum-row dd-bill-detail__sum-row--total">
        <view class="dd-bill-detail__total-left">
          <text class="dd-bill-detail__total-label">合计</text>
          <text v-if="status" class="dd-bill-detail__status" :class="`dd-bill-detail__status--${status}`">{{ statusText }}</text>
        </view>
        <text class="dd-bill-detail__total">{{ total }}</text>
      </view>
    </view>

    <view v-if="$slots.actions" class="dd-bill-detail__actions">
      <slot name="actions" />
    </view>
    <view v-if="$slots.footer" class="dd-bill-detail__footer">
      <slot name="footer" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface BillItem {
  name: string
  price?: string
  count?: number
  amount: string
}

interface Props {
  items: BillItem[]
  total?: string
  subtotal?: string
  deliveryFee?: string
  status?: 'unpaid' | 'paid' | 'refunding' | 'refunded' | 'cancelled'
  header?: string
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  total: '',
  subtotal: '',
  deliveryFee: '',
  status: undefined,
  header: '',
})

const emit = defineEmits<{ (e: 'click', val: { item: BillItem; index: number }): void }>()

const statusMap: Record<string, string> = {
  unpaid: '待支付',
  paid: '已支付',
  refunding: '退款中',
  refunded: '已退款',
  cancelled: '已取消',
}

const statusText = computed(() => statusMap[props.status || ''] || '')

function onClick(item: BillItem, index: number) {
  emit('click', { item, index })
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-bill-detail {
  @include dd-glass(sm);
  border-radius: $dd-radius-xl;
  overflow: hidden;
}

.dd-bill-detail__header {
  padding: $dd-space-3 $dd-space-4;
  font-size: $dd-font-size-body;
  font-weight: $dd-font-weight-lead;
  color: var(--dd-text-primary, #{$dd-text-primary});
  border-bottom: 1px solid var(--dd-border-subtle, #{$dd-border-subtle});
}

.dd-bill-detail__goods {
  padding: $dd-space-2 $dd-space-4;
}

.dd-bill-detail__row {
  display: flex;
  align-items: center;
  gap: $dd-space-2;
  padding: $dd-space-2 0;

  &--press {
    background: var(--dd-interactive-hover, #{$dd-interactive-hover});
  }
}

.dd-col {
  display: flex;
  flex-direction: column;
  gap: 4rpx;

  &--right {
    align-items: flex-end;
    margin-left: auto;
  }
}

.dd-bill-detail__gname {
  flex: 1;
  min-width: 0;
}

.dd-bill-detail__name {
  font-size: $dd-font-size-body;
  color: var(--dd-text-primary, #{$dd-text-primary});
  @include dd-ellipsis(1);
}

.dd-bill-detail__price {
  font-size: $dd-font-size-caption;
  color: var(--dd-text-tertiary, #{$dd-text-tertiary});
}

.dd-bill-detail__gcount {
  flex-shrink: 0;
}

.dd-bill-detail__count {
  font-size: $dd-font-size-caption;
  color: var(--dd-text-secondary, #{$dd-text-secondary});
}

.dd-bill-detail__gamount {
  flex-shrink: 0;
}

.dd-bill-detail__amount {
  font-size: $dd-font-size-body;
  font-weight: $dd-font-weight-lead;
  color: var(--dd-text-primary, #{$dd-text-primary});
  font-family: $dd-font-mono;
}

.dd-bill-detail__empty {
  padding: $dd-space-6 $dd-space-4;
  text-align: center;

  &-text {
    font-size: $dd-font-size-body;
    color: var(--dd-text-tertiary, #{$dd-text-tertiary});
  }
}

.dd-bill-detail__summary {
  border-top: 1px solid var(--dd-border-subtle, #{$dd-border-subtle});
  padding: $dd-space-2 $dd-space-4 $dd-space-3;
}

.dd-bill-detail__sum-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6rpx 0;

  &--total {
    margin-top: $dd-space-1;
    padding-top: $dd-space-2;
    border-top: 1px solid var(--dd-border-subtle, #{$dd-border-subtle});
  }
}

.dd-bill-detail__sum-label {
  font-size: $dd-font-size-caption;
  color: var(--dd-text-tertiary, #{$dd-text-tertiary});
}

.dd-bill-detail__sum-value {
  font-size: $dd-font-size-caption;
  color: var(--dd-text-secondary, #{$dd-text-secondary});
  font-family: $dd-font-mono;
}

.dd-bill-detail__total-left {
  display: flex;
  align-items: center;
  gap: $dd-space-2;
}

.dd-bill-detail__total-label {
  font-size: $dd-font-size-body;
  font-weight: $dd-font-weight-lead;
  color: var(--dd-text-primary, #{$dd-text-primary});
}

.dd-bill-detail__total {
  font-size: $dd-font-size-h4;
  font-weight: $dd-font-weight-h3;
  color: var(--dd-primary-400, #{$dd-primary-400});
  font-family: $dd-font-mono;
}

.dd-bill-detail__status {
  font-size: 20rpx;
  padding: 2rpx 12rpx;
  border-radius: $dd-radius-sm;

  &--unpaid { color: var(--dd-warning-400, #{$dd-warning-400}); background: rgba(249, 168, 37, 0.12); }
  &--paid { color: var(--dd-success-400, #{$dd-success-400}); background: rgba(76, 175, 80, 0.12); }
  &--refunding { color: var(--dd-info-400, #{$dd-info-400}); background: rgba(0, 188, 212, 0.12); }
  &--refunded { color: var(--dd-warning-400, #{$dd-warning-400}); background: rgba(249, 168, 37, 0.12); }
  &--cancelled { color: var(--dd-text-tertiary, #{$dd-text-tertiary}); background: rgba(255, 255, 255, 0.08); }
}

.dd-bill-detail__actions {
  padding: $dd-space-3 $dd-space-4;
  border-top: 1px solid var(--dd-border-subtle, #{$dd-border-subtle});
  display: flex;
  justify-content: flex-end;
  gap: $dd-space-3;
}

.dd-bill-detail__footer {
  padding: $dd-space-2 $dd-space-4 $dd-space-3;
}
</style>