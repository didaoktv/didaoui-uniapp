<template>
  <view
    class="dd-radio"
    :class="[
      `dd-radio--${size}`,
      {
        'dd-radio--checked': isChecked,
        'dd-radio--disabled': disabled,
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
import { computed } from 'vue'

interface Props {
  modelValue?: any
  value?: any
  disabled?: boolean
  size?: 'md' | 'sm'
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  value: null,
  disabled: false,
  size: 'md',
  label: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: any): void
  (e: 'change', val: any): void
}>()

const isChecked = computed(() => props.modelValue === props.value)

function onToggle() {
  if (props.disabled) return
  if (isChecked.value) return
  emit('update:modelValue', props.value)
  emit('change', props.value)
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
    background: #ffffff;
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
    width: 40rpx;
    height: 40rpx;
  }
  .dd-radio__inner {
    width: 20rpx;
    height: 20rpx;
  }
}
.dd-radio--sm {
  .dd-radio__outer {
    width: 32rpx;
    height: 32rpx;
  }
  .dd-radio__inner {
    width: 14rpx;
    height: 14rpx;
  }
  .dd-radio__label {
    font-size: 28rpx;
  }
}
</style>
