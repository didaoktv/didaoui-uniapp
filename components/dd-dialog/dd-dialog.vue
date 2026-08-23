<template>
  <view class="dd-dialog">
    <view
      class="dd-dialog__mask"
      :class="{ 'dd-dialog__mask--show': modelValue }"
      @click="onOverlayClick"
    ></view>
    <view
      class="dd-dialog__card"
      :class="[{ 'dd-dialog__card--show': modelValue }, `dd-dialog__card--${theme}`]"
      :style="{ width: widthValue, maxWidth: '92vw' }"
    >
      <view v-if="title" class="dd-dialog__header">
        <text class="dd-dialog__title">{{ title }}</text>
      </view>
      <view class="dd-dialog__body" :class="{ 'dd-dialog__body--isolated': !title }">
        <text v-if="message" class="dd-dialog__message">{{ message }}</text>
        <slot v-else></slot>
      </view>
      <view v-if="showConfirmButton || showCancelButton" class="dd-dialog__footer" :class="`dd-dialog__footer--${theme}`">
        <template v-if="theme === 'round-button'">
          <view
            v-if="showCancelButton"
            class="dd-dialog__pill dd-dialog__pill--cancel"
            :style="cancelStyle"
            @click="onCancel"
          >
            <text class="dd-dialog__pill-text">{{ cancelButtonText }}</text>
          </view>
          <view
            v-if="showConfirmButton"
            class="dd-dialog__pill dd-dialog__pill--confirm"
            :style="confirmStyle"
            @click="onConfirm"
          >
            <text class="dd-dialog__pill-text dd-dialog__pill-text--confirm">{{ confirmButtonText }}</text>
          </view>
        </template>
        <template v-else>
          <view
            v-if="showCancelButton"
            class="dd-dialog__btn dd-dialog__btn--cancel"
            @click="onCancel"
          >
            <text class="dd-dialog__btn-text" :style="cancelStyle">{{ cancelButtonText }}</text>
          </view>
          <view
            v-if="showConfirmButton"
            class="dd-dialog__btn dd-dialog__btn--confirm"
            @click="onConfirm"
          >
            <text class="dd-dialog__btn-text" :style="confirmStyle">{{ confirmButtonText }}</text>
          </view>
        </template>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: boolean
  title?: string
  message?: string
  theme?: 'default' | 'round-button'
  showConfirmButton?: boolean
  showCancelButton?: boolean
  confirmButtonText?: string
  cancelButtonText?: string
  confirmColor?: string
  cancelColor?: string
  width?: string | number
  closeOnClickOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '',
  message: '',
  theme: 'default',
  showConfirmButton: true,
  showCancelButton: false,
  confirmButtonText: '确认',
  cancelButtonText: '取消',
  confirmColor: '',
  cancelColor: '',
  width: '640rpx',
  closeOnClickOverlay: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'close'): void
}>()

const widthValue = computed(() =>
  typeof props.width === 'number' ? `${props.width}rpx` : props.width
)

const confirmStyle = computed(() => {
  if (props.theme === 'round-button') {
    return props.confirmColor ? { background: props.confirmColor } : {}
  }
  return props.confirmColor ? { color: props.confirmColor } : {}
})

const cancelStyle = computed(() => {
  if (props.theme === 'round-button') {
    return {}
  }
  return props.cancelColor ? { color: props.cancelColor } : {}
})

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function onOverlayClick() {
  if (!props.closeOnClickOverlay) return
  emit('cancel')
  close()
}

function onConfirm() {
  emit('confirm')
  close()
}

function onCancel() {
  emit('cancel')
  close()
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-dialog {
  &__mask {
    position: fixed;
    inset: 0;
    background: $dd-color-overlay-strong;
    opacity: 0;
    visibility: hidden;
    z-index: 2000;
    @include dd-transition(opacity 0.3s ease, visibility 0.3s);

    &--show {
      opacity: 1;
      visibility: visible;
    }
  }

  &__card {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.9);
    opacity: 0;
    visibility: hidden;
    z-index: 2001;
    background: $dd-bg-elevated;
    border: 1px solid $dd-border-default;
    border-radius: $dd-radius-lg;
    box-shadow: $dd-shadow-4;
    overflow: hidden;
    @include dd-transition(transform 0.3s ease, opacity 0.3s ease, visibility 0.3s);

    &--show {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
      visibility: visible;
    }
  }

  &__header {
    padding: $dd-space-5 $dd-space-5 $dd-space-2;
    text-align: center;
  }

  &__title {
    font-size: $dd-font-size-h4;
    font-weight: $dd-font-weight-h4;
    color: $dd-text-primary;
    line-height: 1.3;
  }

  &__body {
    padding: $dd-space-2 $dd-space-5 $dd-space-5;
    text-align: center;

    &--isolated {
      padding-top: $dd-space-5;
    }
  }

  &__message {
    font-size: $dd-font-size-body;
    color: $dd-text-secondary;
    line-height: $dd-line-height-body;
  }

  &__footer {
    &--default {
      display: flex;
      border-top: 1px solid $dd-border-subtle;
    }

    &--round-button {
      display: flex;
      flex-direction: column;
      gap: $dd-space-3;
      padding: 0 $dd-space-5 $dd-space-5;
    }
  }

  &__btn {
    flex: 1;
    @include dd-flex-center;
    height: 96rpx;

    &--cancel {
      border-right: 1px solid $dd-border-subtle;
    }
  }

  &__btn-text {
    font-size: $dd-font-size-body;
    font-weight: 500;
    color: $dd-text-secondary;
  }

  &__pill {
    height: 80rpx;
    border-radius: $dd-radius-full;
    @include dd-flex-center;
    @include dd-transition(background 0.2s ease);

    &--cancel {
      background: $dd-surface-container;
    }

    &--confirm {
      background: $dd-primary-500;
    }
  }

  &__pill-text {
    font-size: $dd-font-size-body;
    font-weight: 600;
    color: $dd-text-secondary;

    &--confirm {
      color: $dd-color-white;
    }
  }
}
</style>
