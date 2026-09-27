<template>
  <view
    class="dd-sidebar-item"
    :class="[
      customClass,
      {
        'dd-sidebar-item--active': isActive,
        'dd-sidebar-item--disabled': disabled,
      },
    ]"
    @click="onClick"
  >
    <view class="dd-sidebar-item__text">
      <slot name="title">{{ title }}</slot>
    </view>
    <view v-if="badge" class="dd-sidebar-item__badge">
      <text class="dd-sidebar-item__badge-text">{{ badge }}</text>
    </view>
    <view v-else-if="dot" class="dd-sidebar-item__dot"></view>
  </view>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'

interface Props {
  /** 导航项文案 */
  title?: string
  /** 右上角红点 */
  dot?: boolean
  /** 右上角徽标数 */
  badge?: string | number
  /** 禁用（点击不切换、不触发 click） */
  disabled?: boolean
  /** 额外类名 */
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  dot: false,
  badge: '',
  disabled: false,
  customClass: '',
})

const emit = defineEmits<{
  (e: 'click', index: number): void
}>()

const ctx = inject<any>('ddSidebar', null)
const fallbackIdx = ref(ctx ? ctx.register() : 0)

const isActive = computed(() => (ctx ? ctx.active.value === fallbackIdx.value : false))

function onClick() {
  if (props.disabled) return
  ctx?.onItemClick(fallbackIdx.value)
  emit('click', fallbackIdx.value)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-sidebar-item {
  position: relative;
  padding: $dd-space-4 $dd-space-3;
  color: var(--dd-text-secondary, #{$dd-text-secondary});
  font-size: $dd-font-size-body;
  line-height: $dd-line-height-body;

  &--active {
    background: var(--dd-bg-card, #{$dd-bg-card});
    color: var(--dd-text-primary, #{$dd-text-primary});
    font-weight: 600;

    // 左侧金色选中条
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 6rpx;
      height: 32rpx;
      border-radius: 0 $dd-radius-full $dd-radius-full 0;
      background: var(--dd-primary, #{$dd-primary});
    }
  }

  &--disabled {
    color: var(--dd-text-tertiary, #{$dd-text-tertiary});
  }

  &__text {
    @include dd-ellipsis(1);
  }

  &__badge {
    position: absolute;
    top: $dd-space-2;
    right: $dd-space-2;
    min-width: $dd-space-4;
    height: $dd-space-4;
    padding: 0 $dd-space-1;
    border-radius: $dd-radius-full;
    background: var(--dd-error, #{$dd-error});
    @include dd-flex-center;
  }

  &__badge-text {
    color: $dd-color-white;
    font-size: 20rpx;
    line-height: 1;
  }

  &__dot {
    position: absolute;
    top: $dd-space-2;
    right: $dd-space-2;
    width: $dd-space-2;
    height: $dd-space-2;
    border-radius: 50%;
    background: var(--dd-error, #{$dd-error});
  }
}
</style>
