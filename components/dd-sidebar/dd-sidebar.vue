<template>
  <view class="dd-sidebar">
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'

interface Props {
  /** 当前选中项的索引（v-model） */
  modelValue?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: number): void
  (e: 'change', val: number): void
}>()

const counter = ref(0)

function register(): number {
  const idx = counter.value
  counter.value += 1
  return idx
}

function onItemClick(idx: number) {
  if (idx === props.modelValue) return
  emit('update:modelValue', idx)
  emit('change', idx)
}

provide('ddSidebar', {
  active: computed(() => props.modelValue),
  register,
  onItemClick,
})
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-sidebar {
  display: flex;
  flex-direction: column;
  background: var(--dd-bg-section, #{$dd-bg-section});
}
</style>
