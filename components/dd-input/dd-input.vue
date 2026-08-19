<template>
  <view
    class="dd-input"
    :class="{
      'dd-input--focus': isFocused,
      'dd-input--error': error,
      'dd-input--disabled': disabled,
    }"
  >
    <slot name="prefix"></slot>
    <input
      class="dd-input__inner"
      :type="inputType"
      :password="isPassword"
      :value="modelValue"
      :placeholder="placeholder"
      placeholder-style="color:#9E9E9E"
      :disabled="disabled"
      :maxlength="maxlength"
      :confirm-type="confirmType"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @confirm="onConfirm"
    />
    <view class="dd-input__suffix" v-if="showClear || showToggle || $slots.suffix">
      <view v-if="showClear" class="dd-input__clear" @click="onClear"><dd-icon name="cross" /></view>
      <dd-icon v-if="showToggle" :name="visible ? 'eye' : 'closed-eye'" class="dd-input__toggle" @click="toggleVisible" />
      <slot name="suffix"></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  modelValue?: string | number
  type?: 'text' | 'password' | 'search' | 'number'
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  showPassword?: boolean
  error?: boolean
  maxlength?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  disabled: false,
  clearable: false,
  showPassword: false,
  error: false,
  maxlength: -1,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'focus', val: Event): void
  (e: 'blur', val: Event): void
  (e: 'clear'): void
  (e: 'confirm', val: string): void
  (e: 'search', val: string): void
}>()

const isFocused = ref(false)
const visible = ref(false)

// ponytail: search/number 在小程序降级处理；password 用 uni 原生 password 布尔属性跨端
const inputType = computed<'text' | 'number'>(() => {
  if (props.type === 'password' || props.type === 'search') return 'text'
  return 'number'
})
const isPassword = computed(() => props.type === 'password' && !visible.value)
const confirmType = computed(() => (props.type === 'search' ? 'search' : 'done'))
const showClear = computed(() => props.clearable && !!props.modelValue && !props.disabled)
const showToggle = computed(() => props.type === 'password' && props.showPassword)

function onInput(e: any) {
  const v = e?.detail?.value ?? e?.target?.value ?? ''
  emit('update:modelValue', v)
}
function onFocus(e: Event) {
  isFocused.value = true
  emit('focus', e)
}
function onBlur(e: Event) {
  isFocused.value = false
  emit('blur', e)
}
function onClear() {
  emit('update:modelValue', '')
  emit('clear')
}
function onConfirm(e: any) {
  const v = e?.detail?.value ?? e?.target?.value ?? ''
  emit('confirm', v)
  if (props.type === 'search') emit('search', v)
}
function toggleVisible() {
  visible.value = !visible.value
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-input {
  display: flex;
  align-items: center;
  gap: 16rpx;
  height: 88rpx;
  padding: 0 32rpx;
  background: $dd-neutral-800;
  border: 1px solid $dd-neutral-700;
  border-radius: $dd-radius-md;
  box-sizing: border-box;
  @include dd-transition(border-color 0.2s, box-shadow 0.2s);

  &__inner {
    flex: 1;
    min-width: 0;
    height: 100%;
    font-size: 28rpx;
    color: $dd-neutral-100;
    background: transparent;
    border: none;
  }

  &__suffix {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  &__clear {
    @include dd-flex-center;
    width: 36rpx;
    height: 36rpx;
    border-radius: 50%;
    background: $dd-neutral-700;
    color: $dd-neutral-300;
    font-size: 24rpx;
    line-height: 1;
  }

  &__toggle {
    font-size: 32rpx;
    opacity: 0.7;
    line-height: 1;
  }

  &--focus {
    border-color: $dd-primary-500;
    box-shadow: $dd-shadow-glow-gold-lg;
  }

  &--error {
    border-color: $dd-error-500;
    box-shadow: $dd-shadow-glow-error-md;
  }

  &--disabled {
    opacity: 0.5;
    @include dd-no-touch;
  }
}
</style>
