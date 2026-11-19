<template>
  <dd-portal>
  <view class="dd-action-sheet">
    <view
      class="dd-action-sheet__mask"
      :class="{ 'dd-action-sheet__mask--show': modelValue }"
      :style="{ zIndex: zIndexConfig.dialogMask }"
      @click="onMaskClick"
    ></view>
    <view class="dd-action-sheet__panel" :class="{ 'dd-action-sheet__panel--show': modelValue }" :style="{ zIndex: zIndexConfig.dialog }">
      <view class="dd-action-sheet__handle"></view>
      <view v-if="title" class="dd-action-sheet__title">
        <text class="dd-action-sheet__title-text">{{ title }}</text>
      </view>

      <view class="dd-action-sheet__grid">
        <view
          v-for="(item, i) in items"
          :key="i"
          class="dd-action-sheet__item"
          :style="{ width: 100 / columns + '%' }"
          @click="onSelect(item, i)"
        >
          <view class="dd-action-sheet__icon" :style="iconStyle(item)">
            <dd-icon v-if="item.icon" :name="item.icon" class="dd-action-sheet__icon-text" :color="iconFg(item)" />
            <text v-else class="dd-action-sheet__icon-text" :style="{ color: iconFg(item) }">{{ item.name.charAt(0) }}</text>
          </view>
          <text class="dd-action-sheet__name" :style="item.color ? { color: item.color } : undefined">{{ item.name }}</text>
        </view>
      </view>

      <view v-if="showCancel" class="dd-action-sheet__cancel" @click="onClose">
        <text class="dd-action-sheet__cancel-text">{{ cancelText }}</text>
      </view>
      <view class="dd-action-sheet__safe-bottom"></view>
    </view>
  </view>
  </dd-portal>
</template>

<script setup lang="ts">
import DdPortal from '../dd-portal/dd-portal.vue'
import DdIcon from '../dd-icon/dd-icon.vue'
// z-index 统一取 libs/config/zIndex.js（对话框族与 dd-dialog 同档：dialogMask/dialog）
import zIndexConfig from '../../libs/config/zIndex.js'

interface ActionItem {
  name: string
  icon?: string
  color?: string
  /** 圆底上图标/首字的颜色；默认白。color 为浅色（金/黄等）时必须传深色，否则白字看不清 */
  iconColor?: string
}

interface Props {
  modelValue?: boolean
  items?: ActionItem[]
  columns?: number
  title?: string
  showCancel?: boolean
  cancelText?: string
  closeOnClickModal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  items: () => [],
  columns: 4,
  title: '',
  showCancel: true,
  cancelText: '取消',
  closeOnClickModal: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'select', item: ActionItem, index: number): void
  (e: 'close'): void
}>()

function close() {
  emit('update:modelValue', false)
  emit('close')
}

/**
 * 图标圆底配色：默认沿用品牌金渐变 + gold glow；item.color 指定时改用该色实心底
 * ponytail: ceiling — color 项放弃 gold glow（glow 变量按语义名静态拼装，无法从任意色值推导），
 * 视觉上仍是实心圆 + 白色图标，足够辨识；若后续需要彩色 glow，改在 item 上传 glow 变体名
 */
function iconStyle(item: ActionItem): Record<string, string> | undefined {
  return item.color ? { background: item.color } : undefined
}

/** 圆底上的图标/首字颜色：仅在自定义底色时接管（默认白），否则返回 undefined 保持原有继承行为 */
function iconFg(item: ActionItem): string | undefined {
  if (!item.color && !item.iconColor) return undefined
  return item.iconColor ?? '#ffffff'
}

function onMaskClick() {
  if (!props.closeOnClickModal) return
  close()
}

function onSelect(item: ActionItem, index: number) {
  emit('select', item, index)
  close()
}

function onClose() {
  close()
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-action-sheet {
  &__mask {
    position: fixed;
    inset: 0;
    background: var(--dd-color-overlay-strong, #{$dd-color-overlay-strong});
    opacity: 0;
    visibility: hidden;
    @include dd-transition(opacity 0.3s, visibility 0.3s);

    &--show {
      opacity: 1;
      visibility: visible;
    }
  }

  // ponytail: glassmorphism 背景 (dd-glass)，区别于 modal 的实心 elevated 背景
  &__panel {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    transform: translateY(100%);
    @include dd-glass;
    border-radius: $dd-radius-2xl $dd-radius-2xl 0 0;
    padding: $dd-space-3 $dd-space-4 $dd-space-4;
    @include dd-transition(transform 0.3s ease-out);

    &--show {
      transform: translateY(0);
    }
  }

  &__handle {
    width: 72rpx;
    height: $dd-space-1;
    border-radius: $dd-radius-full;
    background: rgba(255, 255, 255, 0.3);
    margin: $dd-space-1 auto $dd-space-2;
    opacity: 0.6;
  }

  &__title {
    text-align: center;
    margin-bottom: $dd-space-3;
  }

  &__title-text {
    font-size: $dd-font-size-h4;
    font-weight: $dd-font-weight-h4;
    color: var(--dd-text-primary, #{$dd-text-primary});
  }

  &__grid {
    display: flex;
    flex-wrap: wrap;
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $dd-space-2 0;
    box-sizing: border-box;
  }

  &__icon {
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
    background: var(--dd-gradient-primary, #{$dd-gradient-primary});
    @include dd-flex-center;
    @include dd-glow(gold);
  }

  &__icon-text {
    font-size: 44rpx;
    font-weight: 700;
    color: $dd-color-white;
    line-height: 1;
  }

  &__name {
    margin-top: $dd-space-1;
    font-size: $dd-font-size-caption;
    color: var(--dd-text-secondary, #{$dd-text-secondary});
    max-width: 128rpx;
    @include dd-ellipsis(1);
  }

  &__cancel {
    margin-top: $dd-space-3;
    height: 96rpx;
    border-radius: $dd-radius-xl;
    background: var(--dd-surface-container-high, #{$dd-surface-container-high});
    @include dd-flex-center;
    @include dd-hairline-top(var(--dd-border-strong, #{$dd-border-strong}));
  }

  &__cancel-text {
    font-size: $dd-font-size-body;
    color: var(--dd-text-primary, #{$dd-text-primary});
    font-weight: $dd-font-weight-body;
  }

  &__safe-bottom {
    @include dd-safe-area-bottom;
  }
}
</style>
