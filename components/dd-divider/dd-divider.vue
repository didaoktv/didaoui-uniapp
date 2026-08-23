<template>
  <view class="dd-divider" :class="[`dd-divider--${contentPosition}`]">
    <view
      class="dd-divider__line"
      :class="[
        `dd-divider__line--left`,
        `dd-divider__line--${lineStyle}`,
        { 'dd-divider__line--hairline': effectiveHairline },
      ]"
    ></view>
    <view v-if="hasContent" class="dd-divider__content">
      <slot></slot>
    </view>
    <view
      class="dd-divider__line"
      :class="[
        `dd-divider__line--right`,
        `dd-divider__line--${lineStyle}`,
        { 'dd-divider__line--hairline': effectiveHairline },
      ]"
    ></view>
  </view>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

interface Props {
  contentPosition?: 'left' | 'center' | 'right'
  dashed?: boolean
  /** true=1px hairline; false=4rpx (dashed 归一化为 1px) */
  hairline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  contentPosition: 'center',
  dashed: false,
  hairline: true,
})

const slots = useSlots()
const hasContent = computed(() => !!slots.default)

const lineStyle = computed(() => (props.dashed ? 'dashed' : 'solid'))
// ponytail: dashed 非 hairline 归一化回 1px，避免 4rpx 粗虚线显得笨重
const effectiveHairline = computed(() => props.hairline || props.dashed)
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-divider {
  display: flex;
  align-items: center;
  width: 100%;
  height: $dd-space-5; // 24px

  &__content {
    flex: none;
    padding: 0 $dd-space-2;
    color: $dd-text-tertiary;
    font-size: $dd-font-size-caption;
    line-height: $dd-line-height-caption;
  }

  &__line {
    flex: 1;
    border-top-color: $dd-border-default;

    &--left {
      flex: 1;
    }

    &--right {
      flex: 1;
    }

    &--hairline {
      border-top-width: 1px;
    }

    &--solid {
      border-top-style: solid;
    }

    &--dashed {
      border-top-style: dashed;
    }

    &:not(.dd-divider__line--hairline) {
      border-top-width: $dd-space-1;
    }
  }
}

// contentPosition 折叠单行：left 折叠左线，right 折叠右线
.dd-divider--left .dd-divider__line--left {
  flex: 0 0 $dd-space-3;
}
.dd-divider--right .dd-divider__line--right {
  flex: 0 0 $dd-space-3;
}
</style>
