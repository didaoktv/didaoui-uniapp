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
      <!-- 左侧金额区域 -->
      <view class="dd-coupon__amount">
        <slot name="unit" :unit="unit" :unitPosition="unitPosition">
          <text v-if="unitPosition === 'left'" class="dd-coupon__amount-unit">{{ unit }}</text>
        </slot>
        <slot name="amount" :amount="amount">
          <text class="dd-coupon__amount-value">{{ amount }}</text>
        </slot>
        <slot name="unit" :unit="unit" :unitPosition="unitPosition">
          <text v-if="unitPosition === 'right'" class="dd-coupon__amount-unit">{{ unit }}</text>
        </slot>
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
        <slot name="action" :actionText="actionText" :circle="circle">
          <!-- ponytail: 原版 :shape="circle ? 'circle': 'circle'" 恒为圆形，故 round 恒 true -->
          <dd-tag
            variant="error"
            :type="type ? 'outlined' : 'filled'"
            round
            size="sm"
            class="dd-coupon__action-btn"
          >{{ actionText }}</dd-tag>
        </slot>
      </view>
    </view>

    <!-- 红包绳子效果 -->
    <view v-if="shape === 'envelope'" class="dd-coupon__rope"></view>

    <!-- 默认插槽，可用于添加额外内容 -->
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DdTag from '../dd-tag/dd-tag.vue'

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
  /** 是否圆形按钮（保留 API；原实现恒为圆形） */
  circle?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 背景颜色 */
  bgColor?: string
  /** 文字颜色 */
  color?: string
  /** 内置背景主题：primary/success/warning/error */
  type?: string
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
  circle: false,
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
  border-radius: $dd-radius-md;
  background: #ffebf0;
  color: $dd-text-primary;
  width: 100%;

  &--coupon {
    border-radius: $dd-radius-lg;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      left: -24rpx;
      top: 50%;
      transform: translateY(-50%);
      width: 48rpx;
      height: 48rpx;
      background-color: $dd-bg;
      border-radius: 50%;
    }

    &::after {
      content: '';
      position: absolute;
      right: -24rpx;
      top: 50%;
      transform: translateY(-50%);
      width: 48rpx;
      height: 48rpx;
      background-color: $dd-bg;
      border-radius: 50%;
    }
  }

  &--envelope {
    border-radius: $dd-radius-lg;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      height: 20rpx;
      background: repeating-linear-gradient(-45deg, #ffd000, #ffd000 10rpx, #ffa000 10rpx, #ffa000 20rpx);
    }
  }

  &--card {
    border-radius: $dd-radius-lg;
  }

  &--small {
    height: 160rpx;
  }

  &--medium {
    height: 180rpx;
  }

  &--large {
    height: 220rpx;
  }

  &--disabled {
    opacity: 0.5;
  }

  &__content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 30rpx;
    position: relative;
    z-index: 2;
  }

  &__amount {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-left: 10rpx;
    padding-right: 30rpx;
    border-right: 1px dashed $dd-border-default;

    &-unit {
      font-size: $dd-font-size-caption;
      font-weight: normal;
    }

    &-value {
      font-size: 56rpx;
      font-weight: bold;
      color: $dd-error-400;
      line-height: 1;
      margin: 10rpx 0;
    }

    &-limit {
      font-size: $dd-font-size-caption;
      opacity: 0.9;
    }
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-left: 30rpx;

    &-title {
      font-size: $dd-font-size-h4;
      font-weight: bold;
      margin-bottom: 10rpx;
    }

    &-desc {
      font-size: $dd-font-size-caption;
      opacity: 0.9;
      margin-bottom: 10rpx;
    }

    &-time {
      font-size: $dd-font-size-caption;
      opacity: 0.8;
    }
  }

  &__action {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding-right: 20rpx;
  }

  &__rope {
    position: absolute;
    top: -40rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 80rpx;
    height: 80rpx;
    background: linear-gradient(to right, #ffd000, #ffa000);
    border-radius: 40rpx 40rpx 0 0;
    z-index: 1;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -20rpx;
      width: 20rpx;
      height: 40rpx;
      background: linear-gradient(to bottom, #ffd000, #ffa000);
      border-radius: 10rpx 0 0 10rpx;
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: -20rpx;
      width: 20rpx;
      height: 40rpx;
      background: linear-gradient(to bottom, #ffd000, #ffa000);
      border-radius: 0 10rpx 10rpx 0;
    }
  }

  // 内置主题样式（保留原版券面渐变视觉）
  &--primary {
    background: linear-gradient(90deg, #43afff, #3b8cff);
    color: $dd-color-white;

    .dd-coupon__amount {
      border-right: 1px dashed #eee;
    }

    .dd-coupon__amount-value {
      color: $dd-color-white;
    }
  }

  &--success {
    background: linear-gradient(90deg, #67dda9, #19be6b);
    color: $dd-color-white !important;

    .dd-coupon__amount {
      border-right: 1px dashed #eee;
    }

    .dd-coupon__amount-value {
      color: $dd-color-white;
    }
  }

  &--warning {
    background: linear-gradient(90deg, #ff9739, #ff6a39);
    color: $dd-color-white;

    .dd-coupon__amount {
      border-right: 1px dashed #eee;
    }

    .dd-coupon__amount-value {
      color: $dd-color-white;
    }
  }

  &--error {
    background: linear-gradient(90deg, #ff7070, #ff4747);
    color: $dd-color-white;

    .dd-coupon__amount {
      border-right: 1px dashed #eee;
    }

    .dd-coupon__amount-value {
      color: $dd-color-white;
    }
  }
}
</style>
