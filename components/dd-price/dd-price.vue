<template>
  <view
    v-if="pricePair"
    class="dd-price"
    :class="['dd-price--' + size, { 'dd-price--custom-color': color }]"
    :style="color ? { color } : undefined"
  >
    <text v-if="prefix" class="dd-price__prefix" :style="prefixColor ? { color: prefixColor } : undefined">{{ prefix }}</text>
    <text class="dd-price__currency">{{ currency }}</text>
    <text class="dd-price__integer">{{ pricePair[0] }}</text>
    <text v-if="pricePair[1]" class="dd-price__decimal">{{ mark }}{{ pricePair[1] }}</text>
    <text v-if="suffix" class="dd-price__suffix" :style="suffixColor ? { color: suffixColor } : undefined">{{ suffix }}</text>
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
  /** 尺寸：xxs 紧凑行最小号（房态卡片等 22rpx 正文旁）/ xs 最小号（一行四列小卡）/ sm 小号（购物车行/小卡）/ md 常规 / lg 大号（结算条/合计） */
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg'
  /** 主色（CSS 颜色/变量）：整数、货币符、小数、前缀、后缀一起变色；不传则 inherit 跟随上下文（货币符/小数/前后缀保持次级灰） */
  color?: string
  /** 前缀颜色：不传默认跟随 color（color 也不传时保持次级灰） */
  prefixColor?: string
  /** 后缀颜色：不传默认跟随 color（color 也不传时保持次级灰） */
  suffixColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  rate: undefined,
  decimalLength: 2,
  currency: '¥',
  mark: '.',
  prefix: '',
  suffix: '',
  size: 'md',
  color: '',
  prefixColor: '',
  suffixColor: '',
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

  // 自定义主色：前后缀/货币符/小数默认是次级灰，传 color 时统一跟随主色
  // prefixColor / suffixColor 单独传入时由行内 style 覆盖这里的 inherit
  &--custom-color {
    .dd-price__prefix,
    .dd-price__suffix,
    .dd-price__currency,
    .dd-price__decimal {
      color: inherit;
    }
  }

  &__integer {
    font-size: 36rpx;
  }

  // sm：购物车列表行 / 小号商品卡
  &--sm {
    .dd-price__prefix,
    .dd-price__suffix,
    .dd-price__currency,
    .dd-price__decimal {
      font-size: 20rpx;
    }

    .dd-price__integer {
      font-size: 30rpx;
    }
  }

  // xs：超小号商品卡（一行四列），字号再压一档
  &--xs {
    .dd-price__prefix,
    .dd-price__suffix,
    .dd-price__currency,
    .dd-price__decimal {
      font-size: 18rpx;
    }

    .dd-price__integer {
      font-size: 24rpx;
    }
  }

  // xxs：紧凑行最小号（房态卡片等 22rpx 正文旁，整数对齐正文、符号再压一档）
  &--xxs {
    .dd-price__prefix,
    .dd-price__suffix,
    .dd-price__currency,
    .dd-price__decimal {
      font-size: 16rpx;
    }

    .dd-price__integer {
      font-size: 22rpx;
    }
  }

  // lg：结算条 / 合计
  &--lg {
    .dd-price__prefix,
    .dd-price__suffix,
    .dd-price__currency,
    .dd-price__decimal {
      font-size: 28rpx;
    }

    .dd-price__integer {
      font-size: 44rpx;
    }
  }
}
</style>
