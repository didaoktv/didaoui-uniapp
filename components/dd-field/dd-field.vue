<template>
  <view
    class="dd-field"
    :class="{
      'dd-field--error': errorState,
      'dd-field--disabled': disabled,
      'dd-field--borderless': borderless,
    }"
  >
    <view class="dd-field__row">
      <view v-if="label || $slots.label" class="dd-field__label">
        <text v-if="required" class="dd-field__required">*</text>
        <text class="dd-field__label-text"><slot name="label">{{ label }}</slot></text>
      </view>
      <view class="dd-field__body">
        <textarea
          v-if="type === 'textarea'"
          class="dd-field__control dd-field__textarea"
          :value="modelValue"
          :placeholder="placeholder"
          placeholder-style="color:#9E9E9E"
          :disabled="disabled"
          :maxlength="maxlength"
          :auto-height="autosize"
          :style="{ textAlign: inputAlign }"
          @input="onInput"
          @focus="onFocus"
          @blur="onBlur"
          @confirm="onConfirm"
        />
        <input
          v-else
          class="dd-field__control"
          :type="inputType"
          :password="isPassword"
          :value="modelValue"
          :placeholder="placeholder"
          placeholder-style="color:#9E9E9E"
          :disabled="disabled"
          :maxlength="maxlength"
          :style="{ textAlign: inputAlign }"
          @input="onInput"
          @focus="onFocus"
          @blur="onBlur"
          @confirm="onConfirm"
        />
        <view v-if="showClear" class="dd-field__clear" @click="onClear"><dd-icon name="cross" /></view>
      </view>
    </view>
    <view v-if="errorMessage || showWordLimit" class="dd-field__footer">
      <text v-if="errorMessage" class="dd-field__error">{{ errorMessage }}</text>
      <text v-if="showWordLimit" class="dd-field__counter">{{ len }}/{{ maxlength }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  modelValue?: string | number
  type?: 'text' | 'textarea' | 'password' | 'number' | 'digit'
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  borderless?: boolean
  inputAlign?: 'left' | 'center' | 'right'
  clearable?: boolean
  maxlength?: number
  showWordLimit?: boolean
  autosize?: boolean
  error?: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  label: '',
  placeholder: '',
  disabled: false,
  required: false,
  borderless: false,
  inputAlign: 'left',
  clearable: false,
  maxlength: -1,
  showWordLimit: false,
  autosize: false,
  error: false,
  errorMessage: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'focus', val: Event): void
  (e: 'blur', val: Event): void
  (e: 'clear'): void
  (e: 'confirm', val: string): void
}>()

// ponytail: password 用 uni 原生 password 布尔属性跨端
const inputType = computed<'text' | 'number' | 'digit'>(() => {
  if (props.type === 'password') return 'text'
  if (props.type === 'text') return 'text'
  return props.type as 'number' | 'digit'
})
const isPassword = computed(() => props.type === 'password')
const errorState = computed(() => props.error || !!props.errorMessage)
const showClear = computed(() => props.clearable && !!props.modelValue && !props.disabled)
const showWordLimit = computed(() => props.showWordLimit && props.maxlength > 0)
const len = computed(() => String(props.modelValue ?? '').length)

function onInput(e: any) {
  emit('update:modelValue', e?.detail?.value ?? e?.target?.value ?? '')
}
function onFocus(e: Event) {
  emit('focus', e)
}
function onBlur(e: Event) {
  emit('blur', e)
}
function onConfirm(e: any) {
  const v = e?.detail?.value ?? e?.target?.value ?? ''
  emit('confirm', v)
}
function onClear() {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-field {
  background: transparent;
  padding: 16rpx 24rpx 0 32rpx;
  box-sizing: border-box;
  @include dd-hairline-bottom($dd-border-subtle);

  &__row {
    display: flex;
    align-items: flex-start;
    min-height: 112rpx;
  }

  &__label {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    width: 6.2em;
    min-height: 56rpx;
    font-size: 28rpx;
    color: $dd-text-secondary;
  }
  &__required {
    color: $dd-error-500;
    margin-right: 4rpx;
  }
  &__label-text {
    @include dd-ellipsis(1);
  }

  &__body {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
  }

  &__control {
    flex: 1;
    min-width: 0;
    font-size: 28rpx;
    color: $dd-text-primary;
    background: transparent;
    border: none;
  }
  &__textarea {
    padding: 16rpx 0;
    min-height: 60rpx;
    line-height: 1.5;
  }

  &__clear {
    @include dd-flex-center;
    flex-shrink: 0;
    width: 36rpx;
    height: 36rpx;
    margin-left: 16rpx;
    border-radius: $dd-radius-full;
    background: $dd-neutral-800;
    color: $dd-text-secondary;
    font-size: 24rpx;
    line-height: 1;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-height: 40rpx;
    padding-bottom: 8rpx;
  }
  &__error {
    flex: 1;
    font-size: 24rpx;
    color: $dd-error-500;
    @include dd-ellipsis(1);
  }
  &__counter {
    flex-shrink: 0;
    font-size: 24rpx;
    color: $dd-text-tertiary;
  }

  &--error {
    .dd-field__control {
      color: $dd-error-500;
    }
    .dd-field__label-text {
      color: $dd-error-500;
    }
  }

  &--disabled {
    opacity: 0.5;
    @include dd-no-touch;
  }

  &--borderless {
    &::after {
      display: none;
    }
  }
}
</style>
