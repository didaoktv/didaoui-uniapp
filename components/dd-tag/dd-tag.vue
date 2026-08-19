<template>
  <view
    class="dd-tag"
    :class="[
      `dd-tag--${type}`,
      `dd-tag--${variant}`,
      `dd-tag--${size}`,
      { 'dd-tag--round': round, 'dd-tag--closable': closable },
    ]"
    @click="onClick"
  >
    <view v-if="type === 'dot'" class="dd-tag__dot"></view>
    <text v-if="$slots.default || text" class="dd-tag__label"><slot>{{ text }}</slot></text>
    <view v-if="closable" class="dd-tag__close" @click.stop="onClose">
      <dd-icon name="cross" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { useSlots } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  type?: 'filled' | 'outlined' | 'dot'
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'default'
  size?: 'sm' | 'md'
  round?: boolean
  closable?: boolean
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'filled',
  variant: 'primary',
  size: 'md',
  round: false,
  closable: false,
  text: '',
})

const emit = defineEmits<{ (e: 'click', val: Event): void; (e: 'close', val: Event): void }>()

const slots = useSlots()
void slots

function onClick(e: Event) {
  emit('click', e)
}

function onClose(e: Event) {
  emit('close', e)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  box-sizing: border-box;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;

  &__label {
    line-height: 1;
  }

  &__dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28rpx;
    height: 28rpx;
    border-radius: 50%;
    color: inherit;
    font-size: $dd-font-size-caption;
    opacity: 0.7;
  }
}

// === 尺寸: md(48rpx) / sm(40rpx) ===
.dd-tag--md {
  height: 48rpx;
  padding: 0 $dd-space-3;
  border-radius: $dd-radius-sm;
  font-size: $dd-font-size-body;
  font-weight: 500;
}

.dd-tag--sm {
  height: 40rpx;
  padding: 0 $dd-space-2;
  border-radius: $dd-radius-md;
  font-size: $dd-font-size-caption;
}

.dd-tag--round {
  border-radius: $dd-radius-full !important;
}

// === Filled: 渐变背景 + 反色文字 ===
.dd-tag--filled {
  &.dd-tag--primary {
    background: $dd-gradient-primary;
    color: $dd-color-white;
  }
  &.dd-tag--accent {
    background: $dd-gradient-accent;
    color: $dd-accent-contrast;
  }
  &.dd-tag--success {
    background: $dd-success-500;
    color: $dd-success-contrast;
  }
  &.dd-tag--warning {
    background: $dd-warning-500;
    color: $dd-warning-contrast;
  }
  &.dd-tag--error {
    background: $dd-error-500;
    color: $dd-error-contrast;
  }
  &.dd-tag--info {
    background: $dd-info-500;
    color: $dd-info-contrast;
  }
  &.dd-tag--default {
    background: $dd-neutral-700;
    color: $dd-text-secondary;
  }
}

// === Outlined: 透明背景 + 1px 边框 + 语义色 ===
.dd-tag--outlined {
  background: transparent;
  border: 1px solid $dd-border-strong;

  &.dd-tag--primary { color: $dd-primary-400; border-color: $dd-primary-500; }
  &.dd-tag--accent { color: $dd-accent-300; border-color: $dd-accent-500; }
  &.dd-tag--success { color: $dd-success-400; border-color: $dd-success-500; }
  &.dd-tag--warning { color: $dd-warning-400; border-color: $dd-warning-500; }
  &.dd-tag--error { color: $dd-error-400; border-color: $dd-error-500; }
  &.dd-tag--info { color: $dd-info-400; border-color: $dd-info-500; }
  &.dd-tag--default { color: $dd-text-secondary; border-color: $dd-border-strong; }
}

// === Dot: elevated 背景 + 彩色点 + 次级色文字 ===
.dd-tag--dot {
  background: $dd-bg-elevated;
  border: 1px solid $dd-border-default;
  color: $dd-text-secondary;

  &.dd-tag--primary .dd-tag__dot { background: $dd-primary-500; }
  &.dd-tag--accent .dd-tag__dot { background: $dd-accent-500; }
  &.dd-tag--success .dd-tag__dot { background: $dd-success-500; }
  &.dd-tag--warning .dd-tag__dot { background: $dd-warning-500; }
  &.dd-tag--error .dd-tag__dot { background: $dd-error-500; }
  &.dd-tag--info .dd-tag__dot { background: $dd-info-500; }
  &.dd-tag--default .dd-tag__dot { background: $dd-neutral-400; }
}

.dd-tag--closable {
  padding-right: $dd-space-1;
}
</style>
