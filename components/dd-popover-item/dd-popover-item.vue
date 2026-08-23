<template>
  <view
    class="dd-popover-item"
    :class="{ 'dd-popover-item--disabled': disabled }"
    :style="itemStyle"
    @click="onClick"
  >
    <dd-icon v-if="icon" :name="icon" class="dd-popover-item__icon" />
    <text class="dd-popover-item__text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  text?: string
  icon?: string
  value?: any
  disabled?: boolean
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  icon: '',
  value: undefined,
  disabled: false,
  color: '',
})

const emit = defineEmits<{
  (e: 'click', value: any): void
}>()

// inject 父级 dd-popover 的点击中继；不在 dd-popover 内时为 null，点击静默忽略
const popover = inject<{ onSelect: (value: any) => void } | null>('ddPopover', null)

const itemStyle = computed(() => (props.color ? { color: props.color } : {}))

function onClick() {
  if (props.disabled) return
  emit('click', props.value)
  popover?.onSelect(props.value)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-popover-item {
  display: flex;
  align-items: center;
  height: 80rpx;
  padding: 0 $dd-space-4;
  gap: $dd-space-2;
  color: inherit;
  background: transparent;
  @include dd-transition(background 0.15s ease);

  // 首项不显示顶部分隔线，其余项之间用 hairline 分隔
  &:not(:first-child) {
    @include dd-hairline-top($dd-border-default);
  }

  &:active {
    background: $dd-surface-container;
  }

  &--disabled {
    opacity: 0.5;
    @include dd-no-touch;
  }

  &__icon {
    font-size: $dd-font-size-h4;
    line-height: 1;
  }

  &__text {
    flex: 1;
    font-size: $dd-font-size-body;
    @include dd-ellipsis(1);
  }
}
</style>
