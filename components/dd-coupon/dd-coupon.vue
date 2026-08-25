<template>
  <view
    class="dd-coupon"
    :class="[
      `dd-coupon--${shape}`,
      `dd-coupon--${size}`,
      { 'dd-coupon--disabled': disabled, [`dd-coupon--${type}`]: type },
    ]"
    :style="couponStyle"
    @click="handleClick"
  >
    <view class="dd-coupon__content">
      <!-- 左侧金额区域：unit + amount 基线对齐，limit 换行在下 -->
      <view class="dd-coupon__amount">
        <view class="dd-coupon__amount-main">
          <slot v-if="unitPosition === 'left'" name="unit" :unit="unit" :unitPosition="unitPosition">
            <text class="dd-coupon__amount-unit">{{ unit }}</text>
          </slot>
          <slot name="amount" :amount="amount">
            <text class="dd-coupon__amount-value">{{ amount }}</text>
          </slot>
          <slot v-if="unitPosition === 'right'" name="unit" :unit="unit" :unitPosition="unitPosition">
            <text class="dd-coupon__amount-unit">{{ unit }}</text>
          </slot>
        </view>
        <slot name="limit" :limit="limit">
          <text v-if="limit" class="dd-coupon__amount-limit">{{ limit }}</text>
        </slot>
      </view>

      <!-- 中间描述区域 -->
      <view class="dd-coupon__info">
        <slot name="title" :title="title">
          <text class="dd-coupon__info-title">{{ title }}</text>
        </slot>
        <slot name="desc" :desc="desc">
          <text v-if="desc" class="dd-coupon__info-desc">{{ desc }}</text>
        </slot>
        <slot name="time" :time="time">
          <text v-if="time" class="dd-coupon__info-time">{{ time }}</text>
        </slot>
      </view>

      <!-- 右侧操作区域 -->
      <view class="dd-coupon__action">
        <slot name="action" :actionText="actionText">
          <view class="dd-coupon__action-btn"><text>{{ actionText }}</text></view>
        </slot>
      </view>
    </view>

    <!-- 红包顶部金条纹 -->
    <view v-if="shape === 'envelope'" class="dd-coupon__stripe"></view>

    <!-- 默认插槽，可用于添加额外内容 -->
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 金额 */
  amount?: string | number
  /** 金额单位 */
  unit?: string
  /** 单位位置 */
  unitPosition?: 'left' | 'right'
  /** 使用限制 */
  limit?: string
  /** 标题 */
  title?: string
  /** 描述 */
  desc?: string
  /** 有效期 */
  time?: string
  /** 操作按钮文字 */
  actionText?: string
  /** 形状：coupon-优惠券, envelope-红包, card-卡片 */
  shape?: 'coupon' | 'envelope' | 'card'
  /** 尺寸：small, medium, large */
  size?: 'small' | 'medium' | 'large'
  /** 是否禁用 */
  disabled?: boolean
  /** 背景颜色（覆盖内置主题渐变） */
  bgColor?: string
  /** 文字颜色 */
  color?: string
  /** 内置渐变主题：primary/success/warning/error */
  type?: 'primary' | 'success' | 'warning' | 'error' | ''
}

const props = withDefaults(defineProps<Props>(), {
  amount: '',
  unit: '￥',
  unitPosition: 'left',
  limit: '',
  title: '优惠券',
  desc: '',
  time: '',
  actionText: '使用',
  shape: 'coupon',
  size: 'medium',
  disabled: false,
  bgColor: '',
  color: '',
  type: '',
})

const emit = defineEmits<{ (e: 'click'): void }>()

const couponStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.bgColor) style.background = props.bgColor
  if (props.color) style.color = props.color
  return style
})

function handleClick() {
  if (props.disabled) return
  emit('click')
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-coupon {
  position: relative;
  overflow: hidden;
  border-radius: $dd-radius-lg;
  background: var(--dd-bg-elevated, #{$dd-bg-elevated});
  color: var(--dd-text-primary, #{$dd-text-primary});
  width: 100%;

  // === 形状 ===
  &--coupon {
    // 两侧打孔：孔色取页面底色，需在 $dd-bg 页面上使用（文档化限制）
    &::before {
      content: '';
      position: absolute;
      left: -24rpx;
      top: 50%;
      transform: translateY(-50%);
      width: 48rpx;
      height: 48rpx;
      background: var(--dd-bg, #{$dd-bg});
      border-radius: 50%;
      z-index: 1;
    }

    &::after {
      content: '';
      position: absolute;
      right: -24rpx;
      top: 50%;
      transform: translateY(-50%);
      width: 48rpx;
      height: 48rpx;
      background: var(--dd-bg, #{$dd-bg});
      border-radius: 50%;
      z-index: 1;
    }
  }

  // === 尺寸（min-height，长内容不被裁剪） ===
  &--small .dd-coupon__content {
    min-height: 160rpx;
  }

  &--medium .dd-coupon__content {
    min-height: 180rpx;
  }

  &--large .dd-coupon__content {
    min-height: 220rpx;
  }

  &--small .dd-coupon__amount-value {
    font-size: 44rpx;
  }

  &--medium .dd-coupon__amount-value {
    font-size: 56rpx;
  }

  &--large .dd-coupon__amount-value {
    font-size: 72rpx;
  }

  &--disabled {
    opacity: 0.5;
  }

  &__content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0 $dd-space-4;
    position: relative;
    z-index: 2;
    box-sizing: border-box;
  }

  &__amount {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 144rpx;
    padding: $dd-space-2 $dd-space-4 $dd-space-2 0;
    border-right: 1px dashed var(--dd-border-strong, #{$dd-border-strong});

    &-main {
      display: flex;
      flex-direction: row;
      align-items: baseline;
    }

    &-unit {
      font-size: $dd-font-size-h3;
      font-weight: $dd-font-weight-h4;
      color: var(--dd-error-400, #{$dd-error-400});
      line-height: 1;
    }

    &-value {
      font-size: 56rpx;
      font-weight: $dd-font-weight-display;
      color: var(--dd-error-400, #{$dd-error-400});
      line-height: 1;
    }

    &-limit {
      margin-top: $dd-space-1;
      font-size: $dd-font-size-caption;
      color: var(--dd-text-tertiary, #{$dd-text-tertiary});
      line-height: $dd-line-height-caption;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: $dd-space-2 0 $dd-space-2 $dd-space-4;

    &-title {
      font-size: $dd-font-size-h4;
      font-weight: $dd-font-weight-h4;
      color: var(--dd-text-primary, #{$dd-text-primary});
      line-height: $dd-line-height-h4;
      @include dd-ellipsis(1);
    }

    &-desc {
      margin-top: $dd-space-1;
      font-size: $dd-font-size-caption;
      color: var(--dd-text-secondary, #{$dd-text-secondary});
      line-height: $dd-line-height-caption;
      @include dd-ellipsis(1);
    }

    &-time {
      margin-top: $dd-space-1;
      font-size: $dd-font-size-caption;
      color: var(--dd-text-tertiary, #{$dd-text-tertiary});
      line-height: $dd-line-height-caption;
      @include dd-ellipsis(1);
    }
  }

  &__action {
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding-left: $dd-space-4;
  }

  // 默认操作按钮：error 实底胶囊；type 主题下在各主题块中改对比色描边
  &__action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 56rpx;
    padding: 0 $dd-space-5;
    border-radius: $dd-radius-full;
    background: var(--dd-error, #{$dd-error});
    color: var(--dd-error-contrast, #{$dd-error-contrast});
    font-size: $dd-font-size-caption;
    font-weight: $dd-font-weight-caption;
  }

  // 红包顶部金条纹（帝王金）
  &__stripe {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 20rpx;
    background: repeating-linear-gradient(
      -45deg,
      var(--dd-primary-300, #{$dd-primary-300}),
      var(--dd-primary-300, #{$dd-primary-300}) 10rpx,
      var(--dd-primary, #{$dd-primary}) 10rpx,
      var(--dd-primary, #{$dd-primary}) 20rpx
    );
    z-index: 1;
  }

  &--envelope .dd-coupon__content {
    padding-top: $dd-space-3;
  }

  // === 内置渐变主题（$dd-gradient-* token + 各主题 contrast 文字） ===
  &--primary {
    background: var(--dd-gradient-primary, #{$dd-gradient-primary});
    color: var(--dd-primary-contrast, #{$dd-primary-contrast});

    .dd-coupon__amount {
      border-right-color: var(--dd-border-subtle, #{$dd-border-subtle});
    }

    .dd-coupon__amount-unit,
    .dd-coupon__amount-value {
      color: var(--dd-primary-contrast, #{$dd-primary-contrast});
    }

    .dd-coupon__amount-limit {
      color: var(--dd-primary-contrast, #{$dd-primary-contrast});
      opacity: 0.75;
    }

    .dd-coupon__info-title {
      color: var(--dd-primary-contrast, #{$dd-primary-contrast});
    }

    .dd-coupon__info-desc,
    .dd-coupon__info-time {
      color: var(--dd-primary-contrast, #{$dd-primary-contrast});
      opacity: 0.8;
    }

    .dd-coupon__action-btn {
      background: transparent;
      border: 1px solid var(--dd-primary-contrast, #{$dd-primary-contrast});
      color: var(--dd-primary-contrast, #{$dd-primary-contrast});
    }
  }

  &--success {
    background: var(--dd-gradient-success, #{$dd-gradient-success});
    color: var(--dd-success-contrast, #{$dd-success-contrast});

    .dd-coupon__amount {
      border-right-color: var(--dd-border-subtle, #{$dd-border-subtle});
    }

    .dd-coupon__amount-unit,
    .dd-coupon__amount-value {
      color: var(--dd-success-contrast, #{$dd-success-contrast});
    }

    .dd-coupon__amount-limit {
      color: var(--dd-success-contrast, #{$dd-success-contrast});
      opacity: 0.75;
    }

    .dd-coupon__info-title {
      color: var(--dd-success-contrast, #{$dd-success-contrast});
    }

    .dd-coupon__info-desc,
    .dd-coupon__info-time {
      color: var(--dd-success-contrast, #{$dd-success-contrast});
      opacity: 0.8;
    }

    .dd-coupon__action-btn {
      background: transparent;
      border: 1px solid var(--dd-success-contrast, #{$dd-success-contrast});
      color: var(--dd-success-contrast, #{$dd-success-contrast});
    }
  }

  &--warning {
    background: var(--dd-gradient-warning, #{$dd-gradient-warning});
    color: var(--dd-warning-contrast, #{$dd-warning-contrast});

    .dd-coupon__amount {
      border-right-color: var(--dd-border-subtle, #{$dd-border-subtle});
    }

    .dd-coupon__amount-unit,
    .dd-coupon__amount-value {
      color: var(--dd-warning-contrast, #{$dd-warning-contrast});
    }

    .dd-coupon__amount-limit {
      color: var(--dd-warning-contrast, #{$dd-warning-contrast});
      opacity: 0.75;
    }

    .dd-coupon__info-title {
      color: var(--dd-warning-contrast, #{$dd-warning-contrast});
    }

    .dd-coupon__info-desc,
    .dd-coupon__info-time {
      color: var(--dd-warning-contrast, #{$dd-warning-contrast});
      opacity: 0.8;
    }

    .dd-coupon__action-btn {
      background: transparent;
      border: 1px solid var(--dd-warning-contrast, #{$dd-warning-contrast});
      color: var(--dd-warning-contrast, #{$dd-warning-contrast});
    }
  }

  &--error {
    background: var(--dd-gradient-error, #{$dd-gradient-error});
    color: var(--dd-error-contrast, #{$dd-error-contrast});

    .dd-coupon__amount {
      border-right-color: var(--dd-border-subtle, #{$dd-border-subtle});
    }

    .dd-coupon__amount-unit,
    .dd-coupon__amount-value {
      color: var(--dd-error-contrast, #{$dd-error-contrast});
    }

    .dd-coupon__amount-limit {
      color: var(--dd-error-contrast, #{$dd-error-contrast});
      opacity: 0.75;
    }

    .dd-coupon__info-title {
      color: var(--dd-error-contrast, #{$dd-error-contrast});
    }

    .dd-coupon__info-desc,
    .dd-coupon__info-time {
      color: var(--dd-error-contrast, #{$dd-error-contrast});
      opacity: 0.8;
    }

    .dd-coupon__action-btn {
      background: transparent;
      border: 1px solid var(--dd-error-contrast, #{$dd-error-contrast});
      color: var(--dd-error-contrast, #{$dd-error-contrast});
    }
  }
}
</style>
