<template>
  <view
    class="dd-collapse-item"
    :class="{
      'dd-collapse-item--expanded': expanded,
      'dd-collapse-item--disabled': disabled,
      'dd-collapse-item--border': border,
    }"
  >
    <view class="dd-collapse-item__header" @click="onToggle">
      <text class="dd-collapse-item__title">
        <slot name="title">{{ title }}</slot>
      </text>
      <text v-if="value" class="dd-collapse-item__value">{{ value }}</text>
      <dd-icon name="arrow-down" class="dd-collapse-item__arrow" />
    </view>
    <view class="dd-collapse-item__wrap" :style="wrapStyle">
      <view class="dd-collapse-item__content">
        <slot></slot>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, inject, nextTick, onMounted, ref, watch } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  name?: string | number
  title?: string
  value?: string
  disabled?: boolean
  border?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  name: '',
  title: '',
  value: '',
  disabled: false,
  border: true,
})

const ctx = inject<any>('ddCollapse', null)

const localActive = ref(false)
const identity = computed(() => (props.name !== '' ? props.name : '__dd_ci_self__'))

const expanded = computed(() => {
  if (ctx) return ctx.isExpanded(identity.value)
  return localActive.value
})

const contentHeight = ref(0)
const wrapStyle = computed(() => ({
  maxHeight: expanded.value && contentHeight.value ? contentHeight.value + 'px' : '0px',
  opacity: expanded.value ? '1' : '0',
}))

const instance = getCurrentInstance()

function measure() {
  nextTick(() => {
    const query = uni.createSelectorQuery().in(instance)
    query
      .select('.dd-collapse-item__content')
      .boundingClientRect((rect) => {
        const r = rect as UniApp.NodeInfo
        if (r && r.height) contentHeight.value = r.height
      })
      .exec()
  })
}

function onToggle() {
  if (props.disabled) return
  if (ctx) {
    ctx.toggle(identity.value)
  } else {
    localActive.value = !localActive.value
  }
}

watch(
  () => expanded.value,
  (val) => {
    if (val) measure()
  }
)

onMounted(() => {
  if (expanded.value) measure()
})
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-collapse-item {
  background: $dd-surface;

  &--border {
    @include dd-hairline-bottom($dd-border-subtle);
  }

  &--disabled {
    opacity: 0.5;
    @include dd-no-touch;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: $dd-space-2;
    padding: 24rpx 32rpx;
  }

  &__title {
    flex: 1;
    font-size: $dd-font-size-lead;
    color: $dd-text-primary;
    @include dd-ellipsis(1);
  }

  &__value {
    font-size: $dd-font-size-body;
    color: $dd-text-tertiary;
    @include dd-ellipsis(1);
  }

  &__arrow {
    font-size: 28rpx;
    color: $dd-text-tertiary;
    @include dd-transition(transform 0.3s);
  }

  &--expanded &__arrow {
    transform: rotate(180deg);
  }

  &__wrap {
    overflow: hidden;
    @include dd-transition(max-height 0.3s ease, opacity 0.3s ease);
  }

  &__content {
    padding: 0 32rpx 24rpx;
    font-size: $dd-font-size-body;
    color: $dd-text-secondary;
  }
}
</style>
