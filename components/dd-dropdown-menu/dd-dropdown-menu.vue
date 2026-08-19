<template>
  <view class="dd-dropdown" :class="{ 'dd-dropdown--active': activeId !== null }" ref="rootRef">
    <view class="dd-dropdown__bar">
      <slot></slot>
    </view>
    <view
      v-if="overlay"
      class="dd-dropdown__overlay"
      :class="{ 'dd-dropdown__overlay--show': activeId !== null }"
      :style="overlayStyle"
      @click="onOverlayClick"
    ></view>
  </view>
</template>

<script lang="ts">
// 整页级别互斥：同时只允许一个 dd-dropdown-menu 展开下拉
// ponytail: 模块级单例变量，跨实例共享；页面切换时组件 onUnmounted 会清空，无泄漏
let activeMenuClose: (() => void) | null = null
</script>

<script setup lang="ts">
import { getCurrentInstance, onMounted, onUnmounted, provide, reactive, ref } from 'vue'

interface Props {
  activeColor?: string
  direction?: 'down' | 'up'
  overlay?: boolean
  closeOnClickOverlay?: boolean
  closeOnClickOutside?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  activeColor: '#F5A623',
  direction: 'down',
  overlay: true,
  closeOnClickOverlay: true,
  closeOnClickOutside: true,
})

const emit = defineEmits<{ (e: 'change', id: number): void }>()

const activeId = ref<number | null>(null)
const counter = ref(0)
const barRect = reactive({ top: 0, bottom: 0, height: 0 })
const overlayStyle = ref({})
const rootRef = ref<any>(null)
const instance = getCurrentInstance()

function register(): number {
  const id = counter.value
  counter.value += 1
  return id
}

function measureBar() {
  const query = uni.createSelectorQuery().in(instance)
  query
    .select('.dd-dropdown__bar')
    .boundingClientRect((rect) => {
      const r = rect as UniApp.NodeInfo
      if (!r) return
      barRect.top = r.top || 0
      barRect.bottom = r.bottom || 0
      barRect.height = r.height || 0
      const winH = uni.getWindowInfo?.().windowHeight || 667
      if (props.direction === 'down') {
        overlayStyle.value = {
          top: barRect.bottom + 'px',
          bottom: '0',
        }
      } else {
        overlayStyle.value = {
          top: '0',
          bottom: winH - barRect.top + 'px',
        }
      }
    })
    .exec()
}

function toggle(id: number) {
  if (activeId.value === id) {
    close()
  } else {
    if (activeMenuClose && activeMenuClose !== close) activeMenuClose()
    activeId.value = id
    activeMenuClose = close
    measureBar()
  }
}

function close() {
  activeId.value = null
  if (activeMenuClose === close) activeMenuClose = null
}

function onOverlayClick() {
  if (props.closeOnClickOverlay) close()
}

provide('ddDropdown', {
  activeId,
  direction: props.direction,
  activeColor: props.activeColor,
  barRect,
  register,
  toggle,
  close,
})

onMounted(measureBar)
onUnmounted(() => {
  if (activeMenuClose === close) activeMenuClose = null
})

// H5 outside click
// #ifdef H5
function onDocClick(e: MouseEvent) {
  if (activeId.value === null) return
  if (!props.closeOnClickOutside) return
  // trigger / option 自有 click 处理，内部点击不在此关闭
  if (rootRef.value?.contains(e.target as Node)) return
  close()
}
onMounted(() => {
  document.addEventListener('click', onDocClick)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
})
// #endif
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-dropdown {
  position: relative;
  width: 100%;

  // 激活时整体抬高层级，避免被同页其他菜单的 bar 盖住 panel
  &--active {
    z-index: 100;
  }
}

.dd-dropdown__bar {
  position: relative;
  z-index: 11;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 96rpx;
  background: $dd-surface;
  @include dd-hairline-bottom($dd-border-subtle);
}

.dd-dropdown__overlay {
  position: fixed;
  left: 0;
  right: 0;
  background: $dd-glass-bg;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 9;
  opacity: 0;
  visibility: hidden;
  @include dd-transition(opacity 0.3s, visibility 0.3s);

  &--show {
    opacity: 1;
    visibility: visible;
  }
}
</style>
