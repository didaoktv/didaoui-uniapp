<template>
  <view
    v-if="placeholder"
    class="dd-cart-bar__placeholder"
    :class="{ 'dd-cart-bar__placeholder--safe': safeAreaInsetBottom }"
  ></view>

  <!-- 弹层打开时栏抬升到 popup 档 +1：遮罩(overlay 档)盖不住栏，弹层面板(popup 档)从栏下方弹出，栏始终可点 -->
  <view
    class="dd-cart-bar"
    :class="[{ 'dd-cart-bar--safe': safeAreaInsetBottom }, customClass]"
    :style="[barStyle, customStyle]"
  >
    <view class="dd-cart-bar__bar">
      <slot></slot>
      <!-- 购物车入口：圆钮 + 数量角标（数量变化时 :key 重建触发弹跳动画重放） -->
      <view class="dd-cart-bar__entry" @click="togglePopup">
        <view class="dd-cart-bar__cart" :class="{ 'dd-cart-bar__cart--empty': totalCount === 0 }">
          <dd-icon :name="totalCount > 0 ? 'cart' : 'cart-o'" class="dd-cart-bar__cart-icon" />
        </view>
        <view :key="totalCount" class="dd-cart-bar__count">
          <dd-badge :content="totalCount" :max="99" />
        </view>
      </view>
      <view class="dd-cart-bar__text">
        <text class="dd-cart-bar__label">{{ label }}</text>
        <dd-price class="dd-cart-bar__price" :rate="totalYuan" :currency="currency" />
        <text v-if="suffixLabel" class="dd-cart-bar__suffix-label">{{ suffixLabel }}</text>
      </view>
      <slot name="button">
        <dd-button
          class="dd-cart-bar__button"
          round
          :type="buttonType"
          :style="buttonStyle"
          :loading="loading"
          :disabled="buttonDisabled"
          @click="onSubmit"
        >{{ buttonText }}</dd-button>
      </slot>
    </view>
  </view>

  <dd-popup
    :model-value="modelValue"
    position="bottom"
    round
    :safe-area-inset-bottom="false"
    @update:model-value="onPopupUpdate"
    @open="emit('open')"
    @close="emit('close')"
    @closed="onPanelClosed"
  >
    <view class="dd-cart-bar__panel">
      <view class="dd-cart-bar__header">
        <text class="dd-cart-bar__title">{{ title }}</text>
        <view class="dd-cart-bar__clear" @click="onClear">
          <dd-icon name="delete-o" class="dd-cart-bar__clear-icon" />
          <text class="dd-cart-bar__clear-text">{{ clearText }}</text>
        </view>
      </view>
      <view v-if="tips" class="dd-cart-bar__tips">
        <text class="dd-cart-bar__tips-text">{{ tips }}</text>
      </view>
      <scroll-view
        v-if="items.length"
        class="dd-cart-bar__list"
        scroll-y
        :style="{ maxHeight: maxListHeight }"
      >
        <!-- 商品行复用 dd-goods-card 小号横卡（96rpx 紧凑图、不渲染描述、价格小一号）；规格随卡 desc 传入（sm 档不显示），数量步进器走 price-right 插槽 -->
        <dd-goods-card
          v-for="item in items"
          :key="item.id"
          class="dd-cart-bar__item-card"
          size="sm"
          :thumb="item.image"
          :title="item.name"
          :desc="item.specs"
          :price="item.price / 100"
          :currency="currency"
          @click="emit('item-click', item)"
        >
          <template #price-right>
            <dd-stepper
              :model-value="item.count"
              :min="1"
              size="sm"
              @click.stop
              @change="onCountChange(item, $event)"
              @minus="onMinus(item)"
            />
          </template>
        </dd-goods-card>
      </scroll-view>
      <view v-else class="dd-cart-bar__empty">
        <dd-icon name="shopping-cart-o" class="dd-cart-bar__empty-icon" />
        <text class="dd-cart-bar__empty-text">购物车还是空的，快去挑选商品吧</text>
      </view>
    </view>
  </dd-popup>

  <!-- 清空二次确认：库内 dd-dialog（dialog 档 2011，恒高于本组件 popup 面板 2002），不用 uni.showModal（H5 端 z-index 999 会被自家面板盖住） -->
  <dd-dialog
    v-model="clearDialogVisible"
    title="提示"
    message="确定清空购物车吗？"
    confirm-text="确定"
    :show-cancel-button="true"
    @confirm="doClear"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CSSProperties } from 'vue'
import DdBadge from '../dd-badge/dd-badge.vue'
import DdButton from '../dd-button/dd-button.vue'
import DdDialog from '../dd-dialog/dd-dialog.vue'
import DdGoodsCard from '../dd-goods-card/dd-goods-card.vue'
import DdIcon from '../dd-icon/dd-icon.vue'
import DdPopup from '../dd-popup/dd-popup.vue'
import DdPrice from '../dd-price/dd-price.vue'
import DdStepper from '../dd-stepper/dd-stepper.vue'
import type { DdCartItem } from './cart-bar'
// z-index 统一取 libs/config/zIndex.js（底栏 sticky 档；弹层打开时 popup 档内 +1 派生抬升）
import zIndexConfig from '../../libs/config/zIndex.js'

interface Props {
  /** 购物车条目（受控）；增减/清空经 change 回传新数组 */
  items: DdCartItem[]
  /** 购物车弹层显隐（v-model） */
  modelValue?: boolean
  /** 合计左侧文案 */
  label?: string
  /** 合计右侧附加文案（如「共减¥19」） */
  suffixLabel?: string
  /** 弹层顶部提示条（如凑单/温馨提示） */
  tips?: string
  /** 弹层标题 */
  title?: string
  /** 清空按钮文案 */
  clearText?: string
  /** 清空前是否二次确认（库内 dd-dialog） */
  clearConfirm?: boolean
  /** 货币符号 */
  currency?: string
  /** 结算按钮文案 */
  buttonText?: string
  /** 结算按钮类型（dd-button type） */
  buttonType?: 'default' | 'primary' | 'secondary' | 'ghost' | 'text' | 'success' | 'warning' | 'danger'
  /** 结算按钮自定义背景色 */
  buttonColor?: string
  /** 结算按钮加载态 */
  loading?: boolean
  /** 禁用结算（不影响数量增减；空车时自动禁用） */
  disabled?: boolean
  /** 列表最大高（默认 50vh） */
  maxListHeight?: string
  /** 固定在底部时是否生成占位视图 */
  placeholder?: boolean
  /** 是否预留底部安全区 */
  safeAreaInsetBottom?: boolean
  customStyle?: CSSProperties | string
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  label: '',
  suffixLabel: '',
  tips: '',
  title: '已选商品',
  clearText: '清空购物车',
  clearConfirm: true,
  currency: '¥',
  buttonText: '结算',
  buttonType: 'primary',
  buttonColor: '',
  loading: false,
  disabled: false,
  maxListHeight: '50vh',
  placeholder: false,
  safeAreaInsetBottom: true,
  customStyle: undefined,
  customClass: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'open'): void
  (e: 'close'): void
  /** 数量增减/清空后的最新条目（减到 0 的项已剔除） */
  (e: 'change', items: DdCartItem[]): void
  (e: 'clear'): void
  (e: 'submit'): void
  (e: 'item-click', item: DdCartItem): void
}>()

const totalCount = computed(() => props.items.reduce((sum, it) => sum + (it.count || 0), 0))

// 合计（分→元），dd-price 直接展示
const totalYuan = computed(() => props.items.reduce((sum, it) => sum + (it.price || 0) * (it.count || 0), 0) / 100)

const buttonDisabled = computed(() => props.disabled || totalCount.value === 0)

// 弹层打开时栏抬升到 popup 档 +1，且保持到关闭动画结束（popup 的 closed 事件）才降回 sticky 档：
// 否则关闭瞬间栏先掉档，下滑中的面板(2001)会盖在栏(100)上面收起
const barElevated = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    if (val) barElevated.value = true
  },
)

function onPanelClosed() {
  barElevated.value = false
}

const barStyle = computed<CSSProperties>(() => ({
  zIndex: barElevated.value ? zIndexConfig.popup + 1 : zIndexConfig.sticky,
}))

const buttonStyle = computed(() => (props.buttonColor ? { background: props.buttonColor } : undefined))

function onPopupUpdate(val: boolean) {
  emit('update:modelValue', val)
}

function togglePopup() {
  // 空车不允许撑开弹层（业界惯例：角标为 0 时入口不可点）
  if (!props.modelValue && totalCount.value === 0) return
  emit('update:modelValue', !props.modelValue)
}

function onCountChange(item: DdCartItem, val: number) {
  if (val === item.count) return
  emitChange(props.items.map((it) => (it.id === item.id ? { ...it, count: val } : it)))
}

// min=1 拦下减号：数量为 1 再减 = 移除该商品（stepper 此时不再发 change，只发 minus）
function onMinus(item: DdCartItem) {
  if (item.count > 1) return
  emitChange(props.items.filter((it) => it.id !== item.id))
}

function emitChange(items: DdCartItem[]) {
  emit('change', items)
  // 减空/清空后自动收起弹层
  if (items.length === 0 && props.modelValue) emit('update:modelValue', false)
}

/** 清空二次确认弹窗显隐（dd-dialog 在模板尾部独立渲染，经 portal 提到页面根节点） */
const clearDialogVisible = ref(false)

function onClear() {
  if (!props.items.length) return
  if (!props.clearConfirm) return doClear()
  clearDialogVisible.value = true
}

function doClear() {
  emitChange([])
  emit('clear')
}

function onSubmit() {
  if (buttonDisabled.value || props.loading) return
  emit('submit')
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-cart-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--dd-bg-card, #{$dd-bg-card});

  &--safe {
    @include dd-safe-area-bottom;
  }
}

.dd-cart-bar__placeholder {
  width: 100%;
  height: 100rpx;
  box-sizing: content-box;

  &--safe {
    @include dd-safe-area-bottom;
  }
}

.dd-cart-bar__bar {
  display: flex;
  align-items: center;
  min-height: 100rpx;
  padding: $dd-space-2 $dd-space-3;
}

// 入口圆钮：微凸出栏顶（外卖购物车标志视觉）
.dd-cart-bar__entry {
  position: relative;
  flex-shrink: 0;
  margin-right: $dd-space-3;
}

.dd-cart-bar__cart {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  border-radius: $dd-radius-full;
  background: var(--dd-primary, #{$dd-primary});
  color: var(--dd-primary-contrast, #{$dd-primary-contrast});
  box-shadow: var(--dd-shadow-1, #{$dd-shadow-1});

  &--empty {
    background: var(--dd-surface-container-low, #{$dd-surface-container-low});
    color: var(--dd-text-secondary, #{$dd-text-secondary});
    box-shadow: none;
  }
}

.dd-cart-bar__cart-icon {
  font-size: 44rpx;
}

.dd-cart-bar__count {
  position: absolute;
  top: -6rpx;
  right: -10rpx;
  animation: dd-cart-bar-bounce 0.3s;
}

@keyframes dd-cart-bar-bounce {
  0% { transform: scale(0.5); }
  60% { transform: scale(1.25); }
  100% { transform: scale(1); }
}

.dd-cart-bar__text {
  flex: 1;
  padding-right: $dd-space-3;
  color: var(--dd-text-primary, #{$dd-text-primary});
  font-size: $dd-font-size-body;
}

.dd-cart-bar__price {
  margin-left: $dd-space-1;
  color: var(--dd-error, #{$dd-error});
}

.dd-cart-bar__suffix-label {
  margin-left: $dd-space-1;
  color: var(--dd-text-secondary, #{$dd-text-secondary});
  font-size: $dd-font-size-caption;
}

.dd-cart-bar__button {
  flex-shrink: 0;
  min-width: 200rpx;
  margin-left: $dd-space-2;
}

.dd-cart-bar__panel {
  // 底部留出栏高 + 安全区：弹层面板(popup 档)压在栏下方，内容不被栏遮挡
  padding: $dd-space-3 $dd-space-3 calc(100rpx + $dd-space-2*2 + constant(safe-area-inset-bottom));
  padding: $dd-space-3 $dd-space-3 calc(100rpx + $dd-space-2*2 + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.dd-cart-bar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: $dd-space-2;
}

.dd-cart-bar__title {
  color: var(--dd-text-primary, #{$dd-text-primary});
  font-size: $dd-font-size-h4;
  font-weight: $dd-font-weight-h4;
}

.dd-cart-bar__clear {
  display: flex;
  align-items: center;
  color: var(--dd-text-secondary, #{$dd-text-secondary});
  font-size: $dd-font-size-caption;
}

.dd-cart-bar__clear-icon {
  margin-right: $dd-space-1;
  font-size: 28rpx;
}

.dd-cart-bar__tips {
  margin-bottom: $dd-space-2;
  padding: $dd-space-2 $dd-space-3;
  border-radius: $dd-radius-md;
  background: var(--dd-surface-container-low, #{$dd-surface-container-low});
}

.dd-cart-bar__tips-text {
  color: var(--dd-text-secondary, #{$dd-text-secondary});
  font-size: $dd-font-size-caption;
  line-height: $dd-line-height-caption;
}

.dd-cart-bar__list {
  box-sizing: border-box;
}

// 列表行卡片间距（行本体是 dd-goods-card 小号横卡）
.dd-cart-bar__item-card {
  & + & {
    margin-top: $dd-space-2;
  }
}

.dd-cart-bar__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $dd-space-8 0;
}

.dd-cart-bar__empty-icon {
  margin-bottom: $dd-space-2;
  color: var(--dd-text-secondary, #{$dd-text-secondary});
  font-size: 80rpx;
}

.dd-cart-bar__empty-text {
  color: var(--dd-text-secondary, #{$dd-text-secondary});
  font-size: $dd-font-size-caption;
}
</style>
