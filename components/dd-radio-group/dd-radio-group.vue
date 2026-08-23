<template>
  <view class="dd-radio-group" :class="{ 'dd-radio-group--vertical': direction === 'vertical' }">
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { provide } from 'vue'

interface Props {
  modelValue?: any
  disabled?: boolean
  direction?: 'horizontal' | 'vertical'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  disabled: false,
  direction: 'horizontal',
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: any): void
  (e: 'change', val: any): void
}>()

provide('dd-radio-group', {
  props,
  toggle(value: any) {
    if (props.modelValue === value) return
    emit('update:modelValue', value)
    emit('change', value)
  },
})
</script>

<style lang="scss" scoped>
@import '../../scss/variables';

.dd-radio-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $dd-space-4;
  width: 100%;

  &--vertical {
    flex-direction: column;
    align-items: flex-start;
    gap: $dd-space-3;
  }
}
</style>
