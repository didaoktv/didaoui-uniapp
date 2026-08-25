<template>
  <view class="dd-goods-sku">
    <view @click="open">
      <slot name="trigger"></slot>
    </view>
    <!-- ponytail: pageInline 仅控制 closeable 与内边距，dd-popup 无内联形态，始终以弹窗呈现 -->
    <dd-popup
      v-model="show"
      position="bottom"
      round
      :closeable="pageInline ? false : closeable"
      @close="close"
    >
      <view class="dd-goods-sku__container" :style="{ padding: pageInline ? '0px' : '' }">
        <view class="dd-goods-sku__header">
          <slot name="header">
            <view class="dd-goods-sku__header__image">
              <image :src="goodsInfo.image || goodsInfo.picture" mode="aspectFill"></image>
            </view>
            <view class="dd-goods-sku__header__info">
              <view class="dd-goods-sku__header__info__price">
                <text class="dd-goods-sku__header__info__price__symbol">¥</text>
                <text class="dd-goods-sku__header__info__price__value">{{ price }}</text>
              </view>
              <view class="dd-goods-sku__header__info__stock">库存 {{ stock }} 件</view>
              <view class="dd-goods-sku__header__info__selected">已选: {{ selectedSkuText }}</view>
            </view>
          </slot>
        </view>

        <scroll-view class="dd-goods-sku__content" scroll-y>
          <view v-for="(treeItem, index) in skuTree" :key="index" class="dd-goods-sku__content__item">
            <view class="dd-goods-sku__content__item__title">{{ treeItem.label }}</view>
            <view class="dd-goods-sku__content__item__list">
              <view
                v-for="(leafItem, leafIndex) in treeItem.children"
                :key="leafIndex"
                class="dd-goods-sku__content__item__list__item"
                :class="{
                  'dd-goods-sku__content__item__list__item--active': isSelected(treeItem.name, leafItem.id),
                  'dd-goods-sku__content__item__list__item--disabled': isDisabled(treeItem.name, leafItem.id),
                }"
                @click="onSkuClick(treeItem.name, leafItem)"
              >
                <text>{{ leafItem.name }}</text>
              </view>
            </view>
          </view>

          <view class="dd-goods-sku__content__count">
            <view class="dd-goods-sku__content__count__title">购买数量</view>
            <view class="dd-goods-sku__content__count__control">
              <dd-stepper
                v-model="buyNum"
                :min="1"
                :max="maxBuyNum"
                :disabled="!canBuy"
              ></dd-stepper>
            </view>
          </view>
        </scroll-view>

        <view class="dd-goods-sku__footer">
          <dd-button type="primary" :disabled="!canBuy" @click="onConfirm">
            {{ confirmText }}
          </dd-button>
        </view>
      </view>
    </dd-popup>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import DdPopup from '../dd-popup/dd-popup.vue'
import DdStepper from '../dd-stepper/dd-stepper.vue'
import DdButton from '../dd-button/dd-button.vue'

interface SkuLeaf {
  id: string | number
  name: string
}

interface SkuTreeItem {
  name: string
  label: string
  children: SkuLeaf[]
}

interface Props {
  /** 商品信息 */
  goodsInfo?: Record<string, any>
  /** SKU树形结构 */
  skuTree?: SkuTreeItem[]
  /** SKU列表 */
  skuList?: Record<string, any>[]
  /** 最大购买数量 */
  maxBuy?: number
  /** 确认按钮文字 */
  confirmText?: string
  /** 是否显示关闭弹窗按钮 */
  closeable?: boolean
  /** 是否页面内联模式 */
  pageInline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  goodsInfo: () => ({}),
  skuTree: () => [],
  skuList: () => [],
  maxBuy: 999,
  confirmText: '确定',
  closeable: true,
  pageInline: false,
})

const emit = defineEmits<{
  (e: 'open'): void
  (e: 'confirm', val: { sku: Record<string, any> | null; goodsInfo: Record<string, any>; num: number; selectedText: string }): void
  (e: 'close'): void
}>()

const show = ref(false)
/** 已选择的SKU */
const selectedSku = reactive<Record<string, string | number | ''>>({})
/** 购买数量 */
const buyNum = ref(1)

if (props.pageInline) {
  show.value = true
}

// 当前价格
const price = computed(() => {
  const comb = getSelectedSkuComb()
  if (comb) return comb.price || comb.price_fee
  return props.goodsInfo.price || props.goodsInfo.price_fee || 0
})

// 当前库存
const stock = computed(() => {
  const comb = getSelectedSkuComb()
  if (comb) return comb.stock || comb.quantity
  return props.goodsInfo.stock || props.goodsInfo.quantity || 0
})

// 最大购买数量
const maxBuyNum = computed(() => {
  return stock.value > props.maxBuy ? props.maxBuy : stock.value
})

// 是否可以购买
const canBuy = computed(() => {
  const selectedSkuCount = Object.keys(selectedSku).filter((key) => selectedSku[key] !== '').length
  return selectedSkuCount === props.skuTree.length && buyNum.value > 0 && stock.value > 0
})

// 已选SKU文字描述
const selectedSkuText = computed(() => {
  const selected: string[] = []
  Object.keys(selectedSku).forEach((key) => {
    const value = selectedSku[key]
    if (value) {
      props.skuTree.forEach((treeItem) => {
        if (treeItem.name === key) {
          treeItem.children.forEach((leafItem) => {
            if (leafItem.id === value) {
              selected.push(leafItem.name)
            }
          })
        }
      })
    }
  })
  return selected.join(', ')
})

// 判断SKU是否被选中
function isSelected(skuKey: string, skuValueId: string | number) {
  return selectedSku[skuKey] === skuValueId
}

// 判断SKU是否禁用
function isDisabled(skuKey: string, skuValueId: string | number) {
  // 构造一个临时的已选中SKU对象
  const tempSelected: Record<string, any> = { ...selectedSku, [skuKey]: skuValueId }

  // 检查是否还有未选择的SKU维度
  const selectedCount = Object.keys(tempSelected).filter((key) => tempSelected[key]).length
  const totalSkuCount = props.skuTree.length

  // 如果所有SKU都已选择，则检查组合是否存在
  if (selectedCount === totalSkuCount) {
    return !getSkuComb(tempSelected)
  }

  // 检查当前选择的SKU是否会导致无法组成有效组合
  for (let i = 0; i < props.skuList.length; i++) {
    const sku = props.skuList[i]
    let match = true

    for (const key in tempSelected) {
      if (tempSelected[key] && sku[key] !== tempSelected[key]) {
        match = false
        break
      }
    }

    if (match) {
      return false
    }
  }

  return true
}

// SKU点击事件
function onSkuClick(skuKey: string, skuValue: SkuLeaf) {
  // 如果是禁用状态，直接返回
  if (isDisabled(skuKey, skuValue.id)) {
    return
  }

  // 如果已选中，则取消选中
  if (selectedSku[skuKey] === skuValue.id) {
    selectedSku[skuKey] = ''
  } else {
    selectedSku[skuKey] = skuValue.id
  }
}

// 获取选中的SKU组合
function getSelectedSkuComb() {
  return getSkuComb(selectedSku)
}

// 根据已选SKU获取组合信息
function getSkuComb(selectedSkuObj: Record<string, any>) {
  const selected: Record<string, any> = { ...selectedSkuObj }

  // 过滤掉空值
  Object.keys(selected).forEach((key) => {
    if (!selected[key]) {
      delete selected[key]
    }
  })

  // 检查是否所有SKU都已选择
  if (Object.keys(selected).length !== props.skuTree.length) {
    return null
  }

  // 查找匹配的SKU组合
  for (let i = 0; i < props.skuList.length; i++) {
    const sku = props.skuList[i]
    let match = true

    for (const key in selected) {
      if (sku[key] !== selected[key]) {
        match = false
        break
      }
    }

    if (match) {
      return sku
    }
  }

  return null
}

// 重置选择
function reset() {
  Object.keys(selectedSku).forEach((key) => delete selectedSku[key])
  buyNum.value = 1
}

function open() {
  show.value = true
  emit('open')
}

// 关闭弹窗（修复原版 this.false = true 笔误）
function close() {
  show.value = false
  emit('close')
}

// 确认选择
function onConfirm() {
  if (!canBuy.value) {
    return
  }

  const selectedSkuComb = getSelectedSkuComb()
  emit('confirm', {
    sku: selectedSkuComb,
    goodsInfo: props.goodsInfo,
    num: buyNum.value,
    selectedText: selectedSkuText.value,
  })
}

defineExpose({ open, close, reset })
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-goods-sku {
  background-color: $dd-bg-elevated;
  overflow: hidden;

  &__container {
    padding: 4rpx 30rpx;
  }

  &__header {
    display: flex;
    flex-direction: row;
    padding: 30rpx 0;
    position: relative;

    &__image {
      width: 180rpx;
      height: 180rpx;
      border-radius: 10rpx;
      overflow: hidden;
      margin-right: 20rpx;

      image {
        width: 100%;
        height: 100%;
      }
    }

    &__info {
      flex: 1;

      &__price {
        display: flex;
        flex-direction: row;
        align-items: baseline;
        margin-bottom: 20rpx;

        &__symbol {
          font-size: 24rpx;
          color: $dd-error-400;
          margin-right: 4rpx;
        }

        &__value {
          font-size: 36rpx;
          color: $dd-error-400;
          font-weight: bold;
        }
      }

      &__stock {
        font-size: 26rpx;
        color: $dd-text-tertiary;
        margin-bottom: 20rpx;
      }

      &__selected {
        font-size: 26rpx;
        color: $dd-text-primary;
      }
    }
  }

  &__content {
    max-height: 600rpx;
    padding: 0 30rpx 30rpx 0;

    &__item {
      margin-bottom: 30rpx;

      &__title {
        font-size: 28rpx;
        color: $dd-text-primary;
        margin-bottom: 20rpx;
      }

      &__list {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        &__item {
          padding: 10rpx 20rpx;
          border: 2rpx solid $dd-border-default;
          border-radius: 10rpx;
          margin-right: 20rpx;
          margin-bottom: 20rpx;
          font-size: 26rpx;
          color: $dd-text-primary;
          background-color: $dd-bg-elevated;

          &--active {
            border-color: $dd-error-400;
            color: $dd-error-400;
          }

          &--disabled {
            color: $dd-neutral-500;
            border-color: $dd-border-default;
          }
        }
      }
    }

    &__count {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      margin-top: 20rpx;

      &__title {
        font-size: 28rpx;
        color: $dd-text-primary;
      }
    }
  }

  &__footer {
    padding: 20rpx 0 40rpx 0;
  }
}
</style>
