<script lang="ts">
// 模块级单例：同时只允许一个 modal 打开
let activeModalClose: (() => void) | null = null
</script>

<template>
  <view class="dd-modal">
    <view
      v-if="visible"
      class="dd-modal__mask"
      :class="{ 'dd-modal__mask--show': showClass }"
      @click="onMaskClick"
    ></view>

    <!-- dialog -->
    <view
      v-if="visible && type === 'dialog'"
      class="dd-modal__dialog"
      :class="{ 'dd-modal__dialog--show': showClass }"
      :style="{ width: widthValue }"
    >
      <view v-if="$slots.header || title" class="dd-modal__header">
        <slot name="header">
          <text class="dd-modal__title">{{ title }}</text>
        </slot>
        <view v-if="showClose" class="dd-modal__close" @click="onClose">
          <dd-icon name="cross" />
        </view>
      </view>
      <view class="dd-modal__body">
        <slot></slot>
      </view>
      <view v-if="$slots.footer" class="dd-modal__footer">
        <slot name="footer"></slot>
      </view>
    </view>

    <!-- bottom-sheet -->
    <view
      v-else-if="visible"
      class="dd-modal__sheet"
      :class="{ 'dd-modal__sheet--show': showClass }"
    >
      <view class="dd-modal__handle"></view>
      <view v-if="$slots.header || title" class="dd-modal__header">
        <slot name="header">
          <text class="dd-modal__title">{{ title }}</text>
        </slot>
      </view>
      <view class="dd-modal__body">
        <slot></slot>
      </view>
      <view v-if="$slots.footer" class="dd-modal__footer">
        <slot name="footer"></slot>
      </view>
      <view class="dd-modal__safe-bottom"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted, nextTick } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  modelValue?: boolean
  type?: 'dialog' | 'bottom-sheet'
  title?: string
  width?: string | number
  showClose?: boolean
  closeOnClickModal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  type: 'dialog',
  title: '',
  width: '600rpx',
  showClose: true,
  closeOnClickModal: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'close'): void
  (e: 'open'): void
  (e: 'opened'): void
  (e: 'closed'): void
}>()

const widthValue = computed(() =>
  typeof props.width === 'number' ? `${props.width}rpx` : props.width
)

const animDuration = computed(() =>
  props.type === 'bottom-sheet' ? 300 : 250
)

// 两阶段控制：visible 控制挂载，showClass 控制动画
const visible = ref(false)
const showClass = ref(false)
let myClose: (() => void) | null = null
let timer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.modelValue,
  async (val) => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    if (val) {
      // 互斥：关闭其他打开的 modal
      if (activeModalClose) activeModalClose()
      myClose = () => emit('update:modelValue', false)
      activeModalClose = myClose

      // Phase 1: 挂载元素到 DOM（初始态：opacity:0 / scale(0.9)）
      visible.value = true
      emit('open')

      // Phase 2: 双 RAF 确保浏览器已 paint 初始帧，再加 show class
      await nextTick()
      await new Promise<void>(r => requestAnimationFrame(r))
      await new Promise<void>(r => requestAnimationFrame(r))
      showClass.value = true
      timer = setTimeout(() => emit('opened'), animDuration.value)
    } else {
      if (!visible.value) return

      // 关闭：先移除 show class 触发退出过渡，等动画结束再卸载
      showClass.value = false
      if (activeModalClose === myClose) {
        activeModalClose = null
      }
      myClose = null
      emit('close')
      timer = setTimeout(() => {
        visible.value = false
        emit('closed')
      }, animDuration.value)
    }
  },
  { immediate: true }
)

function onMaskClick() {
  if (!props.closeOnClickModal) return
  onClose()
}

function onClose() {
  emit('update:modelValue', false)
}

onUnmounted(() => {
  if (timer) clearTimeout(timer)
  if (activeModalClose === myClose) {
    activeModalClose = null
  }
})
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-modal {
  &__mask {
    position: fixed;
    inset: 0;
    background: $dd-glass-bg;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    opacity: 0;
    z-index: 1000;
    transition: opacity 0.25s ease;

    &--show {
      opacity: 1;
    }
  }

  // dialog: 实心 elevated 背景 (非 glass)
  &__dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.9);
    opacity: 0;
    z-index: 1001;
    max-width: 720rpx; // 360px 上限
    max-height: 80vh;
    background: $dd-bg-elevated;
    border: 1px solid $dd-border-default;
    border-radius: $dd-radius-xl;
    box-shadow: $dd-shadow-4;
    padding: $dd-space-4 $dd-space-5;
    display: flex;
    flex-direction: column;
    transition: transform 0.25s ease, opacity 0.25s ease;

    &--show {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }

  // bottom-sheet
  &__sheet {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    transform: translateY(100%);
    z-index: 1001;
    max-height: 85vh;
    background: $dd-bg-elevated;
    border: 1px solid $dd-border-default;
    border-radius: $dd-radius-xl $dd-radius-xl 0 0;
    box-shadow: $dd-shadow-4;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease-out;

    &--show {
      transform: translateY(0);
    }
  }

  &__handle {
    width: 72rpx;
    height: 8rpx;
    border-radius: $dd-radius-full;
    background: $dd-neutral-700;
    margin: 16rpx auto 8rpx;
    flex-shrink: 0;
  }

  &__header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $dd-space-3 0;
    flex-shrink: 0;
  }

  &__title {
    font-size: $dd-font-size-h4;
    font-weight: $dd-font-weight-h4;
    color: $dd-text-primary;
  }

  &__close {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 64rpx;
    height: 64rpx;
    border-radius: $dd-radius-full;
    background: $dd-gradient-primary;
    color: $dd-neutral-900;
    font-size: 36rpx;
    @include dd-flex-center;
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: $dd-space-2 0;
  }

  &__footer {
    flex-shrink: 0;
    padding-top: $dd-space-3;
  }

  &__safe-bottom {
    @include dd-safe-area-bottom;
    flex-shrink: 0;
  }
}
</style>
