<template>
  <view
    class="dd-tag"
    :class="[
      `dd-tag--${type}`,
      `dd-tag--${variant}`,
      `dd-tag--${size}`,
      { 'dd-tag--round': round, 'dd-tag--closable': closable },
    ]"
    :style="customStyle"
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
import { computed, useSlots } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  type?: 'filled' | 'outlined' | 'dot'
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'default'
  size?: 'sm' | 'md'
  round?: boolean
  closable?: boolean
  text?: string
  bgColor?: string
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'filled',
  variant: 'primary',
  size: 'md',
  round: false,
  closable: false,
  text: '',
  bgColor: '',
  color: '',
})

// 自定义配色：bgColor 覆盖背景（outlined 时覆盖边框），color 覆盖文字
const customStyle = computed(() => {
  const s: Record<string, string> = {}
  if (props.bgColor) {
    if (props.type === 'outlined') s.borderColor = props.bgColor
    else s.background = props.bgColor
  }
  if (props.color) s.color = props.color
  return s
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
    background: var(--dd-gradient-primary, #{$dd-gradient-primary});
    color: $dd-color-white;
  }
  &.dd-tag--accent {
    background: var(--dd-gradient-accent, #{$dd-gradient-accent});
    color: var(--dd-accent-contrast, #{$dd-accent-contrast});
  }
  &.dd-tag--success {
    background: var(--dd-success, #{$dd-success});
    color: var(--dd-success-contrast, #{$dd-success-contrast});
  }
  &.dd-tag--warning {
    background: var(--dd-warning, #{$dd-warning});
    color: var(--dd-warning-contrast, #{$dd-warning-contrast});
  }
  &.dd-tag--error {
    background: var(--dd-error, #{$dd-error});
    color: var(--dd-error-contrast, #{$dd-error-contrast});
  }
  &.dd-tag--info {
    background: var(--dd-info, #{$dd-info});
    color: var(--dd-info-contrast, #{$dd-info-contrast});
  }
  &.dd-tag--default {
    background: var(--dd-surface-container-high, #{$dd-surface-container-high});
    color: var(--dd-text-secondary, #{$dd-text-secondary});
  }
}

// === Outlined: 透明背景 + 1px 边框 + 语义色 ===
.dd-tag--outlined {
  background: transparent;
  border: 1px solid var(--dd-border-strong, #{$dd-border-strong});

  &.dd-tag--primary { color: var(--dd-primary-400, #{$dd-primary-400}); border-color: var(--dd-primary, #{$dd-primary}); }
  &.dd-tag--accent { color: var(--dd-accent-300, #{$dd-accent-300}); border-color: var(--dd-accent, #{$dd-accent}); }
  &.dd-tag--success { color: var(--dd-success-400, #{$dd-success-400}); border-color: var(--dd-success, #{$dd-success}); }
  &.dd-tag--warning { color: var(--dd-warning-400, #{$dd-warning-400}); border-color: var(--dd-warning, #{$dd-warning}); }
  &.dd-tag--error { color: var(--dd-error-400, #{$dd-error-400}); border-color: var(--dd-error, #{$dd-error}); }
  &.dd-tag--info { color: var(--dd-info-400, #{$dd-info-400}); border-color: var(--dd-info, #{$dd-info}); }
  &.dd-tag--default { color: var(--dd-text-secondary, #{$dd-text-secondary}); border-color: var(--dd-border-strong, #{$dd-border-strong}); }
}

// === Dot: elevated 背景 + 彩色点 + 次级色文字 ===
.dd-tag--dot {
  background: var(--dd-bg-elevated, #{$dd-bg-elevated});
  border: 1px solid var(--dd-border-default, #{$dd-border-default});
  color: var(--dd-text-secondary, #{$dd-text-secondary});

  &.dd-tag--primary .dd-tag__dot { background: var(--dd-primary, #{$dd-primary}); }
  &.dd-tag--accent .dd-tag__dot { background: var(--dd-accent, #{$dd-accent}); }
  &.dd-tag--success .dd-tag__dot { background: var(--dd-success, #{$dd-success}); }
  &.dd-tag--warning .dd-tag__dot { background: var(--dd-warning, #{$dd-warning}); }
  &.dd-tag--error .dd-tag__dot { background: var(--dd-error, #{$dd-error}); }
  &.dd-tag--info .dd-tag__dot { background: var(--dd-info, #{$dd-info}); }
  &.dd-tag--default .dd-tag__dot { background: var(--dd-muted, #{$dd-muted}); }
}

.dd-tag--closable {
  padding-right: $dd-space-1;
}
</style>
