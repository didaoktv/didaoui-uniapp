<template>
  <view class="dd-step" :class="[`dd-step--${direction}`, `dd-step--${status}`]">
    <template v-if="direction === 'horizontal'">
      <view class="dd-step__head">
        <view
          v-if="!isLast"
          class="dd-step__line"
          :class="{ 'dd-step__line--first': isFirst }"
          :style="lineStyle"
        ></view>
        <view class="dd-step__circle" :style="circleStyle">
          <dd-icon v-if="status === 'finish'" name="success" class="dd-step__circle-text" />
          <text v-else class="dd-step__circle-text">{{ index + 1 }}</text>
        </view>
      </view>
      <view class="dd-step__content">
        <text class="dd-step__title">{{ title }}</text>
        <text v-if="description" class="dd-step__desc">{{ description }}</text>
      </view>
    </template>

    <template v-else>
      <view class="dd-step__head dd-step__head--vertical">
        <view class="dd-step__circle" :style="circleStyle">
          <dd-icon v-if="status === 'finish'" name="success" class="dd-step__circle-text" />
          <text v-else class="dd-step__circle-text">{{ index + 1 }}</text>
        </view>
        <view
          v-if="!isLast"
          class="dd-step__line dd-step__line--vertical"
          :style="lineStyle"
        ></view>
      </view>
      <view class="dd-step__content dd-step__content--vertical">
        <text class="dd-step__title">{{ title }}</text>
        <text v-if="description" class="dd-step__desc">{{ description }}</text>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

type StepStatus = 'wait' | 'process' | 'finish'

interface Props {
  title?: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
})

const ctx = inject<any>('ddSteps', null)
const index = ctx ? ctx.register() : 0

const direction = computed<'horizontal' | 'vertical'>(() =>
  ctx ? ctx.direction.value : 'horizontal'
)

const status = computed<StepStatus>(() => {
  if (!ctx) return 'wait'
  const active = ctx.active.value
  if (index < active) return 'finish'
  if (index === active) return 'process'
  return 'wait'
})

const isLast = computed(() => (ctx ? index === ctx.count.value - 1 : true))
const isFirst = computed(() => index === 0)

const activeColor = computed(() => (ctx ? ctx.activeColor.value : '#F5A623'))
const inactiveColor = computed(() => (ctx ? ctx.inactiveColor.value : '#9E9E9E'))

const isActive = computed(() => status.value === 'finish' || status.value === 'process')

const circleStyle = computed(() => ({
  background: isActive.value ? activeColor.value : '#2A2A2A',
  color: isActive.value ? '#FFFFFF' : inactiveColor.value,
}))

// ponytail: 水平连接线整段按本步骤 status 着色，current/首个 wait 左半段颜色为近似值
const lineStyle = computed(() => ({
  background: status.value === 'finish' ? activeColor.value : inactiveColor.value,
}))
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-step {
  &--horizontal {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 0;
  }

  &__head {
    position: relative;
    width: 100%;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    &--vertical {
      width: 40rpx;
      height: auto;
      flex-direction: column;
      align-self: stretch;
    }
  }

  &__line {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    transform: translateY(-50%);
    z-index: 0;

    &--first {
      left: 50%;
    }

    &--vertical {
      position: static;
      transform: none;
      width: 1px;
      flex: 1;
      min-height: 32rpx;
      margin: 8rpx 0;
    }
  }

  &__circle {
    position: relative;
    z-index: 1;
    width: 40rpx;
    height: 40rpx;
    border-radius: $dd-radius-full;
    @include dd-flex-center;
    flex-shrink: 0;
    @include dd-transition(all 0.3s ease);
  }

  &__circle-text {
    font-size: 20rpx; // font-size-xs
    font-weight: 700;
    line-height: 1;
  }

  &__content {
    text-align: center;
    margin-top: 8rpx;

    &--vertical {
      text-align: left;
      flex: 1;
      padding-bottom: 32rpx;
      padding-left: 8rpx;
      margin-top: 0;
    }
  }

  &__title {
    font-size: $dd-font-size-caption;
    color: $dd-text-primary;
    line-height: $dd-line-height-caption;
  }

  &__desc {
    display: block;
    margin-top: 4rpx;
    font-size: 20rpx;
    color: $dd-text-tertiary;
    line-height: 1.4;
  }
}
</style>
