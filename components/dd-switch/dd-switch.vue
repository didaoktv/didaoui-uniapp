<template>
  <view
    class="dd-switch"
    :class="[
      `dd-switch--${size}`,
      {
        'dd-switch--on': modelValue,
        'dd-switch--disabled': disabled,
      },
    ]"
    @click="onToggle"
  >
    <view class="dd-switch__thumb"></view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: boolean
  size?: 'md' | 'sm'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  size: 'md',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'change', val: boolean): void
}>()

function onToggle() {
  if (props.disabled) return
  const next = !props.modelValue
  emit('update:modelValue', next)
  emit('change', next)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-switch {
  position: relative;
  flex-shrink: 0;
  border-radius: $dd-radius-full;
  box-sizing: border-box;
  @include dd-transition(background 0.3s, box-shadow 0.3s, border-color 0.3s);

  &__thumb {
    position: absolute;
    top: 50%;
    left: 6rpx;
    transform: translateY(-50%);
    background: #ffffff;
    border-radius: 50%;
    box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.3);
    @include dd-transition(left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1));
  }

  // off
  background: $dd-neutral-800;
  border: 1px solid $dd-glass-border;
  box-shadow: inset 0 2rpx 6rpx rgba(0, 0, 0, 0.3);

  // on
  &--on {
    background: $dd-gradient-primary;
    border-color: rgba($dd-primary-300, 0.5);
    box-shadow: $dd-shadow-glow-gold-lg, inset 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
  }

  &--disabled {
    opacity: 0.4;
    @include dd-no-touch;
  }
}

.dd-switch--md {
  width: 96rpx;
  height: 56rpx;
  .dd-switch__thumb {
    width: 44rpx;
    height: 44rpx;
  }
  &.dd-switch--on .dd-switch__thumb {
    left: calc(100% - 50rpx);
  }
}

.dd-switch--sm {
  width: 76rpx;
  height: 44rpx;
  .dd-switch__thumb {
    width: 32rpx;
    height: 32rpx;
  }
  &.dd-switch--on .dd-switch__thumb {
    left: calc(100% - 38rpx);
  }
}
</style>
