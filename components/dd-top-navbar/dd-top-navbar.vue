<template>
  <view
    class="dd-topbar"
    :class="{
      'dd-topbar--fixed': fixed,
      'dd-topbar--transparent': transparent,
      'dd-topbar--border': border && !transparent,
    }"
  >
    <view
      v-if="fixed && statusBarHeight > 0"
      class="dd-topbar__status"
      :style="{ height: statusBarHeight + 'px' }"
    ></view>
    <view class="dd-topbar__content">
      <view class="dd-topbar__left" @click="onBack">
        <view v-if="showBack" class="dd-topbar__back-icon"><dd-icon name="arrow-left" size="18" /></view>
        <text v-if="showBack && backText" class="dd-topbar__back-text">{{ backText }}</text>
        <view class="dd-topbar__left-slot" @click.stop>
          <slot name="left"></slot>
        </view>
      </view>
      <text class="dd-topbar__title">
        <slot>{{ title }}</slot>
      </text>
      <view class="dd-topbar__right">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
  <view
    v-if="fixed && placeholder"
    class="dd-topbar__placeholder"
    :style="{ height: totalHeight + 'px' }"
  ></view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'
import { getStatusBarHeight, isH5 } from '../../libs/utils'

interface Props {
  title?: string
  fixed?: boolean
  transparent?: boolean
  border?: boolean
  showBack?: boolean
  backText?: string
  placeholder?: boolean
  fallbackPath?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  fixed: true,
  transparent: false,
  border: true,
  showBack: true,
  backText: '',
  placeholder: true,
  fallbackPath: '',
})

const emit = defineEmits<{ (e: 'back'): void }>()

// ponytail: 运行时兜底 —— 条件编译宏在 .ts 文件中可能未生效，
// 用已导出的 isH5 常量做二次校验，确保 H5 端状态栏高度为 0
const rawStatusBarHeight = getStatusBarHeight()
const statusBarHeight = isH5 ? 0 : rawStatusBarHeight

// uni.upx2px 与 CSS rpx 使用相同的屏幕宽度基准，结果一致
const CONTENT_PX = uni.upx2px(88)
const totalHeight = computed(() => statusBarHeight + CONTENT_PX)

function onBack() {
  if (!props.showBack) return
  emit('back')
  const pages = getCurrentPages()
  const goFallback = () => {
    if (props.fallbackPath) uni.reLaunch({ url: props.fallbackPath, fail: () => {} })
  }
  if (pages.length > 1) {
    // navigateBack 可能因历史栈为空而静默失败（H5 新标签页打开等），失败时走 fallbackPath
    uni.navigateBack({ delta: 1, fail: goFallback })
  } else {
    goFallback()
  }
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-topbar {
  width: 100%;
  box-sizing: border-box;

  &--fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: $dd-z-index-sticky;
  }

  &--transparent {
    background: transparent;
    .dd-topbar__content {
      border-bottom: none;
    }
  }

  &:not(.dd-topbar--transparent) {
    @include dd-glass;
    border: none;
  }

  &__status {
    width: 100%;
  }

  &__content {
    position: relative;
    height: 88rpx;
    @include dd-flex-between;
    padding: 0 $dd-space-4;
    box-sizing: border-box;
  }

  &--border &__content {
    @include dd-hairline-bottom(var(--dd-border-subtle, #{$dd-border-subtle}));
  }

  &__left {
    display: flex;
    align-items: center;
    gap: $dd-space-2;
    min-width: 120rpx;
  }

  &__left-slot {
    flex: none;
  }

  &__back-icon {
    display: flex;
    align-items: center;
    font-size: 56rpx;
    color: var(--dd-primary-400, #{$dd-primary-400});
    text-shadow: 0 0 8px rgba(245, 166, 35, 0.4);
  }

  &__back-text {
    font-size: $dd-font-size-body;
    color: var(--dd-primary-400, #{$dd-primary-400});
  }

  &__title {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    max-width: 50%;
    font-size: $dd-font-size-lead;
    font-weight: 700;
    color: var(--dd-text-primary, #{$dd-text-primary});
    @include dd-ellipsis(1);
  }

  &__right {
    display: flex;
    align-items: center;
    gap: $dd-space-3;
    min-width: 120rpx;
    justify-content: flex-end;
  }

  &__placeholder {
    width: 100%;
  }
}
</style>
