<template>
  <view>
    <view
      v-if="title || $slots.title"
      class="dd-cell-group__title"
      :class="[`dd-cell-group__title--${size}`, { 'dd-cell-group__title--inset': inset }]"
    >
      <slot name="title">{{ title }}</slot>
    </view>
    <view class="dd-cell-group" :class="{ 'dd-cell-group--inset': inset, 'dd-cell-group--border': border && !inset }">
      <slot></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  /** 默认通栏；inset = 圆角卡片内嵌模式 */
  inset?: boolean
  /** 通栏模式下的首尾外框发丝线 */
  border?: boolean
  /** 分节标题尺寸档，只影响标题排版，不向子 cell 传递 */
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  title: '',
  inset: false,
  border: true,
  size: 'md',
})
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-cell-group {
  background: var(--dd-bg-elevated, #{$dd-bg-elevated});

  :deep(.dd-cell:last-child),
  :deep(.dd-list-cell:last-child) {
    &::after {
      display: none;
    }
  }

  &--inset {
    border-radius: $dd-radius-lg;
    overflow: hidden;
  }

  &--border {
    @include dd-hairline-top(var(--dd-border-subtle, #{$dd-border-subtle}));
    @include dd-hairline-bottom(var(--dd-border-subtle, #{$dd-border-subtle}));
  }
}

.dd-cell-group__title {
  padding: $dd-space-4 $dd-space-4 $dd-space-2;
  font-size: $dd-font-size-caption;
  color: var(--dd-text-tertiary, #{$dd-text-tertiary});

  &--inset {
    padding-left: $dd-space-3;
    padding-right: $dd-space-3;
  }

  // 尺寸档只调标题排版（竖直 padding + 字号），不级联到子 cell
  &--xs {
    padding-top: $dd-space-2;
    padding-bottom: 0;
    font-size: $dd-font-size-overline;
  }

  &--sm {
    padding-top: $dd-space-3;
    padding-bottom: $dd-space-1;
    font-size: $dd-font-size-overline;
  }

  &--lg {
    padding-top: $dd-space-5;
    padding-bottom: $dd-space-3;
    font-size: $dd-font-size-body;
  }
}
</style>
