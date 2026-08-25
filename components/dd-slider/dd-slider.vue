<template>
  <view class="dd-slider" :class="{ 'dd-slider--disabled': disabled }">
    <view
      class="dd-slider__track"
      :style="trackStyle"
      @touchstart="onTouchStart"
      @touchmove.stop.prevent="onTouchMove"
      @touchend="onTouchEnd"
      @mousedown="onMouseDown"
    >
      <view class="dd-slider__fill" :style="fillStyle"></view>
      <view class="dd-slider__thumb" :class="{ 'dd-slider__thumb--active': dragging }" :style="thumbStyle">
        <view v-if="showTooltip && dragging" class="dd-slider__tooltip">
          <text class="dd-slider__tooltip-text">{{ displayValue }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, ref } from 'vue'

interface Props {
  modelValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  showTooltip?: boolean
  activeColor?: string
  trackColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  showTooltip: false,
  activeColor: '',
  trackColor: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: number): void
  (e: 'change', val: number): void
  (e: 'drag-start'): void
  (e: 'drag-end'): void
}>()

const instance = getCurrentInstance()
const dragging = ref(false)
const trackRect = ref({ left: 0, width: 1 })

const percent = computed(() => {
  if (props.max === props.min) return 0
  const p = ((props.modelValue - props.min) / (props.max - props.min)) * 100
  return Math.max(0, Math.min(100, p))
})

const displayValue = computed(() => {
  const v = props.modelValue
  return Number.isInteger(v) ? v : Number(v.toFixed(1))
})

const fillStyle = computed(() => {
  const s: Record<string, string> = { width: percent.value + '%' }
  if (props.activeColor) s.background = props.activeColor
  return s
})
const thumbStyle = computed(() => {
  const s: Record<string, string> = { left: percent.value + '%' }
  if (props.activeColor) s.borderColor = props.activeColor
  return s
})
const trackStyle = computed(() => {
  return props.trackColor ? { background: props.trackColor } : {}
})

function queryRect(): Promise<any> {
  return new Promise((resolve) => {
    const query = uni.createSelectorQuery().in(instance!.proxy as any)
    query
      .select('.dd-slider__track')
      .boundingClientRect((rect) => resolve(rect as any))
      .exec()
  })
}

function snap(val: number) {
  if (props.step <= 1) return val // ponytail: step<=1 视为连续，不做吸附
  const steps = Math.round((val - props.min) / props.step)
  return props.min + steps * props.step
}

function updateFromClientX(x: number) {
  const { left, width } = trackRect.value
  let p = (x - left) / (width || 1)
  p = Math.max(0, Math.min(1, p))
  let val = props.min + p * (props.max - props.min)
  val = snap(val)
  val = Math.max(props.min, Math.min(props.max, val))
  emit('update:modelValue', val)
  emit('change', val)
}

async function startDrag(clientX: number) {
  if (props.disabled) return
  const rect = await queryRect()
  if (rect) trackRect.value = { left: rect.left, width: rect.width || 1 }
  dragging.value = true
  emit('drag-start')
  updateFromClientX(clientX)
}

function onTouchStart(e: any) {
  if (props.disabled) return
  const x = e.touches?.[0]?.clientX ?? 0
  startDrag(x)
}
function onTouchMove(e: any) {
  if (!dragging.value) return
  const x = e.touches?.[0]?.clientX ?? 0
  updateFromClientX(x)
}
function onTouchEnd() {
  if (!dragging.value) return
  dragging.value = false
  emit('drag-end')
}

function onMouseDown(e: any) {
  // #ifdef H5
  if (props.disabled) return
  startDrag(e.clientX)
  const onMove = (ev: MouseEvent) => updateFromClientX(ev.clientX)
  const onUp = () => {
    dragging.value = false
    emit('drag-end')
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
  // #endif
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-slider {
  padding: 20rpx 0;

  &__track {
    position: relative;
    width: 100%;
    height: 6rpx;
    border-radius: $dd-radius-full;
    background: var(--dd-surface-container-high, #{$dd-surface-container-high});
  }

  &__fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    border-radius: $dd-radius-full;
    background: var(--dd-gradient-primary-h, #{$dd-gradient-primary-h});
    box-shadow: 0 0 8rpx rgba($dd-primary-400, 0.6);
  }

  &__thumb {
    position: absolute;
    top: 50%;
    width: 32rpx;
    height: 32rpx;
    background: $dd-color-white;
    border: 4rpx solid var(--dd-primary-400, #{$dd-primary-400});
    border-radius: 50%;
    box-shadow: var(--dd-shadow-glow-gold-lg, #{$dd-shadow-glow-gold-lg});
    transform: translate(-50%, -50%);
    @include dd-transition(transform 0.1s ease, box-shadow 0.2s ease);

    &--active {
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  &__tooltip {
    position: absolute;
    bottom: calc(100% + $dd-space-2);
    left: 50%;
    transform: translateX(-50%);
    padding: 6rpx $dd-space-2;
    @include dd-glass;
    border-radius: $dd-radius-sm;
    white-space: nowrap;

    &::after {
      content: '';
      position: absolute;
      bottom: -6rpx;
      left: 50%;
      transform: translateX(-50%);
      border: 6rpx solid transparent;
      border-top-color: var(--dd-glass-border, #{$dd-glass-border});
      border-bottom: 0;
    }
  }

  &__tooltip-text {
    font-size: $dd-font-size-caption;
    font-weight: 600;
    color: var(--dd-primary-300, #{$dd-primary-300});
    line-height: 1.2;
  }

  &--disabled {
    opacity: 0.4;
    @include dd-no-touch;
  }
}
</style>
