<template>
  <view class="dd-search" :class="{ 'dd-search--disabled': disabled }">
    <view
      class="dd-search__wrap"
      :class="{ 'dd-search__wrap--focus': isFocused, 'dd-search__wrap--square': !round }"
    >
      <dd-icon name="search" class="dd-search__icon" :class="{ 'dd-search__icon--focus': isFocused }" />
      <input
        class="dd-search__inner"
        type="text"
        :value="modelValue"
        :placeholder="placeholder"
        placeholder-style="color:#9E9E9E"
        :disabled="disabled"
        :focus="focusFlag"
        confirm-type="search"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @confirm="onConfirm"
      />
      <view v-if="showClear" class="dd-search__clear" @click="onClear"><dd-icon name="cross" /></view>
    </view>
    <text v-if="showCancel" class="dd-search__cancel" @click="onCancel">取消</text>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  modelValue?: string
  placeholder?: string
  round?: boolean
  showCancel?: boolean
  autofocus?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '搜索歌曲、歌手',
  round: true,
  showCancel: false,
  autofocus: false,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'focus', val: Event): void
  (e: 'blur', val: Event): void
  (e: 'clear'): void
  (e: 'search', val: string): void
  (e: 'cancel'): void
}>()

const isFocused = ref(false)
const focusFlag = ref(false)
const showClear = computed(() => !!props.modelValue && !props.disabled)

onMounted(() => {
  if (props.autofocus) focusFlag.value = true
})

function onInput(e: any) {
  emit('update:modelValue', e?.detail?.value ?? e?.target?.value ?? '')
}
function onFocus(e: Event) {
  isFocused.value = true
  emit('focus', e)
}
function onBlur(e: Event) {
  isFocused.value = false
  emit('blur', e)
}
function onConfirm(e: any) {
  const v = e?.detail?.value ?? e?.target?.value ?? ''
  emit('search', v)
}
function onClear() {
  emit('update:modelValue', '')
  emit('clear')
  // ponytail: 清除后通过 :focus 标志位翻转重新聚焦，低端机时序可靠性未知
  focusFlag.value = false
  nextTick(() => {
    focusFlag.value = true
  })
}
function onCancel() {
  emit('cancel')
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-search {
  display: flex;
  align-items: center;
  gap: 16rpx;

  &__wrap {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 16rpx;
    height: 88rpx;
    padding: 0 24rpx;
    background: $dd-neutral-800;
    border: 1px solid $dd-neutral-700;
    border-radius: $dd-radius-full;
    box-sizing: border-box;
    @include dd-transition(border-color 0.2s, box-shadow 0.2s);

    &--square {
      border-radius: $dd-radius-md;
    }

    &--focus {
      border-color: $dd-primary-500;
      box-shadow: $dd-shadow-glow-gold-lg;
    }
  }

  &__icon {
    font-size: 28rpx;
    color: $dd-neutral-400;
    line-height: 1;
    @include dd-transition(color 0.2s);

    &--focus {
      color: $dd-primary-400;
    }
  }

  &__inner {
    flex: 1;
    min-width: 0;
    height: 100%;
    font-size: 28rpx;
    color: $dd-neutral-100;
    background: transparent;
    border: none;
  }

  &__clear {
    @include dd-flex-center;
    width: 36rpx;
    height: 36rpx;
    border-radius: 50%;
    background: $dd-neutral-800;
    color: $dd-neutral-300;
    font-size: 24rpx;
    line-height: 1;
  }

  &__cancel {
    flex-shrink: 0;
    padding: 0 8rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: $dd-primary-400;
  }

  &--disabled {
    opacity: 0.4;
    @include dd-no-touch;
    .dd-search__icon {
      color: $dd-neutral-600;
    }
  }
}
</style>
