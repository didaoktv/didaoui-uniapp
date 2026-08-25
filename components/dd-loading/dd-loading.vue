<template>
  <view v-if="fullscreen" class="dd-loading dd-loading--fullscreen" :style="{ zIndex: 9999 }">
    <view class="dd-loading__mask"></view>
    <view class="dd-loading__box">
      <view class="dd-loading__core" :class="[`dd-loading__core--${type}`, `dd-loading__core--${size}`]" :style="coreStyle">
        <template v-if="type === 'spinner'">
          <view class="dd-loading__spinner"></view>
        </template>
        <template v-else-if="type === 'dots'">
          <view class="dd-loading__dot" v-for="i in 3" :key="i" :style="{ animationDelay: `${(3 - i) * 0.16}s` }"></view>
        </template>
        <template v-else>
          <view class="dd-loading__ring" v-for="i in 2" :key="i" :style="{ animationDelay: `${(i - 1) * 0.9}s` }"></view>
          <view class="dd-loading__pulse-core"></view>
        </template>
      </view>
      <text v-if="text" class="dd-loading__text">{{ text }}</text>
    </view>
  </view>
  <view v-else class="dd-loading" :class="[`dd-loading--inline`, `dd-loading--${type}`, `dd-loading--${size}`]">
    <view class="dd-loading__core" :class="[`dd-loading__core--${type}`, `dd-loading__core--${size}`]" :style="coreStyle">
      <template v-if="type === 'spinner'">
        <view class="dd-loading__spinner"></view>
      </template>
      <template v-else-if="type === 'dots'">
        <view class="dd-loading__dot" v-for="i in 3" :key="i" :style="{ animationDelay: `${(3 - i) * 0.16}s` }"></view>
      </template>
      <template v-else>
        <view class="dd-loading__ring" v-for="i in 2" :key="i" :style="{ animationDelay: `${(i - 1) * 0.9}s` }"></view>
        <view class="dd-loading__pulse-core"></view>
      </template>
    </view>
    <text v-if="text" class="dd-loading__text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'spinner' | 'dots' | 'pulse'
  size?: 'sm' | 'md' | 'lg'
  fullscreen?: boolean
  text?: string
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'spinner',
  size: 'md',
  fullscreen: false,
  text: '',
  color: '',
})

const coreStyle = computed(() => (props.color ? { '--dd-loading-color': props.color } : {}))
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-loading {
  --dd-loading-color: var(--dd-primary-400, #{$dd-primary-400});
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: $dd-space-2;

  &--inline {
    display: inline-flex;
  }

  &--fullscreen {
    position: fixed;
    inset: 0;
    @include dd-flex-center;
  }

  &__mask {
    position: absolute;
    inset: 0;
    background: var(--dd-color-overlay-strong, #{$dd-color-overlay-strong});
    /* #ifdef H5 */
    backdrop-filter: blur(8rpx);
    -webkit-backdrop-filter: blur(8rpx);
    /* #endif */
  }

  &__box {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $dd-space-3;
  }

  &__core {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;

    &--spinner {
      &.dd-loading__core--sm { width: 40rpx; height: 40rpx; }
      &.dd-loading__core--md { width: 64rpx; height: 64rpx; }
      &.dd-loading__core--lg { width: 96rpx; height: 96rpx; }
    }
    &--dots {
      &.dd-loading__core--sm .dd-loading__dot { width: 12rpx; height: 12rpx; }
      &.dd-loading__core--md .dd-loading__dot { width: 20rpx; height: 20rpx; }
      &.dd-loading__core--lg .dd-loading__dot { width: 28rpx; height: 28rpx; }
    }
    &--pulse {
      &.dd-loading__core--sm { width: 40rpx; height: 40rpx; }
      &.dd-loading__core--md { width: 64rpx; height: 64rpx; }
      &.dd-loading__core--lg { width: 96rpx; height: 96rpx; }
      &.dd-loading__core--sm .dd-loading__pulse-core { width: 16rpx; height: 16rpx; }
      &.dd-loading__core--md .dd-loading__pulse-core { width: 24rpx; height: 24rpx; }
      &.dd-loading__core--lg .dd-loading__pulse-core { width: 36rpx; height: 36rpx; }
    }
  }

  &__spinner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border-color: rgba(245, 166, 35, 0.2);
    border-style: solid;
    border-width: 4rpx;
    border-top-color: var(--dd-loading-color);
    border-right-color: var(--dd-loading-color);
    box-shadow: 0 0 12rpx rgba(245, 166, 35, 0.5);
    animation: dd-loading-spin 0.8s linear infinite;
  }
  .dd-loading__core--sm .dd-loading__spinner { border-width: 4rpx; }
  .dd-loading__core--md .dd-loading__spinner { border-width: 6rpx; }
  .dd-loading__core--lg .dd-loading__spinner { border-width: 8rpx; }

  &__dot {
    width: 20rpx;
    height: 20rpx;
    margin: 0 6rpx;
    border-radius: 50%;
    background: var(--dd-loading-color);
    box-shadow: 0 0 16rpx rgba(245, 166, 35, 0.6);
    animation: dd-loading-bounce 1.2s ease-in-out infinite;
  }

  &__ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2rpx solid var(--dd-loading-color);
    opacity: 0;
    transform: scale(0.3);
    animation: dd-loading-pulse 1.8s ease-out infinite;
  }

  &__pulse-core {
    width: 24rpx;
    height: 24rpx;
    border-radius: 50%;
    background: var(--dd-loading-color);
    box-shadow: var(--dd-shadow-glow-gold-lg, #{$dd-shadow-glow-gold-lg});
  }

  &__text {
    color: var(--dd-text-secondary, #{$dd-text-secondary});
    font-size: $dd-font-size-body;
    line-height: 1.4;
  }
}

@keyframes dd-loading-spin {
  to { transform: rotate(360deg); }
}
@keyframes dd-loading-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.6; }
  40% { transform: scale(1); opacity: 1; }
}
@keyframes dd-loading-pulse {
  0% { transform: scale(0.3); opacity: 1; }
  100% { transform: scale(2.5); opacity: 0; }
}
</style>
