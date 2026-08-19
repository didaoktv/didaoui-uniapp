<template>
  <view
    class="dd-cell"
    :class="[
      `dd-cell--${size}`,
      {
        'dd-cell--center': center,
        'dd-cell--required': required,
        'dd-cell--borderless': borderless,
        'dd-cell--link': isLink,
      },
    ]"
    :hover-class="isLink ? 'dd-cell--active' : ''"
    :hover-stay-time="100"
    @click="handleClick"
  >
    <view v-if="$slots.icon || icon" class="dd-cell__icon">
      <slot name="icon">
        <dd-icon v-if="icon" :name="icon" class="dd-cell__icon-text" />
      </slot>
    </view>
    <view v-if="required" class="dd-cell__required"><text>*</text></view>
    <view class="dd-cell__content">
      <text v-if="title" class="dd-cell__title">{{ title }}</text>
      <text v-if="label || $slots.label" class="dd-cell__label">
        <slot name="label">{{ label }}</slot>
      </text>
    </view>
    <view class="dd-cell__right">
      <slot name="value">
        <text v-if="value" class="dd-cell__value">{{ value }}</text>
      </slot>
      <slot name="right-icon"></slot>
      <view
        v-if="isLink"
        class="dd-cell__arrow"
        :class="`dd-cell__arrow--${arrowDirection}`"
      ><dd-icon name="arrow" /></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useSlots } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  title?: string
  label?: string
  value?: string
  icon?: string
  size?: 'sm' | 'md'
  isLink?: boolean
  arrowDirection?: 'left' | 'right' | 'up' | 'down'
  required?: boolean
  center?: boolean
  borderless?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  label: '',
  value: '',
  icon: '',
  size: 'md',
  isLink: false,
  arrowDirection: 'right',
  required: false,
  center: false,
  borderless: false,
})

const emit = defineEmits<{ (e: 'click', val: Event): void }>()

const slots = useSlots()
void slots

// 仅当 isLink 时才向外抛 click
function handleClick(e: Event) {
  if (!props.isLink) return
  emit('click', e)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-cell {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  box-sizing: border-box;
  width: 100%;
  padding: 0 24rpx 0 32rpx;
  background: $dd-bg-elevated;
  font-size: $dd-font-size-body;
  color: $dd-text-primary;
  @include dd-hairline-bottom($dd-border-subtle);

  &--sm {
    min-height: 96rpx;
  }

  &--md {
    min-height: 112rpx;
  }

  &--center {
    align-items: center;
  }

  &--borderless {
    &::after {
      display: none;
    }
  }

  &--active {
    background: $dd-surface-container-high;
  }

  &__icon {
    flex-shrink: 0;
    margin-right: $dd-space-2;
    display: flex;
    align-items: center;
    height: 100%;
  }

  &__icon-text {
    font-size: 36rpx;
    line-height: 1;
    color: $dd-primary-400;
  }

  &__required {
    color: $dd-error-500;
    font-size: $dd-font-size-body;
    margin-right: 4rpx;
    line-height: 1.5;
    text {
      line-height: 1;
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: $dd-space-2 0;
  }

  &__title {
    font-size: $dd-font-size-body;
    color: $dd-text-primary;
    @include dd-ellipsis(1);
  }

  &__label {
    margin-top: 4rpx;
    font-size: $dd-font-size-caption;
    color: $dd-text-tertiary;
    @include dd-ellipsis(1);
  }

  &__right {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: $dd-space-1;
    margin-left: $dd-space-2;
  }

  &__value {
    font-size: $dd-font-size-body;
    color: $dd-text-tertiary;
  }

  &__arrow {
    font-size: 32rpx;
    color: $dd-text-tertiary;
    line-height: 1;

    &--right {
      transform: rotate(0deg);
    }
    &--left {
      transform: rotate(180deg);
    }
    &--up {
      transform: rotate(-90deg);
    }
    &--down {
      transform: rotate(90deg);
    }
  }
}
</style>
