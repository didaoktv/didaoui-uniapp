<template>
  <view class="dd-swipe-action" :class="{ 'dd-swipe-action--disabled': disabled }">
    <!-- 左侧操作层 (右滑露出) -->
    <view class="dd-swipe-action__actions dd-swipe-action__actions--left" :style="{ width: leftWidthPx + 'px' }">
      <view
        v-for="(action, i) in leftActions"
        :key="'l' + i"
        class="dd-swipe-action__btn"
        :style="{ width: actionWidthPx + 'px', background: action.color || defaultActionColor }"
        @click="onActionClick('left', i, action)"
      >
        <dd-icon v-if="action.icon" :name="action.icon" class="dd-swipe-action__icon" />
        <text class="dd-swipe-action__label">{{ action.text }}</text>
      </view>
    </view>
    <!-- 右侧操作层 (左滑露出) -->
    <view class="dd-swipe-action__actions dd-swipe-action__actions--right" :style="{ width: rightWidthPx + 'px' }">
      <view
        v-for="(action, i) in rightActions"
        :key="'r' + i"
        class="dd-swipe-action__btn"
        :style="{ width: actionWidthPx + 'px', background: action.color || defaultActionColor }"
        @click="onActionClick('right', i, action)"
      >
        <dd-icon v-if="action.icon" :name="action.icon" class="dd-swipe-action__icon" />
        <text class="dd-swipe-action__label">{{ action.text }}</text>
      </view>
    </view>
    <!-- 内容层 (前置，可平移) -->
    <view
      class="dd-swipe-action__content"
      :class="{ 'dd-swipe-action__content--anim': animating }"
      :style="{ transform: `translateX(${translateX}px)` }"
      @touchstart="onTouchStart"
      @touchmove.stop.prevent="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
    >
      <slot></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface SwipeAction {
  text?: string
  icon?: string
  color?: string
}

interface Props {
  leftActions?: SwipeAction[]
  rightActions?: SwipeAction[]
  disabled?: boolean
  actionWidth?: number // rpx
  threshold?: number
  damping?: number
}

const props = withDefaults(defineProps<Props>(), {
  leftActions: () => [],
  rightActions: () => [],
  disabled: false,
  actionWidth: 144,
  threshold: 0.33,
  damping: 0.3,
})

const emit = defineEmits<{
  (e: 'click', payload: { side: 'left' | 'right'; index: number; action: SwipeAction }): void
  (e: 'open', side: 'left' | 'right'): void
  (e: 'close'): void
}>()

// 默认操作色用 error 红 ($dd-error-500)
const defaultActionColor = '#E53935'

const translateX = ref(0)
const animating = ref(false)

let startX = 0
let startTranslate = 0
let dragging = false
let moved = false

const actionWidthPx = computed(() => rpxToPx(props.actionWidth))
const leftWidthPx = computed(() => actionWidthPx.value * props.leftActions.length)
const rightWidthPx = computed(() => actionWidthPx.value * props.rightActions.length)

function rpxToPx(rpx: number): number {
  try {
    const info = uni.getWindowInfo()
    return (rpx / 750) * info.windowWidth
  } catch {
    return rpx / 2
  }
}

function onTouchStart(e: any) {
  if (props.disabled) return
  dragging = true
  moved = false
  animating.value = false
  startX = e.touches?.[0]?.clientX ?? 0
  startTranslate = translateX.value
}

function onTouchMove(e: any) {
  if (!dragging || props.disabled) return
  const x = e.touches?.[0]?.clientX ?? 0
  let delta = x - startX
  if (Math.abs(delta) > 4) moved = true
  let next = startTranslate + delta
  // 边界阻尼：超出左/右操作宽度时按 (1-damping) 衰减
  if (next > leftWidthPx.value) {
    next = leftWidthPx.value + (next - leftWidthPx.value) * (1 - props.damping)
  }
  if (next < -rightWidthPx.value) {
    next = -rightWidthPx.value + (next + rightWidthPx.value) * (1 - props.damping)
  }
  translateX.value = next
}

function onTouchEnd() {
  if (!dragging) return
  dragging = false
  animating.value = true
  const cur = translateX.value
  // 轻点内容关闭已展开操作
  if (!moved) {
    if (cur !== 0) {
      translateX.value = 0
      emit('close')
    }
    return
  }
  // 0.33 阈值吸附
  const leftOpen = cur > leftWidthPx.value * props.threshold
  const rightOpen = cur < -rightWidthPx.value * props.threshold
  if (leftOpen && leftWidthPx.value > 0) {
    translateX.value = leftWidthPx.value
    emit('open', 'left')
  } else if (rightOpen && rightWidthPx.value > 0) {
    translateX.value = -rightWidthPx.value
    emit('open', 'right')
  } else {
    translateX.value = 0
    emit('close')
  }
}

function onActionClick(side: 'left' | 'right', index: number, action: SwipeAction) {
  emit('click', { side, index, action })
  animating.value = true
  translateX.value = 0
  emit('close')
}

function close() {
  animating.value = true
  translateX.value = 0
}

defineExpose({ close })
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-swipe-action {
  position: relative;
  overflow: hidden;
  background: $dd-bg-elevated;

  &--disabled {
    .dd-swipe-action__content {
      pointer-events: auto;
    }
  }

  &__actions {
    position: absolute;
    top: 0;
    bottom: 0;
    display: flex;
    z-index: 0;

    &--left {
      left: 0;
      .dd-swipe-action__btn {
        @include dd-flex-center;
        flex-direction: column;
      }
    }
    &--right {
      right: 0;
      flex-direction: row-reverse;
      .dd-swipe-action__btn {
        @include dd-flex-center;
        flex-direction: column;
      }
    }
  }

  &__btn {
    height: 100%;
    box-sizing: border-box;
    padding: 0 12rpx;
    color: $dd-color-white;
    @include dd-flex-center;
    flex-direction: column;
    gap: $dd-space-1;
    overflow: hidden;
  }

  &__icon {
    font-size: $dd-font-size-h3;
    line-height: 1;
  }

  &__label {
    font-size: $dd-font-size-body;
    font-weight: 500;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  &__content {
    position: relative;
    z-index: 1;
    width: 100%;
    background: $dd-bg-elevated;
    transform: translateX(0);

    &--anim {
      // cubic-bezier 来自 JSON traits: 0.25, 0.46, 0.45, 0.94
      transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
  }
}
</style>
