<template>
  <view class="dd-skeleton">
    <template v-if="loading">
      <!-- text -->
      <template v-if="type === 'text'">
        <view class="dd-skeleton__line dd-skeleton__line--title"></view>
        <view
          v-for="(w, i) in lineWidths"
          :key="i"
          class="dd-skeleton__line"
          :style="{ width: w + '%' }"
        ></view>
      </template>

      <!-- card -->
      <template v-else-if="type === 'card'">
        <view class="dd-skeleton__card">
          <view class="dd-skeleton__block dd-skeleton__card-img"></view>
          <view class="dd-skeleton__card-body">
            <view class="dd-skeleton__block dd-skeleton__line dd-skeleton__line--title"></view>
            <view class="dd-skeleton__block dd-skeleton__line" style="width: 80%"></view>
            <view class="dd-skeleton__block dd-skeleton__line" style="width: 60%"></view>
          </view>
        </view>
      </template>

      <!-- list -->
      <template v-else-if="type === 'list'">
        <view
          v-for="i in rows"
          :key="i"
          class="dd-skeleton__list-item"
        >
          <view v-if="avatar" class="dd-skeleton__block dd-skeleton__avatar dd-skeleton__avatar--sm"></view>
          <view class="dd-skeleton__list-text">
            <view class="dd-skeleton__block dd-skeleton__line" style="width: 40%"></view>
            <view class="dd-skeleton__block dd-skeleton__line" style="width: 70%"></view>
          </view>
        </view>
      </template>

      <!-- avatar -->
      <template v-else-if="type === 'avatar'">
        <view class="dd-skeleton__block dd-skeleton__avatar dd-skeleton__avatar--lg"></view>
      </template>

      <!-- image -->
      <template v-else-if="type === 'image'">
        <view class="dd-skeleton__block dd-skeleton__image-block"></view>
      </template>
    </template>

    <slot v-else></slot>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'text' | 'card' | 'list' | 'avatar' | 'image'
  rows?: number
  avatar?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  rows: 3,
  avatar: false,
  loading: true,
})

// 递减宽度 [100,92,85,75,65]% 循环
const WIDTHS = [100, 92, 85, 75, 65]

const lineWidths = computed(() => {
  const arr: number[] = []
  for (let i = 0; i < props.rows; i++) {
    arr.push(WIDTHS[i % WIDTHS.length])
  }
  return arr
})
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-skeleton {
  width: 100%;

  &__block {
    position: relative;
    overflow: hidden;
    background: $dd-neutral-800; // var(--dd-skeleton-bg)

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.08),
        transparent
      );
      animation: dd-skeleton-shimmer 1.5s ease-in-out infinite;
    }
  }

  &__line {
    height: 28rpx;
    border-radius: $dd-radius-sm;
    margin-bottom: 20rpx;
    @extend .dd-skeleton__block;

    &--title {
      height: 36rpx;
      width: 50%;
      margin-bottom: 24rpx;
    }
  }

  &__card {
    border-radius: $dd-radius-lg;
    overflow: hidden;
  }

  &__card-img {
    width: 100%;
    padding-bottom: 56.25%; // 16:9
    border-radius: $dd-radius-lg;
  }

  &__card-body {
    padding: $dd-space-4;
  }

  &__list-item {
    display: flex;
    align-items: center;
    gap: $dd-space-3;
    padding: $dd-space-3 0;
    @include dd-hairline-bottom($dd-border-subtle);
  }

  &__list-text {
    flex: 1;
    min-width: 0;
  }

  &__avatar {
    border-radius: 50%;

    &--sm {
      width: 80rpx;
      height: 80rpx;
      flex-shrink: 0;
    }

    &--lg {
      width: 128rpx;
      height: 128rpx;
    }
  }

  &__image-block {
    width: 100%;
    padding-bottom: 100%; // 1:1
    border-radius: $dd-radius-lg;
  }
}

@keyframes dd-skeleton-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
