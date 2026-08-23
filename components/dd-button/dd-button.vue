<template>
  <view
    class="dd-btn"
    :class="[
      `dd-btn--${type}`,
      `dd-btn--${size}`,
      {
        'dd-btn--block': block,
        'dd-btn--round': round,
        'dd-btn--icon-right': iconPosition === 'right',
        'dd-btn--icon-only': isIconOnly,
        'dd-btn--loading': loading,
        'dd-btn--disabled': disabled,
      },
    ]"
    :hover-class="!disabled && !loading ? 'dd-btn--hover' : ''"
    :hover-stay-time="120"
    @click="onClick"
  >
    <view v-if="loading" class="dd-btn__loading"></view>
    <template v-else>
      <slot v-if="$slots.icon" name="icon"></slot>
      <dd-icon v-else-if="icon" :name="icon" class="dd-btn__icon" />
    </template>
    <text v-if="$slots.default" class="dd-btn__label"><slot></slot></text>
  </view>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  type?: 'primary' | 'secondary' | 'ghost' | 'text' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  round?: boolean
  iconPosition?: 'left' | 'right'
  icon?: string
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'md',
  block: false,
  round: false,
  iconPosition: 'left',
  icon: '',
  loading: false,
  disabled: false,
})

const emit = defineEmits<{ (e: 'click', val: Event): void }>()

const slots = useSlots()
const isIconOnly = computed(() => !slots.default && (!!props.icon || !!slots.icon))

function onClick(e: Event) {
  if (props.disabled || props.loading) return
  emit('click', e)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-btn {
  @include dd-flex-center;
  @include dd-transition(background 0.2s, box-shadow 0.2s, opacity 0.2s);
  gap: $dd-space-1;
  box-sizing: border-box;
  border: 1px solid transparent;
  border-radius: $dd-radius-md;
  font-family: $dd-font-body;
  white-space: nowrap;
  user-select: none;
  height: $dd-size-button-md;
  padding: 0 $dd-space-4;
  font-size: $dd-font-size-body;
  font-weight: 600;
  line-height: 1;

  &__icon {
    font-size: $dd-font-size-h4;
    line-height: 1;
  }

  &__label {
    @include dd-ellipsis(1);
  }

  &__loading {
    width: 28rpx;
    height: 28rpx;
    border: 3rpx solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: dd-btn-spin 0.6s linear infinite;
  }

  .dd-btn--icon-only {
    padding: 0;
    width: $dd-size-button-md;
    gap: 0;
  }

  &--block {
    display: flex;
    width: 100%;
  }

  &--icon-right {
    flex-direction: row-reverse;
  }
}

@keyframes dd-btn-spin {
  to {
    transform: rotate(360deg);
  }
}

.dd-btn--sm {
  height: $dd-size-button-sm;
  padding: 0 $dd-space-3;
  font-size: $dd-font-size-caption;
  &.dd-btn--icon-only {
    width: $dd-size-button-sm;
  }
  .dd-btn__loading {
    width: 22rpx;
    height: 22rpx;
  }
}

.dd-btn--lg {
  height: $dd-size-button-lg;
  padding: 0 $dd-space-5;
  font-size: $dd-font-size-h4;
  &.dd-btn--icon-only {
    width: $dd-size-button-lg;
  }
  .dd-btn__loading {
    width: 34rpx;
    height: 34rpx;
  }
}

.dd-btn--primary {
  background: $dd-primary-500;
  color: $dd-neutral-50;
}
.dd-btn--secondary {
  background: $dd-neutral-800;
  color: $dd-primary-400;
  border-color: $dd-neutral-700;
}
.dd-btn--ghost {
  background: transparent;
  color: $dd-neutral-300;
}
.dd-btn--text {
  background: transparent;
  color: $dd-primary-400;
  border-color: transparent;
  border-radius: 0;
  height: auto;
  min-height: $dd-space-5;
  padding: 0 $dd-space-2;
  font-size: $dd-font-size-caption;
  font-weight: 500;
  &.dd-btn--icon-only {
    width: auto;
    padding: 0;
  }
}
.dd-btn--success {
  background: $dd-success-500;
  color: $dd-success-contrast;
}
.dd-btn--warning {
  background: $dd-warning-500;
  color: $dd-warning-contrast;
}
.dd-btn--danger {
  background: $dd-error-500;
  color: $dd-error-contrast;
}

.dd-btn--round {
  border-radius: $dd-radius-full;
}
.dd-btn--text.dd-btn--round {
  border-radius: $dd-radius-full;
}

.dd-btn--hover {
  opacity: 0.85;
}
.dd-btn--secondary.dd-btn--hover,
.dd-btn--ghost.dd-btn--hover {
  opacity: 0.7;
}

.dd-btn--disabled {
  opacity: 0.5;
  @include dd-no-touch;
}
.dd-btn--loading {
  @include dd-no-touch;
}
</style>
