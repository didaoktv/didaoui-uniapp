<template>
  <view class="dd-pull-refresh">
    <view
      class="dd-pull-refresh__track"
      :class="{ 'dd-pull-refresh__track--anim': !pulling }"
      :style="{ transform: `translateY(${distance}px)` }"
    >
      <view class="dd-pull-refresh__head" :style="{ height: headHeightPx + 'px' }">
        <view class="dd-pull-refresh__head-inner">
          <view v-if="status === 'loading'" class="dd-pull-refresh__spinner"></view>
          <text class="dd-pull-refresh__text">{{ statusText }}</text>
        </view>
      </view>
      <scroll-view
        class="dd-pull-refresh__scroll"
        scroll-y
        :scroll-top="scrollTop"
        :lower-threshold="lowerThresholdPx"
        :style="{ height: '100%' }"
        @scroll="onScroll"
        @scrolltolower="onScrollToLower"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @touchcancel="onTouchEnd"
      >
        <slot></slot>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type Status = 'pulling' | 'loosing' | 'loading' | 'success'

interface Props {
  modelValue?: boolean
  headHeight?: number // rpx
  pullingText?: string
  loosingText?: string
  loadingText?: string
  successText?: string
  successDuration?: number
  damping?: number
  lowerThreshold?: number // rpx，距底部小于该值触发 loadmore
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  headHeight: 100,
  pullingText: '下拉即可刷新...',
  loosingText: '释放即可刷新...',
  loadingText: '加载中...',
  successText: '',
  successDuration: 500,
  damping: 0.5,
  lowerThreshold: 100,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'refresh'): void
  (e: 'loadmore'): void
}>()

const distance = ref(0)
const pulling = ref(false)
const status = ref<Status>('pulling')
const scrollTop = ref(0)

let startY = 0
let startTop = 0
let successTimer: ReturnType<typeof setTimeout> | null = null

function rpxToPx(rpx: number): number {
  try {
    const info = uni.getWindowInfo()
    return (rpx / 750) * info.windowWidth
  } catch {
    return rpx / 2
  }
}

const headHeightPx = computed(() => rpxToPx(props.headHeight))
const maxStretchPx = computed(() => headHeightPx.value * 1.5)
const lowerThresholdPx = computed(() => rpxToPx(props.lowerThreshold))

const statusText = computed(() => {
  switch (status.value) {
    case 'pulling': return props.pullingText
    case 'loosing': return props.loosingText
    case 'loading': return props.loadingText
    case 'success': return props.successText || props.pullingText
    default: return props.pullingText
  }
})

function onScroll(e: any) {
  scrollTop.value = e?.detail?.scrollTop ?? 0
}

function onScrollToLower() {
  emit('loadmore')
}

function onTouchStart(e: any) {
  if (props.modelValue) return
  if (scrollTop.value > 0) return
  pulling.value = true
  startY = e.touches?.[0]?.clientY ?? 0
  startTop = scrollTop.value
}

function onTouchMove(e: any) {
  if (!pulling.value || props.modelValue) return
  const y = e.touches?.[0]?.clientY ?? 0
  let delta = y - startY
  if (delta <= 0) {
    distance.value = 0
    return
  }
  // 阻止页面跟随滚动
  if (e.preventDefault) e.preventDefault()
  if (e.stopPropagation) e.stopPropagation()
  // 0.5 阻尼，封顶 1.5x headHeight
  let d = delta * props.damping
  if (d > maxStretchPx.value) d = maxStretchPx.value
  distance.value = d
  status.value = d >= headHeightPx.value ? 'loosing' : 'pulling'
}

function onTouchEnd() {
  if (!pulling.value) return
  pulling.value = false
  if (distance.value >= headHeightPx.value) {
    // 触发刷新
    distance.value = headHeightPx.value
    status.value = 'loading'
    emit('update:modelValue', true)
    emit('refresh')
  } else {
    distance.value = 0
    status.value = 'pulling'
  }
}

// modelValue 驱动 loading 锁与 success 反馈序列
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      distance.value = headHeightPx.value
      status.value = 'loading'
    } else {
      if (props.successText) {
        status.value = 'success'
        if (successTimer) clearTimeout(successTimer)
        successTimer = setTimeout(() => {
          distance.value = 0
          status.value = 'pulling'
        }, props.successDuration)
      } else {
        distance.value = 0
        status.value = 'pulling'
      }
    }
  }
)
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-pull-refresh {
  position: relative;
  height: 100%;
  overflow: hidden;

  &__track {
    position: relative;
    height: 100%;
    z-index: 1;
    background: $dd-bg;

    &--anim {
      transition: transform 300ms ease;
    }
  }

  &__head {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    transform: translateY(-100%);
    z-index: 0;
  }

  &__head-inner {
    height: 100%;
    @include dd-flex-center;
    gap: 16rpx;
  }

  &__spinner {
    width: 32rpx;
    height: 32rpx;
    border: 4rpx solid $dd-border-default;
    border-top-color: $dd-primary-500;
    border-radius: 50%;
    animation: dd-pr-spin 0.8s linear infinite;
  }

  &__text {
    font-size: $dd-font-size-body;
    color: $dd-text-tertiary;
  }

  &__scroll {
    width: 100%;
    overscroll-behavior-y: contain;
  }
}

@keyframes dd-pr-spin {
  to { transform: rotate(360deg); }
}
</style>
