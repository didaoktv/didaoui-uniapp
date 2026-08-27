<template>
  <view
    class="dd-overlay"
    :class="{ 'dd-overlay--show': modelValue }"
    :style="{ zIndex: zIndex, '--dd-overlay-duration': `${duration}s` }"
    @click="onClick"
    @touchmove="onTouchMove"
    @touchmove.stop.prevent="onTouchMove"
  >
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { watch } from 'vue'

interface Props {
  modelValue?: boolean
  lockScroll?: boolean
  zIndex?: number
  duration?: number
  closeOnClickOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  lockScroll: true,
  zIndex: 2000,
  duration: 0.3,
  closeOnClickOverlay: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'click'): void
}>()

// 模块级引用计数器：堆叠 overlay 时正确解锁 (ponytail: 全局计数，多实例共享)
let ddOverlayLockCount = 0
// 确保多组件实例共享同一计数：挂在全局对象上
const g: any = typeof globalThis !== 'undefined' ? globalThis : ({} as any)
if (g.__DD_OVERLAY_LOCK_COUNT__ === undefined) {
  g.__DD_OVERLAY_LOCK_COUNT__ = 0
}

function lockScroll() {
  if (!props.lockScroll) return
  if (g.__DD_OVERLAY_LOCK_COUNT__ === 0) {
    // #ifdef H5
    document.body.style.overflow = 'hidden'
    // #endif
  }
  g.__DD_OVERLAY_LOCK_COUNT__++
}

function unlockScroll() {
  if (!props.lockScroll) return
  if (g.__DD_OVERLAY_LOCK_COUNT__ > 0) {
    g.__DD_OVERLAY_LOCK_COUNT__--
    if (g.__DD_OVERLAY_LOCK_COUNT__ === 0) {
      // #ifdef H5
      document.body.style.overflow = ''
      // #endif
    }
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) lockScroll()
    else unlockScroll()
  }
)

function onClick() {
  emit('click')
  if (props.closeOnClickOverlay) {
    emit('update:modelValue', false)
  }
}

function onTouchMove() {
  // MP: catch touchmove 阻止背景滚动穿透 (touchmove.stop.prevent 已在模板处理)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-overlay {
  position: fixed;
  inset: 0;
  background: var(--dd-color-overlay-strong, #{$dd-color-overlay-strong});
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  // visibility 延迟过渡：opacity 先淡出，再隐藏 (ponytail: 离散属性需 transition-delay)
  transition: opacity var(--dd-overlay-duration, 0.3s) ease,
              visibility 0s linear var(--dd-overlay-duration, 0.3s);

  &--show {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transition: opacity var(--dd-overlay-duration, 0.3s) ease,
                visibility 0s linear 0s;
  }
}
</style>
