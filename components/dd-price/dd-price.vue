<template>
  <view v-if="pricePair" class="dd-price">
    <text v-if="prefix" class="dd-price__prefix">{{ prefix }}</text>
    <text class="dd-price__currency">{{ currency }}</text>
    <text class="dd-price__integer">{{ pricePair[0] }}</text>
    <text v-if="pricePair[1]" class="dd-price__decimal">{{ mark }}{{ pricePair[1] }}</text>
    <text v-if="suffix" class="dd-price__suffix">{{ suffix }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 金额（元，直接展示不除以 100）；不传不渲染 */
  rate?: number | string
  /** 小数位数（rate 为 number 时生效，0 隐藏小数） */
  decimalLength?: string | number
  /** 货币符号 */
  currency?: string
  /** 整数/小数分隔符 */
  mark?: string
  /** 额外前缀文案（货币符之前） */
  prefix?: string
  /** 额外后缀文案（如「起」） */
  suffix?: string
}

const props = withDefaults(defineProps<Props>(), {
  rate: undefined,
  decimalLength: 2,
  currency: '¥',
  mark: '.',
  prefix: '',
  suffix: '',
})

const pricePair = computed<string[] | null>(() => {
  if (props.rate === undefined || props.rate === null || props.rate === '') return null
  if (typeof props.rate === 'number') {
    const len = Math.max(0, Number(props.decimalLength) || 0)
    return props.rate.toFixed(len).split('.')
  }
  return props.rate.split('.')
})
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-price {
  display: inline-flex;
  align-items: baseline;
  // ponytail: 颜色跟随使用方（inherit），如 submit-bar 的红价由使用方控制
  color: inherit;
  font-weight: 600;
  line-height: 1;

  &__prefix,
  &__suffix {
    color: var(--dd-text-secondary, #{$dd-text-secondary});
    font-size: 24rpx;
    font-weight: 400;
  }

  &__prefix {
    margin-right: $dd-space-1;
  }

  &__suffix {
    margin-left: $dd-space-1;
  }

  &__currency,
  &__decimal {
    font-size: 24rpx;
  }

  &__integer {
    font-size: 36rpx;
  }
}
</style>
