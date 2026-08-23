<template>
  <view class="dd-badge">
    <slot></slot>
    <view
      v-if="visible"
      class="dd-badge__sup"
      :class="[`dd-badge__sup--${type}`, `dd-badge__sup--${variant}`]"
    >
      <text v-if="type === 'number'" class="dd-badge__num">{{ displayContent }}</text>
      <text v-else-if="type === 'text'" class="dd-badge__txt">{{ content }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'dot' | 'number' | 'text'
  variant?: 'primary' | 'error' | 'success' | 'warning'
  content?: string | number
  max?: number
  showZero?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'number',
  variant: 'error',
  content: '',
  max: 99,
  showZero: false,
})

const numericContent = computed(() => {
  return typeof props.content === 'number' ? props.content : Number(props.content)
})

const isNumber = computed(() => !Number.isNaN(numericContent.value))

const displayContent = computed(() => {
  if (!isNumber.value) return String(props.content)
  const n = numericContent.value
  if (n > props.max) return `${props.max}+`
  return String(n)
})

// dot 始终显示; number 当 0 且 !showZero 时隐藏; text 当内容为空时隐藏
const visible = computed(() => {
  if (props.type === 'dot') return true
  if (props.type === 'number') {
    if (!isNumber.value) return false
    const n = numericContent.value
    if (n === 0 && !props.showZero) return false
    return true
  }
  // text: content 为空时隐藏
  return String(props.content).length > 0
})
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-badge {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;

  &__sup {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(25%, -25%);
    z-index: 1;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__num {
    font-family: $dd-font-mono;
    font-weight: 600;
    color: $dd-color-white;
    line-height: 1;
    padding: 0 10rpx;
  }

  &__txt {
    font-family: $dd-font-body;
    font-weight: 500;
    color: $dd-color-white;
    line-height: 1;
    padding: 0 $dd-space-2;
  }
}

// === dot: 16rpx 圆点 ===
.dd-badge__sup--dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  padding: 0;
}

// === number: 胶囊, 最小宽度 36rpx, 高度 36rpx ===
.dd-badge__sup--number {
  min-width: 36rpx;
  height: 36rpx;
  border-radius: $dd-radius-full;
  font-size: $dd-font-size-caption;
}

// === text: 胶囊 ===
.dd-badge__sup--text {
  height: 36rpx;
  border-radius: $dd-radius-full;
  font-size: $dd-font-size-caption;
}

// === 4 色变体 ===
.dd-badge__sup--primary {
  background: $dd-gradient-primary;
  box-shadow: $dd-shadow-glow-gold-sm;
}

.dd-badge__sup--error {
  background: $dd-error-500;
  box-shadow: $dd-shadow-glow-error-sm;
}

.dd-badge__sup--success {
  background: $dd-success-500;
  box-shadow: $dd-shadow-glow-success-sm;
}

.dd-badge__sup--warning {
  background: $dd-warning-500;
  color: $dd-warning-contrast;
  box-shadow: $dd-shadow-glow-warning-md;
}

// text 变体强制反色字
.dd-badge__sup--text.dd-badge__sup--warning .dd-badge__txt {
  color: $dd-warning-contrast;
}
</style>
