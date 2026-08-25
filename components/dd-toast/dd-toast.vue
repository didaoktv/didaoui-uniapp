<template>
  <view class="dd-toast" :class="[`dd-toast--${toastState.position}`, { 'dd-toast--show': toastState.visible }]">
    <view class="dd-toast__capsule">
      <view v-if="showIcon" class="dd-toast__icon">
        <view v-if="toastState.type === 'loading'" class="dd-toast__spinner"></view>
        <dd-icon v-else :name="iconName" class="dd-toast__icon-text" :class="`dd-toast__icon-text--${toastState.type}`" />
      </view>
      <text v-if="toastState.message" class="dd-toast__msg">{{ toastState.message }}</text>
    </view>
  </view>
</template>

<script lang="ts">
import { reactive } from 'vue'

export type ToastType = 'text' | 'success' | 'error' | 'warning' | 'loading'
export type ToastPosition = 'top' | 'center' | 'bottom'

export interface ToastOptions {
  message?: string
  type?: ToastType
  position?: ToastPosition
  duration?: number
  icon?: boolean
}

// 模块级单例状态 (createApp 在 MP 不支持，用响应式 state + 组件挂载到页面)
export const toastState = reactive({
  visible: false,
  message: '',
  type: 'text' as ToastType,
  position: 'center' as ToastPosition,
  duration: 2000,
  icon: true,
})

let timer: ReturnType<typeof setTimeout> | null = null

export function hideToast() {
  toastState.visible = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

export function showToast(options: string | ToastOptions) {
  const opts = typeof options === 'string' ? { message: options } : options
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  toastState.visible = true
  toastState.message = opts.message || ''
  toastState.type = opts.type || 'text'
  toastState.position = opts.position || 'center'
  toastState.duration = opts.duration ?? 2000
  toastState.icon = opts.icon ?? true
  // loading 类型不自动关闭，需手动 hideToast()
  if (toastState.type !== 'loading') {
    timer = setTimeout(hideToast, toastState.duration)
  }
}

export function showLoading(message = '加载中') {
  showToast({ message, type: 'loading', position: 'center' })
}

export function showSuccess(message: string) {
  showToast({ message, type: 'success' })
}

export function showError(message: string) {
  showToast({ message, type: 'error' })
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

// text 类型强制隐藏图标
const showIcon = computed(() => toastState.icon && toastState.type !== 'text')

const iconName = computed(() => {
  const map: Record<string, string> = {
    success: 'success',
    error: 'fail',
    warning: 'warning',
  }
  return map[toastState.type] || ''
})
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-toast {
  position: fixed;
  left: 50%;
  transform: translateX(-50%) scale(0.9);
  opacity: 0;
  visibility: hidden;
  z-index: $dd-z-index-toast;
  @include dd-no-touch; // pointer-events none
  @include dd-transition(opacity 0.25s ease, transform 0.25s ease, visibility 0.25s);

  &--top {
    top: 20%;
  }

  &--center {
    top: 50%;
    transform: translate(-50%, -50%) scale(0.9);
  }

  &--bottom {
    bottom: 20%;
  }

  &--show {
    opacity: 1;
    visibility: visible;

    &.dd-toast--top {
      transform: translateX(-50%) scale(1);
    }

    &.dd-toast--center {
      transform: translate(-50%, -50%) scale(1);
    }

    &.dd-toast--bottom {
      transform: translateX(-50%) scale(1);
    }
  }

  &__capsule {
    max-width: 70vw;
    min-width: 200rpx;
    @include dd-glass;
    border-radius: $dd-radius-full;
    padding: $dd-space-3 $dd-space-5;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $dd-space-2;
  }

  &__icon {
    @include dd-flex-center;
  }

  &__icon-text {
    font-size: 64rpx;
    line-height: 1;
    font-weight: 700;

    &--success {
      color: var(--dd-success-400, #{$dd-success-400});
    }

    &--error {
      color: var(--dd-error-400, #{$dd-error-400});
    }

    &--warning {
      color: var(--dd-warning-400, #{$dd-warning-400});
    }
  }

  &__spinner {
    width: $dd-size-icon-xl;
    height: $dd-size-icon-xl;
    border: 6rpx solid var(--dd-border-default, #{$dd-border-default});
    border-top-color: var(--dd-primary-400, #{$dd-primary-400});
    border-radius: 50%;
    animation: dd-toast-spin 0.8s linear infinite;
  }

  &__msg {
    color: $dd-color-white;
    font-size: $dd-font-size-body;
    line-height: 1.4;
    text-align: center;
  }
}

@keyframes dd-toast-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
