<template>
  <view class="dd-steps" :class="[`dd-steps--${direction}`]">
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'

interface Props {
  /** 当前激活步骤 (0-indexed) */
  active?: number
  direction?: 'horizontal' | 'vertical'
  activeColor?: string
  inactiveColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  active: 0,
  direction: 'horizontal',
  activeColor: '',
  inactiveColor: '',
})

const count = ref(0)

// ponytail: register 依赖子组件 setup 执行顺序 (父→子，Vue 一般稳定)
function register(): number {
  const idx = count.value
  count.value += 1
  return idx
}

provide('ddSteps', {
  active: computed(() => props.active),
  direction: computed(() => props.direction),
  activeColor: computed(() => props.activeColor || '#F5A623'),
  inactiveColor: computed(() => props.inactiveColor || '#9E9E9E'),
  count,
  register,
})
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-steps {
  width: 100%;

  &--horizontal {
    display: flex;
    align-items: flex-start;
  }

  &--vertical {
    display: flex;
    flex-direction: column;
  }
}
</style>
