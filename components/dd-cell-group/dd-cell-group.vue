<template>
  <view>
    <view v-if="title || $slots.title" class="dd-cell-group__title" :class="{ 'dd-cell-group__title--inset': inset }">
      <slot name="title">{{ title }}</slot>
    </view>
    <view class="dd-cell-group" :class="{ 'dd-cell-group--inset': inset, 'dd-cell-group--border': border && !inset }">
      <slot></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  /** 默认通栏；inset = 圆角卡片内嵌模式 */
  inset?: boolean
  /** 通栏模式下的首尾外框发丝线 */
  border?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  inset: false,
  border: true,
})
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-cell-group {
  background: var(--dd-bg-elevated, #{$dd-bg-elevated});

  :deep(.dd-cell:last-child),
  :deep(.dd-list-cell:last-child) {
    &::after {
      display: none;
    }
  }

  &--inset {
    border-radius: $dd-radius-lg;
    overflow: hidden;
    margin: 0 24rpx;
  }

  &--border {
    @include dd-hairline-top(var(--dd-border-subtle, #{$dd-border-subtle}));
    @include dd-hairline-bottom(var(--dd-border-subtle, #{$dd-border-subtle}));
  }
}

.dd-cell-group__title {
  padding: 32rpx 32rpx 16rpx;
  font-size: $dd-font-size-caption;
  color: var(--dd-text-tertiary, #{$dd-text-tertiary});

  &--inset {
    padding: 32rpx 24rpx 16rpx;
  }
}
</style>
