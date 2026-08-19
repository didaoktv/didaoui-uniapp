<template>
  <view class="dd-cell-group">
    <view v-if="title || $slots.title" class="dd-cell-group__title">
      <slot name="title">{{ title }}</slot>
    </view>
    <view class="dd-cell-group__body">
      <slot></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useSlots } from 'vue'

interface Props {
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: '',
})

const slots = useSlots()
void slots
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-cell-group {
  display: flex;
  flex-direction: column;
  width: 100%;

  &__title {
    padding: 32rpx 32rpx 16rpx;
    font-size: $dd-font-size-caption;
    color: $dd-text-tertiary;
  }

  &__body {
    background: $dd-bg-elevated;
    border-radius: $dd-radius-lg;
    overflow: hidden;

    // 去除最后一个子元素的底边框, 避免溢出到圆角外
    :deep(.dd-cell:last-child),
    :deep(.dd-list-cell:last-child) {
      &::after {
        display: none;
      }
    }
  }
}
</style>
