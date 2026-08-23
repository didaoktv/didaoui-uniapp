<template>
  <view class="dd-progress" :class="[`dd-progress--${type}`]">
    <!-- linear -->
    <template v-if="type === 'linear'">
      <view class="dd-progress__track">
        <view
          v-if="!indeterminate"
          class="dd-progress__fill"
          :style="{ width: pct + '%', background: fillColor }"
        ></view>
        <view v-else class="dd-progress__fill dd-progress__fill--indeterminate" :style="{ background: fillColor }"></view>
      </view>
      <text v-if="showText && !indeterminate" class="dd-progress__text">{{ pct }}%</text>
    </template>

    <!-- circular -->
    <template v-else-if="type === 'circular'">
      <view
        class="dd-progress__circle"
        :style="{
          width: size + 'rpx',
          height: size + 'rpx',
          background: `conic-gradient(${ringColor} ${pct}%, ${trackColor} ${pct}% 100%)`,
        }"
      >
        <view class="dd-progress__circle-mask" :style="{ width: `calc(100% - ${strokeWidth * 2}rpx)`, height: `calc(100% - ${strokeWidth * 2}rpx)` }">
          <text v-if="showText" class="dd-progress__circle-text">{{ pct }}%</text>
        </view>
      </view>
    </template>

    <!-- steps -->
    <template v-else>
      <view class="dd-progress__steps">
        <view v-for="i in stepCount" :key="i" class="dd-progress__step-node">
          <view
            class="dd-progress__dot"
            :class="[
              `dd-progress__dot--${stepStatus(i - 1)}`,
              { 'dd-progress__dot--current': stepStatus(i - 1) === 'current' },
            ]"
          ></view>
          <view
            v-if="i < stepCount"
            class="dd-progress__connector"
            :class="{ 'dd-progress__connector--done': i - 1 < completedCount }"
          ></view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'linear' | 'circular' | 'steps'
  percentage?: number
  showText?: boolean
  /** steps 类型的步数 (默认 5) */
  steps?: number
  /** 填充色 (linear/circular)，默认金色渐变 */
  color?: string
  trackColor?: string
  /** circular 描边宽度 (rpx) */
  strokeWidth?: number
  /** circular 直径 (rpx) */
  size?: number
  indeterminate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'linear',
  percentage: 0,
  showText: true,
  steps: 5,
  color: '',
  trackColor: '',
  strokeWidth: 8,
  size: 200,
  indeterminate: false,
})

const pct = computed(() => Math.max(0, Math.min(100, Math.round(props.percentage))))

const fillColor = computed(
  () => props.color || `linear-gradient(90deg, #FFC107, #D4891A)` // primary-400 → primary-600
)

const trackColor = computed(() => props.trackColor || '#2A2A2A')

const ringColor = computed(() => props.color || '#F5A623')

const stepCount = computed(() => Math.max(1, props.steps))

const completedCount = computed(() =>
  Math.min(stepCount.value, Math.round((pct.value / 100) * stepCount.value))
)

function stepStatus(i: number): 'done' | 'current' | 'pending' {
  if (i < completedCount.value) return 'done'
  if (i === completedCount.value && completedCount.value < stepCount.value) return 'current'
  return 'pending'
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-progress {
  width: 100%;

  &--linear {
    display: flex;
    align-items: center;
    gap: $dd-space-2;
  }

  &__track {
    flex: 1;
    height: 12rpx;
    background: #2a2a2a;
    border-radius: $dd-radius-full;
    overflow: hidden;
    position: relative;
  }

  &__fill {
    height: 100%;
    border-radius: $dd-radius-full;
    @include dd-transition(width 0.3s ease);
    box-shadow: 0 0 16rpx rgba(245, 166, 35, 0.5);
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      animation: dd-progress-shimmer 1.5s linear infinite;
    }

    &--indeterminate {
      width: 40% !important;
      animation: dd-progress-indeterminate 1.5s ease-in-out infinite;
    }
  }

  &__text {
    font-size: $dd-font-size-caption;
    color: $dd-text-secondary;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }

  // circular
  // ponytail: conic-gradient 在部分小程序旧版本不支持，升级路径为 transform 旋转双半圆或 SVG
  &__circle {
    border-radius: 50%;
    margin: 0 auto;
    @include dd-flex-center;
  }

  &__circle-mask {
    border-radius: 50%;
    background: $dd-surface;
    @include dd-flex-center;
  }

  &__circle-text {
    font-size: $dd-font-size-lead;
    font-weight: 700;
    color: $dd-text-primary;
    font-variant-numeric: tabular-nums;
  }

  // steps
  &__steps {
    display: flex;
    align-items: center;
    width: 100%;
  }

  &__step-node {
    flex: 1;
    display: flex;
    align-items: center;
    position: relative;

    &:last-child {
      flex: 0 0 $dd-space-3;
    }
  }

  &__dot {
    width: 24rpx;
    height: 24rpx;
    border-radius: 50%;
    background: #2a2a2a;
    flex-shrink: 0;
    @include dd-transition(all 0.3s ease);

    &--done,
    &--current {
      background: $dd-gradient-primary;
      box-shadow: 0 0 12rpx rgba(245, 166, 35, 0.5);
    }

    &--current {
      transform: scale(1.2);
    }
  }

  &__connector {
    flex: 1;
    height: $dd-space-1;
    margin: 0 $dd-space-1;
    background: #2a2a2a;
    @include dd-transition(background 0.3s ease);

    &--done {
      background: $dd-primary-500;
    }
  }
}

@keyframes dd-progress-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes dd-progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(250%);
  }
}
</style>
