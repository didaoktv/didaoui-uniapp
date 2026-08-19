<template>
  <view class="dd-swipe" :style="boxStyle">
    <swiper
      class="dd-swipe__swiper"
      :autoplay="autoplay > 0"
      :interval="autoplay"
      :duration="duration"
      :circular="loop"
      :vertical="vertical"
      :touchable="touchable"
      :current="current"
      @change="onChange"
    >
      <slot></slot>
    </swiper>
    <slot name="indicator" :active="current" :count="count">
      <view v-if="showIndicators && count > 1" class="dd-swipe__indicators" :class="`dd-swipe__indicators--${vertical ? 'vertical' : 'horizontal'}`">
        <view
          v-for="i in count"
          :key="i"
          class="dd-swipe__dot"
          :class="{ 'dd-swipe__dot--active': i - 1 === current }"
          :style="dotStyle(i - 1)"
          @click="jumpTo(i - 1)"
        ></view>
      </view>
    </slot>
  </view>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'

interface Props {
  width?: string
  height?: string
  autoplay?: number
  loop?: boolean
  vertical?: boolean
  duration?: number
  touchable?: boolean
  showIndicators?: boolean
  indicatorColor?: string
  initial?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '300rpx',
  autoplay: 0,
  loop: true,
  vertical: false,
  duration: 500,
  touchable: true,
  showIndicators: true,
  indicatorColor: '',
  initial: 0,
})

const emit = defineEmits<{
  (e: 'change', index: number): void
}>()

const current = ref(props.initial)
const count = ref(0)

const boxStyle = computed(() => ({ width: props.width, height: props.height }))

const activeColor = computed(() => props.indicatorColor || '#F5A623')

function dotStyle(index: number) {
  return index === current.value
    ? { background: activeColor.value }
    : {}
}

// provide/inject: dd-swipe-item 挂载时自注册以统计轮播项数量
provide('ddSwipe', {
  register() {
    count.value++
  },
  unregister() {
    count.value = Math.max(0, count.value - 1)
  },
})

function onChange(e: any) {
  const idx = e?.detail?.current ?? 0
  current.value = idx
  emit('change', idx)
}

function jumpTo(index: number) {
  current.value = index
}

defineExpose({ jumpTo, current })
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-swipe {
  position: relative;
  overflow: hidden;

  &__swiper {
    width: 100%;
    height: 100%;
  }

  &__indicators {
    position: absolute;
    display: flex;
    z-index: 2;

    &--horizontal {
      bottom: $dd-space-3;
      left: 50%;
      transform: translateX(-50%);
      flex-direction: row;
      gap: $dd-space-1;
    }
    &--vertical {
      right: $dd-space-3;
      top: 50%;
      transform: translateY(-50%);
      flex-direction: column;
      gap: $dd-space-1;
    }
  }

  &__dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: $dd-radius-full;
    background: rgba(255, 255, 255, 0.5);
    @include dd-transition(background 0.3s ease);

    &--active {
      background: $dd-primary-500;
    }
  }
}
</style>
