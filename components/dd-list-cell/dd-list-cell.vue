<template>
  <view
    class="dd-list-cell"
    :class="[
      `dd-list-cell--${size}`,
      { 'dd-list-cell--link': isLink || arrow, 'dd-list-cell--borderless': borderless },
    ]"
    :hover-class="isLink || arrow ? 'dd-list-cell--active' : ''"
    :hover-stay-time="100"
    @click="onClick"
  >
    <view v-if="$slots.icon || icon" class="dd-list-cell__icon">
      <slot name="icon">
        <view class="dd-list-cell__icon-text">
          <dd-icon v-if="icon" :name="icon"  />
        </view>
      </slot>
    </view>
    <view class="dd-list-cell__content">
      <text class="dd-list-cell__title">{{ title }}</text>
      <text v-if="subtitle || $slots.subtitle" class="dd-list-cell__subtitle">
        <slot name="subtitle">{{ subtitle }}</slot>
      </text>
    </view>
    <view class="dd-list-cell__right">
      <slot name="value">
        <text v-if="value" class="dd-list-cell__value">{{ value }}</text>
      </slot>
      <slot name="right-icon"></slot>
      <view v-if="isLink || arrow" class="dd-list-cell__arrow"><dd-icon name="arrow" /></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useSlots } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  title?: string
  subtitle?: string
  value?: string
  icon?: string
  /** 尺寸档：sm 紧凑 / md 默认 / lg 宽松，同时改变行高与字号 */
  size?: 'sm' | 'md' | 'lg'
  arrow?: boolean
  isLink?: boolean
  borderless?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  value: '',
  icon: '',
  size: 'md',
  arrow: false,
  isLink: false,
  borderless: false,
})

const emit = defineEmits<{ (e: 'click', val: Event): void }>()

const slots = useSlots()
void slots

function onClick(e: Event) {
  emit('click', e)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-list-cell {
  display: flex;
  flex-direction: row;
  align-items: center;
  // 行高以 min-height 定档（md 48px = 原值），padding 只负责内容区留白与撑高
  min-height: $dd-space-7;
  padding: $dd-space-3 $dd-space-4;
  box-sizing: border-box;
  background: var(--dd-bg-elevated, #{$dd-bg-elevated});
  font-size: $dd-font-size-body;
  @include dd-hairline-bottom(var(--dd-border-default, #{$dd-border-default}));

  // 三档：44/48/56px（sm 取控件 md 档 = 44px 触控下限），字号 12/14/16px 同步缩放
  &--sm {
    min-height: $dd-size-control-md;
    padding-top: $dd-space-2;
    padding-bottom: $dd-space-2;
    font-size: $dd-font-size-caption;
  }

  &--lg {
    min-height: $dd-space-7 + $dd-space-2;
    padding-top: $dd-space-4;
    padding-bottom: $dd-space-4;
    font-size: $dd-font-size-lead;
  }

  &__icon {
    flex-shrink: 0;
    width: 56rpx;
    height: 56rpx;
    margin-right: $dd-space-3;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__icon-text {
    font-size: 1.429em;
    line-height: 1;
    color: var(--dd-primary-400, #{$dd-primary-400});
  }

  &__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: $dd-space-1;
  }

  &__title {
    font-size: 1em;
    font-weight: 500;
    color: var(--dd-text-primary, #{$dd-text-primary});
    @include dd-ellipsis(1);
  }

  &__subtitle {
    font-size: 0.857em;
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
    font-size: 1em;
    font-weight: 500;
    color: var(--dd-primary-400, #{$dd-primary-400});
  }

  &__arrow {
    font-size: 1.286em;
    color: var(--dd-text-tertiary, #{$dd-text-tertiary});
    line-height: 1;
    margin-left: $dd-space-1;
  }

  &--borderless {
    &::after {
      display: none;
    }
  }

  &--link {
    cursor: pointer;
  }

  &--active {
    background: var(--dd-surface-container-highest, #{$dd-surface-container-highest});
  }
}
</style>
