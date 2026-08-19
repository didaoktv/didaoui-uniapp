<template>
  <view
    v-if="placeholder && fixed"
    class="dd-tabbar__placeholder"
    :class="{ 'dd-tabbar__placeholder--safe': safeAreaInsetBottom }"
  ></view>
  <view
    class="dd-tabbar"
    :class="{
      'dd-tabbar--fixed': fixed,
      'dd-tabbar--border': border,
      'dd-tabbar--safe': safeAreaInsetBottom,
    }"
  >
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'

interface Props {
  modelValue?: string | number
  fixed?: boolean
  border?: boolean
  placeholder?: boolean
  safeAreaInsetBottom?: boolean
  activeColor?: string
  inactiveColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  fixed: true,
  border: true,
  placeholder: true,
  safeAreaInsetBottom: true,
  activeColor: '#F5A623',
  inactiveColor: '#9E9E9E',
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | number): void
  (e: 'change', val: string | number): void
}>()

const counter = ref(0)

function register(): number {
  const idx = counter.value
  counter.value += 1
  return idx
}

function onItemClick(val: string | number) {
  if (val === props.modelValue) return
  emit('update:modelValue', val)
  emit('change', val)
}

const active = computed(() => props.modelValue)

provide('ddTabbar', {
  active,
  activeColor: computed(() => props.activeColor),
  inactiveColor: computed(() => props.inactiveColor),
  register,
  onItemClick,
})
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-tabbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 100rpx;
  background: $dd-surface;
  box-sizing: border-box;

  &--border {
    @include dd-hairline-top($dd-border-default);
  }

  &--safe {
    box-sizing: content-box;
    @include dd-safe-area-bottom;
  }

  &--fixed {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: $dd-z-index-sticky;
  }
}

.dd-tabbar__placeholder {
  width: 100%;
  height: 100rpx;
  box-sizing: content-box;

  &--safe {
    @include dd-safe-area-bottom;
  }
}
</style>
