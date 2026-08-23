<template>
  <view
    class="dd-mp-navbar"
    :class="[`dd-mp-navbar--${variant}`, { 'dd-mp-navbar--transparent': transparent }]"
    :style="navStyle"
  >
    <!-- 状态栏占位 -->
    <view class="dd-mp-navbar__status" :style="{ height: statusBarPx + 'px' }"></view>
    <!-- 内容行 -->
    <view class="dd-mp-navbar__content" :style="{ height: contentHeightPx + 'px' }">
      <!-- 左侧：返回 -->
      <view class="dd-mp-navbar__left">
        <view v-if="showBack && variant !== 'search'" class="dd-mp-navbar__back" @click="onBack">
          <view class="dd-mp-navbar__arrow"></view>
          <text v-if="backText" class="dd-mp-navbar__back-text">{{ backText }}</text>
        </view>
      </view>
      <!-- 中间：标题 / 搜索 / 自定义 -->
      <view class="dd-mp-navbar__center">
        <template v-if="variant === 'search'">
          <view class="dd-mp-navbar__search">
            <dd-icon name="search" class="dd-mp-navbar__search-icon" />
            <input
              class="dd-mp-navbar__search-input"
              :value="searchValue"
              :placeholder="searchPlaceholder"
              :placeholder-style="placeholderStyle"
              confirm-type="search"
              @input="onSearchInput"
              @confirm="onSearchConfirm"
            />
          </view>
        </template>
        <template v-else-if="variant === 'custom'">
          <slot></slot>
        </template>
        <template v-else>
          <text v-if="title" class="dd-mp-navbar__title">{{ title }}</text>
        </template>
      </view>
      <!-- 右侧：87px 胶囊占位 -->
      <view class="dd-mp-navbar__right" :style="{ width: capsuleWidthPx + 'px' }"></view>
    </view>
    <!-- custom 变体：内容行下方扩展槽 -->
    <view v-if="variant === 'custom' && $slots.below" class="dd-mp-navbar__below">
      <slot name="below"></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  variant?: 'default' | 'search' | 'custom'
  transparent?: boolean
  showBack?: boolean
  title?: string
  backText?: string
  searchValue?: string
  searchPlaceholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  transparent: false,
  showBack: true,
  title: '',
  backText: '',
  searchValue: '',
  searchPlaceholder: '搜索',
})

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'update:searchValue', val: string): void
  (e: 'search', val: string): void
}>()

const statusBarPx = ref(20)
const contentHeightPx = ref(44)
const capsuleWidthPx = ref(87)

onMounted(() => {
  // 状态栏高度 (跨端)
  try {
    // #ifdef MP-WEIXIN || APP-PLUS
    const info = uni.getWindowInfo()
    statusBarPx.value = info.statusBarHeight || 20
    // #endif
    // #ifdef H5
    statusBarPx.value = 20
    // #endif
  } catch {
    statusBarPx.value = 20
  }

  // 微信小程序：用胶囊按钮真实 rect 对齐导航栏内容高度与右侧占位
  // #ifdef MP-WEIXIN
  try {
    const rect = uni.getMenuButtonBoundingClientRect()
    if (rect && rect.height) {
      // 内容行高度 = (胶囊 top - 状态栏) * 2 + 胶囊高度，使胶囊垂直居中
      contentHeightPx.value = (rect.top - statusBarPx.value) * 2 + rect.height
      capsuleWidthPx.value = rect.width + (rect.right ? (info_windowWidth() - rect.right) : 10) // 右侧留白
    }
  } catch {
    contentHeightPx.value = 44
    capsuleWidthPx.value = 87
  }
  // #endif
})

// 仅 MP-WEIXIN 需要：取屏宽算右侧留白
function info_windowWidth(): number {
  try {
    return uni.getWindowInfo().windowWidth
  } catch {
    return 375
  }
}

const navStyle = computed(() => ({}))

const placeholderStyle = 'color: #9E9E9E; font-size: 14px;'

function onBack() {
  emit('back')
}
function onSearchInput(e: any) {
  const val = e?.detail?.value ?? ''
  emit('update:searchValue', val)
}
function onSearchConfirm(e: any) {
  emit('search', e?.detail?.value ?? '')
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-mp-navbar {
  width: 100%;
  @include dd-glass;
  border-bottom: 1px solid $dd-glass-border;
  position: relative;
  z-index: $dd-z-index-fixed;

  &--transparent {
    background: transparent !important;
    border-bottom: 0;
    /* #ifdef H5 */
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    /* #endif */
  }

  &__status {
    width: 100%;
  }

  &__content {
    display: flex;
    align-items: center;
    padding: 0 12rpx;
    width: 100%;
  }

  &__left {
    flex-shrink: 0;
    min-width: $dd-space-6;
  }

  &__back {
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: $dd-space-1 12rpx;
    border-radius: $dd-radius-md;
  }

  // CSS 返回箭头 "<" (无 SVG，MP 兼容)
  &__arrow {
    width: $dd-space-3;
    height: $dd-space-3;
    border-left: $dd-space-1 solid $dd-primary-400;
    border-bottom: $dd-space-1 solid $dd-primary-400;
    transform: rotate(45deg);
  }

  &__back-text {
    font-size: $dd-font-size-body;
    font-weight: 500;
    color: $dd-primary-400;
  }

  &__center {
    flex: 1;
    @include dd-flex-center;
    overflow: hidden;
  }

  &__title {
    font-size: $dd-font-size-h4;
    font-weight: 600;
    color: $dd-text-primary;
    max-width: 60vw;
    @include dd-ellipsis(1);
    text-align: center;
  }

  &__search {
    width: 100%;
    height: $dd-space-6;
    background: $dd-surface-container;
    border-radius: $dd-radius-full;
    display: flex;
    align-items: center;
    padding: 0 $dd-space-3;
    gap: 12rpx;
  }

  &__search-icon {
    font-size: $dd-font-size-body;
    line-height: 1;
  }

  &__search-input {
    flex: 1;
    font-size: $dd-font-size-body;
    color: $dd-text-primary;
  }

  &__right {
    flex-shrink: 0;
    // 87px 胶囊占位，实际宽度由 MP-WEIXIN rect 覆盖
  }

  &__below {
    width: 100%;
  }
}
</style>
