<template>
  <view class="dd-collapse">
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue'

type Val = string | number
type Model = Val | Val[]

interface Props {
  modelValue?: Model
  accordion?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  accordion: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: Model): void
  (e: 'change', val: Model): void
}>()

const normalized = computed<Val[]>(() => {
  const v = props.modelValue
  if (v === '' || v === null || v === undefined) return []
  return Array.isArray(v) ? [...v] : [v as Val]
})

function isExpanded(name: Val): boolean {
  return normalized.value.includes(name)
}

function toggle(name: Val) {
  if (props.accordion) {
    const next: Model = isExpanded(name) ? '' : name
    emit('update:modelValue', next)
    emit('change', next)
  } else {
    const set = new Set(normalized.value)
    if (set.has(name)) set.delete(name)
    else set.add(name)
    const next = Array.from(set)
    emit('update:modelValue', next)
    emit('change', next)
  }
}

provide('ddCollapse', { isExpanded, toggle })
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-collapse {
  background: var(--dd-surface, #{$dd-surface});
}
</style>
