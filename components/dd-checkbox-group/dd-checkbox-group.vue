<template>
  <view
    class="dd-checkbox-group"
    :class="{ 'dd-checkbox-group--vertical': direction === 'vertical' }"
  >
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue'

interface Props {
  modelValue?: any[]
  disabled?: boolean
  direction?: 'horizontal' | 'vertical'
  /** 选中数达到 max 后禁止再选（已选项仍可取消） */
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  disabled: false,
  direction: 'horizontal',
  max: 0,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: any[]): void
  (e: 'change', val: any[]): void
}>()

const isMaxed = computed(() => props.max > 0 && props.modelValue.length >= props.max)

provide('dd-checkbox-group', {
  props,
  isMaxed,
  toggle(value: any) {
    const arr = props.modelValue.slice()
    const idx = arr.indexOf(value)
    if (idx >= 0) {
      arr.splice(idx, 1)
    } else {
      if (isMaxed.value) return
      arr.push(value)
    }
    emit('update:modelValue', arr)
    emit('change', arr)
  },
})
</script>

<style lang="scss" scoped>
.dd-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 32rpx;
  width: 100%;

  &--vertical {
    flex-direction: column;
    align-items: flex-start;
    gap: 24rpx;
  }
}
</style>
