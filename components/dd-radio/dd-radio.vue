<template>
  <view
    class="dd-radio"
    :class="[
      `dd-radio--${size}`,
      {
        'dd-radio--checked': isChecked,
        'dd-radio--disabled': isDisabled,
      },
    ]"
    @click="onToggle"
  >
    <view class="dd-radio__outer">
      <view class="dd-radio__inner"></view>
    </view>
    <text v-if="label || $slots.default" class="dd-radio__label">
      <slot>{{ label }}</slot>
    </text>
  </view>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

interface Props {
  /** 选项值，对应 dd-radio-group 的 modelValue */
  value: any
  disabled?: boolean
  size?: 'md' | 'sm'
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  value: null,
  disabled: false,
  size: 'md',
  label: '',
})

// 必须配合 dd-radio-group 使用（vant/uview 同款约定）
const group = inject<{
  props: { modelValue: any; disabled: boolean }
  toggle: (value: any) => void
} | null>('dd-radio-group', null)

const isChecked = computed(() => group?.props.modelValue === props.value)
const isDisabled = computed(() => props.disabled || !!group?.props.disabled)

function onToggle() {
  if (isDisabled.value || !group) return
  group.toggle(props.value)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-radio {
  display: inline-flex;
  align-items: center;
  gap: 16rpx;
  user-select: none;

  &__outer {
    @include dd-flex-center;
    flex-shrink: 0;
    border-radius: $dd-radius-full;
    border: 3rpx solid $dd-neutral-700;
    background: transparent;
    box-sizing: border-box;
    @include dd-transition(all 0.2s);
  }

  &__inner {
    border-radius: 50%;
    background: $dd-color-white;
    transform: scale(0);
    opacity: 0;
    @include dd-transition(transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s);
  }

  &__label {
    font-size: 28rpx;
    color: $dd-text-primary;
  }

  &--checked .dd-radio__outer {
    background: $dd-gradient-primary;
    border-color: $dd-primary-500;
    box-shadow: $dd-shadow-glow-gold-lg;
  }

  &--checked .dd-radio__inner {
    transform: scale(1);
    opacity: 1;
  }

  &--disabled {
    opacity: 0.4;
    @include dd-no-touch;
  }
}

.dd-radio--md {
  .dd-radio__outer {
    width: $dd-size-icon-md;
    height: $dd-size-icon-md;
  }
  .dd-radio__inner {
    width: 20rpx;
    height: 20rpx;
  }
}
.dd-radio--sm {
  .dd-radio__outer {
    width: $dd-size-icon-sm;
    height: $dd-size-icon-sm;
  }
  .dd-radio__inner {
    width: 14rpx;
    height: 14rpx;
  }
  .dd-radio__label {
    font-size: $dd-font-size-body;
  }
}
</style>
