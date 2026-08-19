<template>
  <view
    class="dd-sticky"
    :class="{ 'dd-sticky--disabled': disabled }"
    :style="stickyStyle"
  >
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, onUnmounted, ref } from 'vue'

interface Props {
  offsetTop?: number // rpx
  zIndex?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  offsetTop: 0,
  zIndex: 99,
  disabled: false,
})

const emit = defineEmits<{ (e: 'change', val: { isFixed: boolean; scrollTop: number }): void }>()

const isFixed = ref(false)

const stickyStyle = computed(() => {
  if (props.disabled) {
    return { position: 'static' as const, top: 'auto' }
  }
  return {
    position: 'sticky' as const,
    top: `${props.offsetTop}rpx`,
    zIndex: props.zIndex,
    width: '100%',
  }
})

let observer: any = null
const instance = getCurrentInstance()

function rpxToPx(rpx: number): number {
  try {
    const info = uni.getWindowInfo()
    return (rpx / 750) * info.windowWidth
  } catch {
    return rpx / 2
  }
}

onMounted(() => {
  if (props.disabled) return
  // #ifdef H5
  setupH5Observer()
  // #endif
  // #ifndef H5
  setupMPObserver()
  // #endif
})

// H5: 使用原生 IntersectionObserver API
function setupH5Observer() {
  // #ifdef H5
  const el = document.querySelector('.dd-sticky')
  if (!el) return
  const px = rpxToPx(props.offsetTop)
  const io = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      const fixed = entry.boundingClientRect.top <= px + 1
      if (fixed !== isFixed.value) {
        isFixed.value = fixed
        emit('change', { isFixed: fixed, scrollTop: window.scrollY })
      }
    },
    { rootMargin: `-${px}px 0px 0px 0px`, threshold: [0, 1] }
  )
  io.observe(el)
  observer = io
  // #endif
}

// MP/App: 使用 uni IntersectionObserver, 需传入组件实例
function setupMPObserver() {
  // #ifndef H5
  const px = rpxToPx(props.offsetTop)
  const obs = uni.createIntersectionObserver(instance, {
    thresholds: [0, 1],
  })
  obs.relativeToViewport({ top: -px, bottom: 0 })
  obs.observe('.dd-sticky', (res: any) => {
    const fixed = res.boundingClientRect.top <= px + 1
    if (fixed !== isFixed.value) {
      isFixed.value = fixed
      emit('change', { isFixed: fixed, scrollTop: 0 })
    }
  })
  observer = obs
  // #endif
}

onUnmounted(() => {
  if (observer) {
    // #ifdef H5
    observer.disconnect()
    // #endif
    // #ifndef H5
    observer.disconnect()
    // #endif
    observer = null
  }
})

defineExpose({ isFixed })
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-sticky {
  font-family: $dd-font-body;

  &--disabled {
    position: static;
    top: auto;
  }
}
</style>
