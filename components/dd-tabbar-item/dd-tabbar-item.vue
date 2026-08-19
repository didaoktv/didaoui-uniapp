<template>
  <view
    class="dd-tabbar-item"
    :style="{ color: isActive ? activeColor : inactiveColor }"
    @click="onClick"
  >
    <view class="dd-tabbar-item__icon-wrap">
      <slot name="icon" :active="isActive">
        <dd-icon :name="icon" class="dd-tabbar-item__icon" />
      </slot>
      <view v-if="badge" class="dd-tabbar-item__badge">
        <text class="dd-tabbar-item__badge-text">{{ badge }}</text>
      </view>
      <view v-else-if="dot" class="dd-tabbar-item__dot"></view>
    </view>
    <text class="dd-tabbar-item__label">
      <slot>{{ label }}</slot>
    </text>
  </view>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  name?: string | number
  icon?: string
  label?: string
  dot?: boolean
  badge?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  name: '',
  icon: '',
  label: '',
  dot: false,
  badge: '',
})

const ctx = inject<any>('ddTabbar', null)
const fallbackIdx = ref(ctx ? ctx.register() : 0)

const identity = computed(() =>
  props.name !== '' && props.name !== undefined ? props.name : fallbackIdx.value
)

const isActive = computed(() =>
  ctx ? ctx.active.value === identity.value : false
)
const activeColor = computed(() => (ctx ? ctx.activeColor.value : '#F5A623'))
const inactiveColor = computed(() =>
  ctx ? ctx.inactiveColor.value : '#9E9E9E'
)

function onClick() {
  ctx?.onItemClick(identity.value)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-tabbar-item {
  flex: 1;
  height: 100%;
  @include dd-flex-center;
  flex-direction: column;
  gap: 4rpx;
  box-sizing: border-box;
  @include dd-transition(color 0.3s);

  &__icon-wrap {
    position: relative;
    width: 40rpx;
    height: 40rpx;
    @include dd-flex-center;
  }

  &__icon {
    font-size: 40rpx;
    line-height: 1;
  }

  &__label {
    font-size: 20rpx;
    line-height: 1.2;
    @include dd-ellipsis(1);
  }

  &__badge {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(40%, -50%);
    min-width: 32rpx;
    height: 32rpx;
    padding: 0 8rpx;
    border-radius: $dd-radius-full;
    background: $dd-error;
    @include dd-flex-center;
  }

  &__badge-text {
    color: $dd-color-white;
    font-size: 20rpx;
    line-height: 1;
  }

  &__dot {
    position: absolute;
    top: -4rpx;
    right: -4rpx;
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background: $dd-error;
  }
}
</style>
