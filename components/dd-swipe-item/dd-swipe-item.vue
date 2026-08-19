<template>
  <swiper-item class="dd-swipe-item">
    <slot></slot>
  </swiper-item>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted } from 'vue'

// inject 父级 dd-swipe 的注册器；不在 dd-swipe 内时为 null，静默忽略
const swipe = inject<{ register: () => void; unregister: () => void } | null>('ddSwipe', null)

onMounted(() => {
  swipe?.register()
})

onUnmounted(() => {
  swipe?.unregister()
})
</script>

<style lang="scss" scoped>
.dd-swipe-item {
  width: 100%;
  height: 100%;
}
</style>
