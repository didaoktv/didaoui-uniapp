<template>
  <view class="dd-stepper" :class="[`dd-stepper--${size}`, { 'dd-stepper--disabled': disabled }]">
    <view
      class="dd-stepper__btn dd-stepper__minus"
      :class="{ 'dd-stepper__btn--disabled': minusDisabled }"
      :hover-class="!minusDisabled ? 'dd-stepper__btn--active' : ''"
      @click="onMinus"
    >
      <dd-icon name="minus" class="dd-stepper__icon" />
    </view>
    <text class="dd-stepper__value">{{ modelValue }}</text>
    <view
      class="dd-stepper__btn dd-stepper__plus"
      :class="{ 'dd-stepper__btn--disabled': plusDisabled }"
      :hover-class="!plusDisabled ? 'dd-stepper__btn--active' : ''"
      @click="onPlus"
    >
      <dd-icon name="plus" class="dd-stepper__icon" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  modelValue?: number
  min?: number
  max?: number
  step?: number
  size?: 'md' | 'sm'
  disabled?: boolean
  disablePlus?: boolean
  disableMinus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 1,
  min: 1,
  max: 99,
  step: 1,
  size: 'md',
  disabled: false,
  disablePlus: false,
  disableMinus: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: number): void
  (e: 'change', val: number): void
  (e: 'plus'): void
  (e: 'minus'): void
  (e: 'overlimit', val: 'plus' | 'minus'): void
}>()

const minusDisabled = computed(() => props.disabled || props.disableMinus || props.modelValue <= props.min)
const plusDisabled = computed(() => props.disabled || props.disablePlus || props.modelValue >= props.max)

function clamp(val: number) {
  return Math.max(props.min, Math.min(props.max, val))
}

function onMinus() {
  emit('minus')
  if (minusDisabled.value) {
    emit('overlimit', 'minus')
    return
  }
  const next = clamp(props.modelValue - props.step)
  emit('update:modelValue', next)
  emit('change', next)
}
function onPlus() {
  emit('plus')
  if (plusDisabled.value) {
    emit('overlimit', 'plus')
    return
  }
  const next = clamp(props.modelValue + props.step)
  emit('update:modelValue', next)
  emit('change', next)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-stepper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $dd-space-1;
  padding: $dd-space-1;
  background: $dd-neutral-800;
  border: 1px solid $dd-neutral-700;
  border-radius: $dd-radius-full;
  box-sizing: border-box;

  &__btn {
    @include dd-flex-center;
    flex-shrink: 0;
    border-radius: 50%;
    background: $dd-gradient-primary-wide;
    @include dd-transition(transform 0.1s ease, opacity 0.2s);

    &--active {
      transform: scale(0.9);
    }

    &--disabled {
      background: $dd-neutral-800;
      @include dd-no-touch;
      .dd-stepper__icon {
        color: $dd-neutral-500;
        opacity: 0.4;
      }
    }
  }

  &__icon {
    color: $dd-neutral-900;
    font-weight: 700;
    line-height: 1;
  }

  &__value {
    text-align: center;
    color: $dd-neutral-50;
    font-weight: 700;
    line-height: 1;
    @include dd-ellipsis(1);
  }

  &--disabled {
    opacity: 0.5;
    @include dd-no-touch;
  }
}

.dd-stepper--md {
  height: 72rpx;
  .dd-stepper__btn {
    width: 56rpx;
    height: 56rpx;
  }
  .dd-stepper__icon {
    font-size: $dd-font-size-h4;
  }
  .dd-stepper__value {
    min-width: 80rpx;
    font-size: $dd-font-size-h4;
  }
}

.dd-stepper--sm {
  height: 56rpx;
  .dd-stepper__btn {
    width: 44rpx;
    height: 44rpx;
  }
  .dd-stepper__icon {
    font-size: 26rpx;
  }
  .dd-stepper__value {
    min-width: $dd-space-6;
    font-size: $dd-font-size-body;
  }
}
</style>
