<template>
  <view class="dd-popup" :style="{ '--dd-popup-duration': `${props.duration}s` }">
    <view
      v-if="visible && overlay"
      class="dd-popup__overlay"
      :class="{ 'dd-popup__overlay--show': showClass }"
      :style="{ zIndex: overlayZIndex }"
      @click="onOverlayClick"
      @touchmove.stop.prevent="noop"
    ></view>
    <view
      v-if="visible"
      class="dd-popup__panel"
      :class="[
        `dd-popup__panel--${position}`,
        { 'dd-popup__panel--show': showClass, 'dd-popup__panel--round': round }
      ]"
      :style="panelStyle"
    >
      <view v-if="closeable" class="dd-popup__close" :class="`dd-popup__close--${closeIconPosition}`" @click="onCloseIcon">
        <dd-icon name="cross" />
      </view>
      <view v-if="position === 'bottom' && safeAreaInsetBottom" class="dd-popup__safe-bottom"></view>
      <slot></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted, nextTick } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  modelValue?: boolean
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  round?: boolean
  overlay?: boolean
  closeable?: boolean
  closeIconPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  safeAreaInsetBottom?: boolean
  duration?: number
  width?: string
  height?: string
  closeOnClickOverlay?: boolean
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  position: 'bottom',
  round: false,
  overlay: true,
  closeable: false,
  closeIconPosition: 'top-right',
  safeAreaInsetBottom: true,
  duration: 0.3,
  width: '',
  height: '',
  closeOnClickOverlay: true,
  zIndex: 2000,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'opened'): void
  (e: 'closed'): void
  (e: 'click-overlay'): void
  (e: 'click-close-icon'): void
}>()

const overlayZIndex = computed(() => props.zIndex)
const panelZIndex = computed(() => props.zIndex + 1)

const panelStyle = computed(() => {
  const s: Record<string, string> = {
    zIndex: String(panelZIndex.value),
  }
  if (props.width && (props.position === 'left' || props.position === 'right')) {
    s.width = props.width
  }
  if (props.height && (props.position === 'top' || props.position === 'bottom')) {
    s.height = props.height
  }
  return s
})

// 两阶段控制：visible 控制挂载，showClass 控制动画
const visible = ref(false)
const showClass = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.modelValue,
  async (val) => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    if (val) {
      // Phase 1: 挂载到 DOM（初始态：translateX/Y 离屏 / scale(0.9)）
      visible.value = true
      emit('open')

      // Phase 2: 双 RAF 确保 paint 初始帧，再加 show class
      await nextTick()
      await new Promise<void>(r => requestAnimationFrame(() => r()))
      await new Promise<void>(r => requestAnimationFrame(() => r()))
      showClass.value = true
      timer = setTimeout(() => emit('opened'), props.duration * 1000)
    } else {
      if (!visible.value) return

      // 关闭：移除 show class 触发退出过渡，等动画结束再卸载
      showClass.value = false
      emit('close')
      timer = setTimeout(() => {
        visible.value = false
        emit('closed')
      }, props.duration * 1000)
    }
  },
  { immediate: true }
)

function noop() {}

function close() {
  emit('update:modelValue', false)
}

function onOverlayClick() {
  emit('click-overlay')
  if (props.closeOnClickOverlay) close()
}

function onCloseIcon() {
  emit('click-close-icon')
  close()
}

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-popup {
  &__overlay {
    position: fixed;
    inset: 0;
    background: var(--dd-color-overlay-strong, #{$dd-color-overlay-strong});
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    opacity: 0;
    transition: opacity var(--dd-popup-duration, 0.3s) ease;

    &--show {
      opacity: 1;
    }
  }

  &__panel {
    position: fixed;
    background: var(--dd-bg-elevated, #{$dd-bg-elevated});
    box-shadow: var(--dd-shadow-3, #{$dd-shadow-3});
    transition: transform var(--dd-popup-duration, 0.3s) ease,
                opacity var(--dd-popup-duration, 0.3s) ease;

    &--top {
      top: 0;
      left: 0;
      right: 0;
      transform: translateY(-100%);
      &.dd-popup__panel--round { border-radius: 0 0 $dd-radius-lg $dd-radius-lg; }
      &.dd-popup__panel--show { transform: translateY(0); }
    }

    &--bottom {
      bottom: 0;
      left: 0;
      right: 0;
      transform: translateY(100%);
      &.dd-popup__panel--round { border-radius: $dd-radius-lg $dd-radius-lg 0 0; }
      &.dd-popup__panel--show { transform: translateY(0); }
    }

    &--left {
      top: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      &.dd-popup__panel--round { border-radius: 0 $dd-radius-lg $dd-radius-lg 0; }
      &.dd-popup__panel--show { transform: translateX(0); }
    }

    &--right {
      top: 0;
      bottom: 0;
      right: 0;
      transform: translateX(100%);
      &.dd-popup__panel--round { border-radius: $dd-radius-lg 0 0 $dd-radius-lg; }
      &.dd-popup__panel--show { transform: translateX(0); }
    }

    &--center {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      opacity: 0;
      &.dd-popup__panel--round { border-radius: $dd-radius-lg; }
      &.dd-popup__panel--show {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }
  }

  &__close {
    position: absolute;
    width: 56rpx;
    height: 56rpx;
    color: var(--dd-text-tertiary, #{$dd-text-tertiary});
    font-size: 44rpx;
    @include dd-flex-center;
    z-index: 2;

    &--top-left { top: $dd-space-2; left: $dd-space-2; }
    &--top-right { top: $dd-space-2; right: $dd-space-2; }
    &--bottom-left { bottom: $dd-space-2; left: $dd-space-2; }
    &--bottom-right { bottom: $dd-space-2; right: $dd-space-2; }
  }

  &__safe-bottom {
    @include dd-safe-area-bottom;
  }
}
</style>
