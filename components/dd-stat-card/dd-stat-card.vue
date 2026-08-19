<template>
  <view
    class="dd-stat-card"
    :class="[`dd-stat-card--${variant}`]"
    :hover-class="hoverable ? 'dd-stat-card--press' : ''"
    :hover-stay-time="100"
    @click="onClick"
  >
    <view class="dd-stat-card__main">
      <text v-if="title" class="dd-stat-card__title">{{ title }}</text>
      <view class="dd-stat-card__value-row">
        <text v-if="prefix" class="dd-stat-card__prefix">{{ prefix }}</text>
        <text class="dd-stat-card__value">{{ displayValue }}</text>
        <view v-if="trend !== 'none'" class="dd-stat-card__trend" :class="`dd-stat-card__trend--${trend}`">
          <dd-icon :name="trend === 'up' ? 'arrow-up' : 'arrow-down'" class="dd-stat-card__trend-arrow" />
          <text v-if="trendValue" class="dd-stat-card__trend-value">{{ trendValue }}</text>
        </view>
      </view>
      <slot></slot>
    </view>
    <view v-if="$slots.footer" class="dd-stat-card__footer">
      <slot name="footer"></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'accent' | 'neutral'
  trend?: 'none' | 'up' | 'down'
  title?: string
  value?: string | number
  prefix?: string
  trendValue?: string
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  trend: 'none',
  title: '',
  value: '',
  prefix: '',
  trendValue: '',
  hoverable: true,
})

const emit = defineEmits<{ (e: 'click', val: Event): void }>()

const slots = useSlots()
void slots

const displayValue = computed(() => String(props.value ?? ''))

function onClick(e: Event) {
  emit('click', e)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-stat-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: $dd-radius-lg;
  padding: $dd-space-4;
  @include dd-transition(transform 0.2s ease);

  &__main {
    display: flex;
    flex-direction: column;
  }

  &__title {
    font-size: $dd-font-size-caption;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.4;
  }

  &__value-row {
    display: flex;
    align-items: baseline;
    gap: 8rpx;
    margin-top: $dd-space-1;
  }

  &__prefix {
    font-size: $dd-font-size-h3;
    font-weight: 700;
    color: #ffffff;
  }

  &__value {
    font-size: $dd-font-size-h1;
    font-weight: 800;
    color: #ffffff;
    line-height: 1.2;
  }

  &__trend {
    display: inline-flex;
    align-items: baseline;
    gap: 4rpx;
    font-size: $dd-font-size-caption;
    font-weight: 600;
    margin-left: $dd-space-1;

    &-arrow {
      font-size: $dd-font-size-caption;
      line-height: 1;
    }

    &--up {
      color: #ffffff;
    }

    &--down {
      color: rgba(255, 255, 255, 0.8);
    }
  }

  &__footer {
    margin-top: $dd-space-3;
    padding-top: $dd-space-3;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    font-size: $dd-font-size-caption;
    color: rgba(255, 255, 255, 0.7);
  }

  &--press {
    transform: scale(0.98);
  }
}

// === 6 渐变变体 ===
.dd-stat-card--primary {
  background: $dd-gradient-primary;
  &:active {
    box-shadow: $dd-shadow-glow-gold-lg;
  }
}

.dd-stat-card--accent {
  background: $dd-gradient-accent-wide;
  &:active {
    box-shadow: $dd-shadow-glow-blue-lg;
  }
}

.dd-stat-card--success {
  background: $dd-gradient-success;
}

.dd-stat-card--warning {
  background: $dd-gradient-warning;
}

.dd-stat-card--error {
  background: $dd-gradient-error;
}

.dd-stat-card--neutral {
  background: $dd-gradient-neutral;
  border: 1px solid $dd-neutral-600;
}
</style>
