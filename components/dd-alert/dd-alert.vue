<template>
  <view class="dd-alert">
    <view
      class="dd-alert__mask"
      :class="{ 'dd-alert__mask--show': modelValue }"
      @click="onMaskClick"
    ></view>
    <view class="dd-alert__card" :class="{ 'dd-alert__card--show': modelValue }">
      <view class="dd-alert__icon" :class="[`dd-alert__icon--${type}`]">
        <dd-icon :name="iconName" class="dd-alert__icon-text" />
      </view>
      <text v-if="title" class="dd-alert__title">{{ title }}</text>
      <text v-if="message" class="dd-alert__message">{{ message }}</text>
      <view class="dd-alert__actions" :class="{ 'dd-alert__actions--single': !showCancel }">
        <view v-if="showCancel" class="dd-alert__btn dd-alert__btn--cancel" @click="onCancel">
          <text class="dd-alert__btn-text dd-alert__btn-text--cancel">{{ cancelText }}</text>
        </view>
        <view class="dd-alert__btn dd-alert__btn--confirm" @click="onConfirm">
          <text class="dd-alert__btn-text dd-alert__btn-text--confirm">{{ confirmText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

type AlertType = 'info' | 'success' | 'warning' | 'error' | 'confirm'

interface Props {
  modelValue?: boolean
  type?: AlertType
  title?: string
  message?: string
  showCancel?: boolean
  confirmText?: string
  cancelText?: string
  closeOnClickModal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  type: 'info',
  title: '',
  message: '',
  showCancel: true,
  confirmText: '确定',
  cancelText: '取消',
  closeOnClickModal: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const iconName = computed(() => {
  const map: Record<AlertType, string> = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'fail',
    confirm: 'question',
  }
  return map[props.type]
})

function close() {
  emit('update:modelValue', false)
}

function onConfirm() {
  emit('confirm')
  close()
}

function onCancel() {
  emit('cancel')
  close()
}

function onMaskClick() {
  // 默认 mask 不关闭，防止误操作
  if (!props.closeOnClickModal) return
  close()
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-alert {
  &__mask {
    position: fixed;
    inset: 0;
    background: $dd-color-overlay-strong;
    opacity: 0;
    visibility: hidden;
    z-index: 1000;
    @include dd-transition(opacity 0.25s, visibility 0.25s);

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
    z-index: 1001;
    width: 560rpx;
    background: $dd-bg-elevated;
    border: 1px solid $dd-border-default;
    border-radius: $dd-radius-xl;
    box-shadow: $dd-shadow-4;
    padding: $dd-space-5 $dd-space-5 $dd-space-4;
    display: flex;
    flex-direction: column;
    align-items: center;
    @include dd-transition(transform 0.25s ease, opacity 0.25s ease, visibility 0.25s);

    &--show {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
      visibility: visible;
    }
  }

  &__icon {
    width: 112rpx;
    height: 112rpx;
    border-radius: 50%;
    @include dd-flex-center;
    margin-bottom: $dd-space-3;

    &--info {
      background: $dd-gradient-accent;
      box-shadow: 0 0 40rpx rgba(45, 75, 160, 0.4);
    }

    &--success {
      background: $dd-gradient-success;
      box-shadow: 0 0 40rpx rgba(76, 175, 80, 0.4);
    }

    &--warning {
      background: $dd-gradient-warning;
      box-shadow: 0 0 40rpx rgba(249, 168, 37, 0.4);
    }

    &--error {
      background: $dd-gradient-error;
      box-shadow: 0 0 40rpx rgba(229, 57, 53, 0.4);
    }

    &--confirm {
      background: $dd-gradient-primary-wide;
      @include dd-glow(gold);
    }
  }

  &__icon-text {
    color: $dd-color-white;
    font-size: 56rpx;
    font-weight: 700;
    line-height: 1;
  }

  &__title {
    font-size: $dd-font-size-h4;
    font-weight: $dd-font-weight-h4;
    color: $dd-text-primary;
    text-align: center;
    line-height: $dd-line-height-h4;
  }

  &__message {
    margin-top: $dd-space-2;
    font-size: $dd-font-size-body;
    color: $dd-text-secondary;
    text-align: center;
    line-height: $dd-line-height-body;
  }

  &__actions {
    display: flex;
    gap: $dd-space-3;
    width: 100%;
    margin-top: $dd-space-5;

    &--single {
      gap: 0;
    }
  }

  &__btn {
    flex: 1;
    border-radius: $dd-radius-full;
    @include dd-flex-center;

    &--cancel {
      height: 88rpx;
      background: $dd-neutral-700;
      border: 1px solid $dd-border-strong;
    }

    &--confirm {
      height: 88rpx;
      background: $dd-gradient-primary;
    }
  }

  &__actions--single &__btn--confirm {
    height: 96rpx;
  }

  &__btn-text {
    font-size: $dd-font-size-body;
    font-weight: $dd-font-weight-body;

    &--cancel {
      color: $dd-text-secondary;
    }

    &--confirm {
      color: $dd-neutral-900;
      font-weight: 700;
    }
  }
}
</style>
