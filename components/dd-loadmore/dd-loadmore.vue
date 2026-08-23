<template>
  <view
    class="dd-loadmore"
    :class="{ 'dd-loadmore--clickable': status === 'loadmore' }"
    :style="containerStyle"
    @click="onClick"
  >
    <slot>
      <!-- loading 态 -->
      <template v-if="status === 'loading'">
        <slot name="loading">
          <view
            v-if="icon"
            class="dd-loadmore__spinner"
            :style="spinnerStyle"
          ></view>
          <text class="dd-loadmore__text" :style="textStyle">{{ loadingText }}</text>
        </slot>
      </template>

      <!-- nomore 态 -->
      <template v-else-if="status === 'nomore'">
        <slot name="nomore">
          <view v-if="isDot" class="dd-loadmore__dot" :style="dotStyle"></view>
          <text v-else class="dd-loadmore__text" :style="textStyle">{{ nomoreText }}</text>
        </slot>
      </template>

      <!-- loadmore 态 -->
      <template v-else>
        <text class="dd-loadmore__text" :style="textStyle">{{ loadmoreText }}</text>
      </template>
    </slot>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Status = 'loadmore' | 'loading' | 'nomore'

interface Props {
  status?: Status
  loadmoreText?: string
  loadingText?: string
  nomoreText?: string
  icon?: boolean
  iconSize?: number // rpx
  fontSize?: number // rpx
  color?: string
  iconColor?: string
  bgColor?: string
  isDot?: boolean
  marginTop?: number // rpx
  marginBottom?: number // rpx
  height?: number | string // rpx
}

const props = withDefaults(defineProps<Props>(), {
  status: 'loadmore',
  loadmoreText: '加载更多',
  loadingText: '正在加载...',
  nomoreText: '没有更多了',
  icon: true,
  iconSize: 32,
  fontSize: 24,
  color: '#9E9E9E', // $dd-text-tertiary
  iconColor: '#F5A623',
  bgColor: 'transparent',
  isDot: false,
  marginTop: 16,
  marginBottom: 16,
  height: 'auto',
})

const emit = defineEmits<{
  (e: 'loadmore'): void
}>()

const containerStyle = computed(() => {
  const h = typeof props.height === 'number' ? `${props.height}rpx` : props.height
  return {
    height: h,
    marginTop: `${props.marginTop}rpx`,
    marginBottom: `${props.marginBottom}rpx`,
    backgroundColor: props.bgColor,
  }
})

const textStyle = computed(() => ({
  fontSize: `${props.fontSize}rpx`,
  color: props.color,
}))

const spinnerStyle = computed(() => ({
  width: `${props.iconSize}rpx`,
  height: `${props.iconSize}rpx`,
  borderColor: props.color,
  borderTopColor: props.iconColor,
}))

const dotStyle = computed(() => ({
  width: '8rpx',
  height: '8rpx',
  backgroundColor: props.color,
}))

function onClick() {
  if (props.status === 'loadmore') emit('loadmore')
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-loadmore {
  @include dd-flex-center;
  width: 100%;
  min-height: 80rpx;
  gap: 12rpx;
  box-sizing: border-box;

  &--clickable {
    cursor: pointer;

    &:active {
      opacity: 0.7;
    }
  }

  &__spinner {
    border: $dd-space-1 solid $dd-border-default;
    border-radius: 50%;
    box-sizing: border-box;
    animation: dd-lm-spin 0.8s linear infinite;
  }

  &__text {
    line-height: $dd-line-height-caption;
  }

  &__dot {
    border-radius: 50%;
    opacity: 0.6;
  }
}

@keyframes dd-lm-spin {
  to { transform: rotate(360deg); }
}
</style>
