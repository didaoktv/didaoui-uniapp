<template>
  <view
    class="dd-nav"
    :class="{
      'dd-nav--fixed': fixed,
      'dd-nav--border': border,
    }"
  >
    <view
      v-for="(item, index) in items"
      :key="index"
      class="dd-nav__item"
      :class="{ 'dd-nav__item--active': index === modelValue }"
      @click="onSelect(index)"
    >
      <view
        v-if="index === modelValue"
        class="dd-nav__indicator"
      ></view>
      <slot name="icon" :item="item" :index="index" :active="index === modelValue">
        <dd-icon :name="item.icon" class="dd-nav__icon" />
      </slot>
      <text class="dd-nav__label">{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import DdIcon from '../dd-icon/dd-icon.vue'

interface NavItem {
  icon: string
  label: string
  [key: string]: any
}

interface Props {
  modelValue?: number
  items?: NavItem[]
  fixed?: boolean
  border?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  items: () => [],
  fixed: true,
  border: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: number): void
  (e: 'change', val: number): void
}>()

function onSelect(index: number) {
  if (index === props.modelValue) return
  emit('update:modelValue', index)
  emit('change', index)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-nav {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  height: 112rpx;
  background: $dd-surface;
  box-sizing: border-box;

  &--border {
    @include dd-hairline-top($dd-border-subtle);
  }

  &--fixed {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: $dd-z-index-sticky;
    @include dd-safe-area-bottom;
  }

  &__item {
    position: relative;
    flex: 1;
    height: 100%;
    @include dd-flex-center;
    flex-direction: column;
    gap: 4rpx;
    color: $dd-text-tertiary;
    @include dd-transition(color 0.3s);

    &--active {
      color: $dd-primary-400;
      .dd-nav__icon {
        text-shadow: 0 0 12px rgba(245, 166, 35, 0.5);
      }
      .dd-nav__label {
        font-weight: 500;
      }
    }
  }

  &__indicator {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 48rpx;
    height: 4rpx;
    border-radius: 0 0 $dd-radius-sm $dd-radius-sm;
    background: $dd-gradient-primary-h;
    box-shadow: $dd-shadow-glow-gold-sm;
  }

  &__icon {
    font-size: 40rpx;
    line-height: 1;
  }

  &__label {
    font-size: 24rpx;
    line-height: 1.2;
    @include dd-ellipsis(1);
  }
}
</style>
