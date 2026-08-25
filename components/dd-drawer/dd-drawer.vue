<template>
  <view class="dd-drawer">
    <view
      class="dd-drawer__mask"
      :class="{ 'dd-drawer__mask--show': modelValue }"
      @click="onMaskClick"
    ></view>
    <view
      class="dd-drawer__panel"
      :class="[`dd-drawer__panel--${position}`, { 'dd-drawer__panel--show': modelValue }]"
      :style="{ width: width }"
    >
      <view v-if="$slots.header" class="dd-drawer__header">
        <slot name="header"></slot>
      </view>
      <view v-else class="dd-drawer__header dd-drawer__header--vip">
        <view class="dd-drawer__avatar">
          <image
            v-if="avatar"
            class="dd-drawer__avatar-img"
            :src="avatar"
            mode="aspectFill"
          />
          <text v-else class="dd-drawer__avatar-fallback">{{ username ? username.charAt(0) : '客' }}</text>
        </view>
        <view class="dd-drawer__user">
          <view class="dd-drawer__user-row">
            <text class="dd-drawer__username">{{ username }}</text>
            <text class="dd-drawer__vip-badge">VIP</text>
          </view>
          <text v-if="vipLevel" class="dd-drawer__level">{{ vipLevel }}</text>
        </view>
      </view>
      <scroll-view scroll-y class="dd-drawer__content">
        <slot></slot>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { watch } from 'vue'

interface Props {
  modelValue?: boolean
  position?: 'left' | 'right'
  width?: string
  maskClosable?: boolean
  avatar?: string
  username?: string
  vipLevel?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  position: 'left',
  width: '80%',
  maskClosable: true,
  avatar: '',
  username: '',
  vipLevel: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'opened'): void
  (e: 'closed'): void
}>()

let timer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.modelValue,
  (val) => {
    if (timer) clearTimeout(timer)
    if (val) {
      emit('open')
      timer = setTimeout(() => emit('opened'), 300)
    } else {
      emit('close')
      timer = setTimeout(() => emit('closed'), 300)
    }
  }
)

function onMaskClick() {
  if (!props.maskClosable) return
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-drawer__mask {
  position: fixed;
  inset: 0;
  background: var(--dd-glass-bg, #{$dd-glass-bg});
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  opacity: 0;
  visibility: hidden;
  z-index: 1000;
  @include dd-transition(opacity 0.3s ease, visibility 0.3s ease);

  &--show {
    opacity: 1;
    visibility: visible;
  }
}

.dd-drawer__panel {
  position: fixed;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: var(--dd-surface, #{$dd-surface});
  overflow: hidden;
  z-index: 1001;
  // ponytail: cubic-bezier 取 iOS 标准滑出曲线，遮罩淡入同期 0.3s，合上略快收尾
  transition: transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: transform;
  &--left {
    left: 0;
    transform: translateX(-100%);
  }

  &--right {
    right: 0;
    transform: translateX(100%);
  }

  &--show {
    transform: translateX(0);
  }
}

.dd-drawer__header {
  flex-shrink: 0;

  &--vip {
    padding: 64rpx 32rpx 32rpx;
    background: var(--dd-gradient-primary, #{$dd-gradient-primary});
    display: flex;
    align-items: center;
    gap: 24rpx;
  }
}

.dd-drawer__avatar {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  @include dd-flex-center;
  flex-shrink: 0;
}

.dd-drawer__avatar-img {
  width: 100%;
  height: 100%;
}

.dd-drawer__avatar-fallback {
  font-size: 40rpx;
  color: var(--dd-primary-contrast, #{$dd-primary-contrast});
  font-weight: 700;
}

.dd-drawer__user {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-width: 0;
}

.dd-drawer__user-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.dd-drawer__username {
  font-size: $dd-font-size-h3;
  font-weight: 700;
  color: var(--dd-primary-contrast, #{$dd-primary-contrast});
  @include dd-ellipsis(1);
}

.dd-drawer__vip-badge {
  background: var(--dd-surface, #{$dd-surface});
  color: var(--dd-primary-400, #{$dd-primary-400});
  font-size: 20rpx;
  font-weight: 700;
  padding: 2rpx 10rpx;
  border-radius: $dd-radius-sm;
}

.dd-drawer__level {
  font-size: $dd-font-size-caption;
  color: rgba(10, 10, 10, 0.7);
}

.dd-drawer__content {
  flex: 1;
  height: 0;
}
</style>
