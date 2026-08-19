<template>
  <view class="dd-popover" :class="`dd-popover--${theme}`">
    <view class="dd-popover__trigger" @click="onTriggerClick">
      <slot></slot>
    </view>
    <view
      v-if="modelValue"
      class="dd-popover__mask"
      :style="{ zIndex: maskZIndex }"
      @click="onMaskClick"
    ></view>
    <view
      v-if="modelValue"
      class="dd-popover__panel"
      :class="[`dd-popover__panel--${placement}`, `dd-popover__panel--${theme}`]"
      :style="panelStyle"
    >
      <view class="dd-popover__arrow" :class="`dd-popover__arrow--${placement}`"></view>
      <view class="dd-popover__content">
        <slot name="actions"></slot>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue'

interface Props {
  modelValue?: boolean
  placement?: 'top' | 'bottom' | 'left' | 'right'
  theme?: 'light' | 'dark'
  closeOnClickAction?: boolean
  closeOnClickOverlay?: boolean
  offset?: number
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  placement: 'bottom',
  theme: 'light',
  closeOnClickAction: true,
  closeOnClickOverlay: true,
  offset: 16,
  zIndex: 2000,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'select', value: any): void
  (e: 'open'): void
  (e: 'close'): void
}>()

const maskZIndex = computed(() => props.zIndex - 1)

const panelStyle = computed(() => {
  const offsetRpx = `${props.offset}rpx`
  const s: Record<string, string> = { zIndex: String(props.zIndex) }
  // 偏移通过 margin 表达，避免覆盖 transform
  if (props.placement === 'top') s.marginBottom = offsetRpx
  if (props.placement === 'bottom') s.marginTop = offsetRpx
  if (props.placement === 'left') s.marginRight = offsetRpx
  if (props.placement === 'right') s.marginLeft = offsetRpx
  return s
})

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function onTriggerClick() {
  if (props.modelValue) {
    close()
  } else {
    emit('update:modelValue', true)
    emit('open')
  }
}

function onMaskClick() {
  if (props.closeOnClickOverlay) close()
}

// provide 给 dd-popover-item 调用，中继点击
provide('ddPopover', {
  onSelect(value: any) {
    emit('select', value)
    if (props.closeOnClickAction) close()
  },
})
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-popover {
  position: relative;
  display: inline-flex;

  &__trigger {
    display: inline-flex;
  }

  &__mask {
    position: fixed;
    inset: 0;
    background: transparent;
  }

  &__panel {
    position: absolute;
    min-width: 240rpx;
    max-width: 480rpx;
    border-radius: $dd-radius-lg;
    box-shadow: $dd-shadow-2;
    overflow: visible;
    z-index: 2000;

    &--light {
      background: $dd-bg-elevated;
      color: $dd-text-primary;
      .dd-popover__arrow { background: $dd-bg-elevated; }
    }
    &--dark {
      background: $dd-neutral-700;
      color: $dd-color-white;
      .dd-popover__arrow { background: $dd-neutral-700; }
    }

    &--bottom {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
    }
    &--top {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
    }
    &--left {
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
    &--right {
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }

  &__arrow {
    position: absolute;
    width: 16rpx;
    height: 16rpx;
    transform: rotate(45deg);

    &--bottom {
      top: -8rpx;
      left: 50%;
      margin-left: -8rpx;
    }
    &--top {
      bottom: -8rpx;
      left: 50%;
      margin-left: -8rpx;
    }
    &--left {
      right: -8rpx;
      top: 50%;
      margin-top: -8rpx;
    }
    &--right {
      left: -8rpx;
      top: 50%;
      margin-top: -8rpx;
    }
  }

  &__content {
    position: relative;
    border-radius: $dd-radius-lg;
    overflow: hidden;
  }
}
</style>
