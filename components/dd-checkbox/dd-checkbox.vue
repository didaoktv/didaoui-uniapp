<template>
  <view
    class="dd-checkbox"
    :class="[
      `dd-checkbox--${size}`,
      {
        'dd-checkbox--checked': isChecked,
        'dd-checkbox--indeterminate': indeterminate,
        'dd-checkbox--disabled': disabled,
      },
    ]"
    @click="onToggle"
  >
    <view class="dd-checkbox__box">
      <view v-if="indeterminate" class="dd-checkbox__dash"></view>
      <dd-icon v-else-if="isChecked" name="success" class="dd-checkbox__check" />
    </view>
    <text v-if="label || $slots.default" class="dd-checkbox__label">
      <slot>{{ label }}</slot>
    </text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  modelValue?: boolean | any[]
  value?: any
  indeterminate?: boolean
  disabled?: boolean
  size?: 'md' | 'sm'
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  value: null,
  indeterminate: false,
  disabled: false,
  size: 'md',
  label: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean | any[]): void
  (e: 'change', val: boolean | any[]): void
}>()

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue.includes(props.value)
  return !!props.modelValue
})

function onToggle() {
  if (props.disabled) return
  if (Array.isArray(props.modelValue)) {
    const arr = props.modelValue.slice()
    const idx = arr.indexOf(props.value)
    if (idx >= 0) arr.splice(idx, 1)
    else arr.push(props.value)
    emit('update:modelValue', arr)
    emit('change', arr)
  } else {
    const next = !props.modelValue
    emit('update:modelValue', next)
    emit('change', next)
  }
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 16rpx;
  user-select: none;

  &__box {
    @include dd-flex-center;
    flex-shrink: 0;
    border-radius: $dd-radius-sm;
    border: 3rpx solid $dd-neutral-700;
    background: transparent;
    box-sizing: border-box;
    @include dd-transition(all 0.2s);
  }

  &__check {
    color: #ffffff;
    font-size: 24rpx;
    font-weight: 700;
    line-height: 1;
  }

  &__dash {
    width: 60%;
    height: 4rpx;
    background: $dd-primary-500;
    border-radius: $dd-radius-full;
  }

  &__label {
    font-size: 28rpx;
    color: $dd-text-primary;
  }

  &--checked .dd-checkbox__box {
    background: $dd-gradient-primary;
    border-color: $dd-primary-500;
    box-shadow: $dd-shadow-glow-gold-lg;
  }

  &--indeterminate .dd-checkbox__box {
    background: rgba($dd-primary-500, 0.1);
    border-color: $dd-primary-500;
  }

  &--disabled {
    opacity: 0.4;
    @include dd-no-touch;
  }
}

.dd-checkbox--md .dd-checkbox__box {
  width: 40rpx;
  height: 40rpx;
}
.dd-checkbox--sm {
  .dd-checkbox__box {
    width: 32rpx;
    height: 32rpx;
  }
  .dd-checkbox__check {
    font-size: 20rpx;
  }
  .dd-checkbox__label {
    font-size: 28rpx;
  }
}
</style>
