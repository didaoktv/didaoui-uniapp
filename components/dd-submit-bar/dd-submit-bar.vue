<template>
  <view
    v-if="placeholder"
    class="dd-submit-bar__placeholder"
    :class="{ 'dd-submit-bar__placeholder--safe': safeAreaInsetBottom }"
  ></view>
  <view class="dd-submit-bar" :class="{ 'dd-submit-bar--safe': safeAreaInsetBottom }">
    <slot name="top"></slot>
    <view v-if="hasTip" class="dd-submit-bar__tip">
      <dd-icon v-if="tipIcon" :name="tipIcon" class="dd-submit-bar__tip-icon" />
      <text v-if="tip" class="dd-submit-bar__tip-text">{{ tip }}</text>
      <slot name="tip"></slot>
    </view>
    <view class="dd-submit-bar__bar">
      <slot></slot>
      <view v-if="hasPrice" class="dd-submit-bar__text" :style="textStyle">
        <text class="dd-submit-bar__label">{{ label }}</text>
        <dd-price
          class="dd-submit-bar__price"
          :rate="priceYuan"
          :currency="currency"
          :decimal-length="decimalLength"
        />
        <text v-if="suffixLabel" class="dd-submit-bar__suffix-label">{{ suffixLabel }}</text>
      </view>
      <slot name="button">
        <dd-button
          class="dd-submit-bar__button"
          round
          :type="buttonType"
          :style="buttonStyle"
          :loading="loading"
          :disabled="disabled"
          @click="onSubmit"
        >{{ buttonText }}</dd-button>
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { CSSProperties } from 'vue'
import DdButton from '../dd-button/dd-button.vue'
import DdIcon from '../dd-icon/dd-icon.vue'
import DdPrice from '../dd-price/dd-price.vue'

interface Props {
  /** 提示文案（tip 区域，如「小计不含服务费」） */
  tip?: string
  /** 价格左侧文案 */
  label?: string
  /** 价格（单位：分），传 number 才渲染价格区 */
  price?: number
  /** 提示区图标名（dd-icon name） */
  tipIcon?: string
  /** 按钮加载态 */
  loading?: boolean
  /** 货币符号 */
  currency?: string
  /** 按钮禁用态 */
  disabled?: boolean
  /** 价格区对齐方式（left/center/right） */
  textAlign?: string
  /** 按钮文案 */
  buttonText?: string
  /** 按钮类型（dd-button type） */
  buttonType?: 'default' | 'primary' | 'secondary' | 'ghost' | 'text' | 'success' | 'warning' | 'danger'
  /** 按钮自定义背景色（透传覆盖 dd-button 背景） */
  buttonColor?: string
  /** 价格右侧附加文案 */
  suffixLabel?: string
  /** 固定在底部时是否生成占位视图 */
  placeholder?: boolean
  /** 价格小数位数 */
  decimalLength?: string | number
  /** 是否预留底部安全区 */
  safeAreaInsetBottom?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tip: '',
  label: '合计：',
  tipIcon: '',
  loading: false,
  currency: '¥',
  disabled: false,
  textAlign: '',
  buttonText: '',
  buttonType: 'danger',
  buttonColor: '',
  suffixLabel: '',
  placeholder: false,
  decimalLength: 2,
  safeAreaInsetBottom: true,
})

const emit = defineEmits<{
  (e: 'submit'): void
}>()

const slots = useSlots()

const hasTip = computed(() => !!props.tip || !!slots.tip)

// Vant 口径：price 单位为分，除以 100 转元交给 dd-price 渲染
const priceYuan = computed(() => (typeof props.price === 'number' ? props.price / 100 : undefined))
const hasPrice = computed(() => priceYuan.value !== undefined)

const textStyle = computed<CSSProperties | undefined>(() =>
  props.textAlign ? { textAlign: props.textAlign as CSSProperties['textAlign'] } : undefined,
)

const buttonStyle = computed(() => (props.buttonColor ? { background: props.buttonColor } : undefined))

function onSubmit() {
  if (props.disabled || props.loading) return
  emit('submit')
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-submit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: $dd-z-index-sticky;
  background: var(--dd-bg-card, #{$dd-bg-card});

  &--safe {
    @include dd-safe-area-bottom;
  }
}

.dd-submit-bar__placeholder {
  width: 100%;
  height: 100rpx;
  box-sizing: content-box;

  &--safe {
    @include dd-safe-area-bottom;
  }
}

.dd-submit-bar__tip {
  display: flex;
  align-items: center;
  padding: $dd-space-2 $dd-space-3;
  background: var(--dd-warning, #{$dd-warning});
  color: $dd-color-white;
  font-size: $dd-font-size-caption;
  line-height: $dd-line-height-caption;
}

.dd-submit-bar__tip-icon {
  margin-right: $dd-space-1;
  font-size: 28rpx;
}

.dd-submit-bar__bar {
  display: flex;
  align-items: center;
  min-height: 100rpx;
  padding: $dd-space-2 $dd-space-3;
}

.dd-submit-bar__text {
  flex: 1;
  padding-right: $dd-space-3;
  color: var(--dd-text-primary, #{$dd-text-primary});
  font-size: $dd-font-size-body;
}

.dd-submit-bar__price {
  margin-left: $dd-space-1;
  color: var(--dd-error, #{$dd-error});
}

.dd-submit-bar__suffix-label {
  margin-left: $dd-space-1;
  color: var(--dd-text-secondary, #{$dd-text-secondary});
  font-size: $dd-font-size-caption;
}

.dd-submit-bar__button {
  flex-shrink: 0;
  min-width: 200rpx;
  margin-left: $dd-space-2;
}
</style>
