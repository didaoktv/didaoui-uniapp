<template>
  <view
    class="dd-checkbox"
    :class="[
      `dd-checkbox--${size}`,
      {
        'dd-checkbox--checked': isChecked,
        'dd-checkbox--indeterminate': indeterminate,
        'dd-checkbox--disabled': isDisabled,
      },
    ]"
    @click="onToggle"
  >
    <view class="dd-checkbox__box">
      <view v-if="indeterminate" class="dd-checkbox__dash"></view>
      <dd-icon v-else-if="isChecked" name="success" class="dd-checkbox__check" />
    </view>
    <text v-if="label || $slots.default" class="dd-checkbox__label">
      <slot>{{ label }}</slot>
    </text>
  </view>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  /** 选项值，dd-checkbox-group 的 modelValue 数组成员 */
  value: any
  disabled?: boolean
  size?: 'md' | 'sm'
  label?: string
  /** 半选态（受控展示，不参与 group 数组逻辑） */
  indeterminate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: null,
  disabled: false,
  size: 'md',
  label: '',
  indeterminate: false,
})

// 必须配合 dd-checkbox-group 使用（vant/uview 同款约定）
const group = inject<{
  props: { modelValue: any[]; disabled: boolean }
  isMaxed: { value: boolean }
  toggle: (value: any) => void
} | null>('dd-checkbox-group', null)

const isChecked = computed(() => !!group?.props.modelValue?.includes(props.value))
const isDisabled = computed(
  () => props.disabled || !!group?.props.disabled || (!!group?.isMaxed.value && !isChecked.value)
)

function onToggle() {
  if (isDisabled.value || !group) return
  group.toggle(props.value)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-checkbox {
  display: inline-flex;
  align-items: center;
  gap: $dd-space-2;
  user-select: none;

  &__box {
    @include dd-flex-center;
    flex-shrink: 0;
    border-radius: $dd-radius-sm;
    border: 3rpx solid $dd-neutral-700;
    background: transparent;
    box-sizing: border-box;
    @include dd-transition(all 0.2s);
  }

  &__check {
    color: $dd-color-white;
    font-size: $dd-font-size-caption;
    font-weight: 700;
    line-height: 1;
  }

  &__dash {
    width: 60%;
    height: $dd-space-1;
    background: $dd-primary-500;
    border-radius: $dd-radius-full;
  }

  &__label {
    font-size: $dd-font-size-body;
    color: $dd-text-primary;
  }

  &--checked .dd-checkbox__box {
    background: $dd-gradient-primary;
    border-color: $dd-primary-500;
    box-shadow: $dd-shadow-glow-gold-lg;
  }

  &--indeterminate .dd-checkbox__box {
    background: rgba($dd-primary-500, 0.1);
    border-color: $dd-primary-500;
  }

  &--disabled {
    opacity: 0.4;
    @include dd-no-touch;
  }
}

.dd-checkbox--md .dd-checkbox__box {
  width: $dd-size-icon-md;
  height: $dd-size-icon-md;
}
.dd-checkbox--sm {
  .dd-checkbox__box {
    width: $dd-size-icon-sm;
    height: $dd-size-icon-sm;
  }
  .dd-checkbox__check {
    font-size: $dd-font-size-caption;
  }
  .dd-checkbox__label {
    font-size: $dd-font-size-body;
  }
}
</style>
