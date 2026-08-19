<template>
  <view class="dd-action-sheet">
    <view
      class="dd-action-sheet__mask"
      :class="{ 'dd-action-sheet__mask--show': modelValue }"
      @click="onMaskClick"
    ></view>
    <view class="dd-action-sheet__panel" :class="{ 'dd-action-sheet__panel--show': modelValue }">
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
          <view class="dd-action-sheet__icon">
            <dd-icon v-if="item.icon" :name="item.icon" class="dd-action-sheet__icon-text" />
            <text v-else class="dd-action-sheet__icon-text">{{ item.name.charAt(0) }}</text>
          </view>
          <text class="dd-action-sheet__name">{{ item.name }}</text>
        </view>
      </view>

      <view v-if="showCancel" class="dd-action-sheet__cancel" @click="onClose">
        <text class="dd-action-sheet__cancel-text">{{ cancelText }}</text>
      </view>
      <view class="dd-action-sheet__safe-bottom"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import DdIcon from '../dd-icon/dd-icon.vue'

interface ActionItem {
  name: string
  icon?: string
  color?: string
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
    background: $dd-color-overlay-strong;
    opacity: 0;
    visibility: hidden;
    z-index: 1000;
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
    z-index: 1001;
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
    height: 8rpx;
    border-radius: $dd-radius-full;
    background: rgba(255, 255, 255, 0.3);
    margin: 8rpx auto 16rpx;
    opacity: 0.6;
  }

  &__title {
    text-align: center;
    margin-bottom: $dd-space-3;
  }

  &__title-text {
    font-size: $dd-font-size-h4;
    font-weight: $dd-font-weight-h4;
    color: $dd-text-primary;
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
    background: $dd-gradient-primary;
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
    margin-top: 8rpx;
    font-size: $dd-font-size-caption;
    color: $dd-text-secondary;
    max-width: 128rpx;
    @include dd-ellipsis(1);
  }

  &__cancel {
    margin-top: $dd-space-3;
    height: 96rpx;
    border-radius: $dd-radius-xl;
    background: $dd-surface-container-high;
    @include dd-flex-center;
    @include dd-hairline-top($dd-border-strong);
  }

  &__cancel-text {
    font-size: $dd-font-size-body;
    color: $dd-text-primary;
    font-weight: $dd-font-weight-body;
  }

  &__safe-bottom {
    @include dd-safe-area-bottom;
  }
}
</style>
