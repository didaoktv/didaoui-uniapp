<template>
  <view
    class="dd-cell"
    :class="[
      `dd-cell--${size}`,
      {
        'dd-cell--center': center,
        'dd-cell--required': requiredState,
        'dd-cell--borderless': !border,
        'dd-cell--clickable': clickableState,
      },
    ]"
    :hover-class="clickableState ? 'dd-cell--active' : ''"
    :hover-stay-time="100"
    @click="handleClick"
  >
    <view v-if="$slots.icon || icon" class="dd-cell__icon">
      <slot name="icon">
        <dd-icon v-if="icon" :name="icon" class="dd-cell__icon-text" />
      </slot>
    </view>
    <view v-if="requiredState" class="dd-cell__required"><text>*</text></view>
    <view class="dd-cell__content">
      <view v-if="title || $slots.title" class="dd-cell__title" :style="titleStyle">
        <slot name="title">{{ title }}</slot>
      </view>
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
import { computed } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  title?: string
  label?: string
  value?: string
  icon?: string
  size?: 'normal' | 'large'
  isLink?: boolean
  arrowDirection?: 'left' | 'right' | 'up' | 'down'
  required?: boolean | 'auto'
  center?: boolean
  border?: boolean
  /** 开启点击反馈样式（click 事件总是抛出，不受此 prop 限制） */
  clickable?: boolean
  /** 点击后经 uni.* 跳转的页面路径 */
  url?: string
  linkType?: 'navigateTo' | 'redirectTo' | 'reLaunch' | 'switchTab'
  titleStyle?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  label: '',
  value: '',
  icon: '',
  size: 'normal',
  isLink: false,
  arrowDirection: 'right',
  required: false,
  center: false,
  border: true,
  clickable: false,
  url: '',
  linkType: 'navigateTo',
  titleStyle: '',
})

const emit = defineEmits<{ (e: 'click', val: Event): void }>()

// cell 自身 required='auto' 等价 false（dd-field 复用时 auto 由其 rules 决定）
const requiredState = computed(() => props.required === true)
const clickableState = computed(() => props.clickable || props.isLink || !!props.url)

function navigate() {
  const opts = { url: props.url }
  switch (props.linkType) {
    case 'redirectTo':
      uni.redirectTo(opts)
      break
    case 'reLaunch':
      uni.reLaunch(opts)
      break
    case 'switchTab':
      uni.switchTab(opts)
      break
    default:
      uni.navigateTo(opts)
  }
}

function handleClick(e: Event) {
  if (props.url) navigate()
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
  padding: 0 24rpx 0 $dd-space-4;
  background: var(--dd-bg-elevated, #{$dd-bg-elevated});
  font-size: $dd-font-size-body;
  color: var(--dd-text-primary, #{$dd-text-primary});
  @include dd-hairline-bottom(var(--dd-border-subtle, #{$dd-border-subtle}));

  &--normal {
    min-height: 96rpx;
  }

  &--large {
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
    background: var(--dd-surface-container-high, #{$dd-surface-container-high});
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
    color: var(--dd-primary-400, #{$dd-primary-400});
  }

  &__required {
    color: var(--dd-error, #{$dd-error});
    font-size: $dd-font-size-body;
    margin-right: 4rpx;
    line-height: $dd-line-height-caption;
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
    color: var(--dd-text-primary, #{$dd-text-primary});
    @include dd-ellipsis(1);
  }

  &__label {
    margin-top: 4rpx;
    font-size: $dd-font-size-caption;
    color: var(--dd-text-tertiary, #{$dd-text-tertiary});
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
    color: var(--dd-text-tertiary, #{$dd-text-tertiary});
  }

  &__arrow {
    font-size: $dd-font-size-h4;

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
