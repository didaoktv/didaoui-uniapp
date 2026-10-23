<template>
  <view class="dd-package-sku">
    <view @click="open">
      <slot name="trigger"></slot>
    </view>
    <dd-popup
      v-model="show"
      position="bottom"
      round
      :closeable="closeable"
      @close="close"
    >
      <view class="dd-package-sku__container">
        <view class="dd-package-sku__title">{{ title }}</view>

        <view v-if="hasHeader" class="dd-package-sku__header">
          <view class="dd-package-sku__header__image" :class="'dd-package-sku__header__image--' + avatarHue">
            <image v-if="headerImage" :src="headerImage" mode="aspectFill" />
            <text v-else class="dd-package-sku__header__image__text">{{ avatarText }}</text>
          </view>
          <view class="dd-package-sku__header__info">
            <view class="dd-package-sku__header__info__price">
              <text class="dd-package-sku__header__info__price__symbol">¥</text>
              <text class="dd-package-sku__header__info__price__value">{{ price }}</text>
              <text v-if="originPrice" class="dd-package-sku__header__info__price__origin">¥{{ originPrice }}</text>
            </view>
            <view v-if="stock !== undefined && stock !== null" class="dd-package-sku__header__info__stock">
              库存 {{ stock }} 件
            </view>
            <view class="dd-package-sku__header__info__selected">已选: {{ selectedText || '未选择' }}</view>
          </view>
        </view>

        <scroll-view class="dd-package-sku__content" scroll-y>
          <view v-for="group in groups" :key="group.id" class="dd-package-sku__group">
            <view class="dd-package-sku__group__header">
              <text class="dd-package-sku__group__header__name">{{ group.name }}</text>
              <text class="dd-package-sku__group__header__hint">{{ hintText(group) }}</text>
            </view>
            <view class="dd-package-sku__group__list">
              <view
                v-for="item in group.items"
                :key="item.id"
                class="dd-package-sku__chip"
                :class="{
                  'dd-package-sku__chip--active': isSelected(group, item),
                  'dd-package-sku__chip--disabled': itemDisabled(item),
                  'dd-package-sku__chip--fixed': isFixedGroup(group),
                }"
                @click="onItemClick(group, item)"
              >
                <text>{{ item.name }}</text>
                <text v-if="surchargeText(item)" class="dd-package-sku__chip__surcharge">{{ surchargeText(item) }}</text>
                <text v-if="itemDisabled(item)" class="dd-package-sku__chip__soldout">已售罄</text>
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="dd-package-sku__footer">
          <text v-if="!canConfirmNow" class="dd-package-sku__footer__tip">{{ unmetTip }}</text>
          <dd-button type="primary" :disabled="!canConfirmNow" @click="onConfirm">
            {{ confirmText }}
          </dd-button>
        </view>
      </view>
    </dd-popup>
    <!-- 库内 toast（toast 档 2040，恒高于自身 popup 面板）；单例状态，页面另有 dd-toast 时自动共用 -->
    <dd-toast />
  </view>
</template>

<script setup lang="ts">
/**
 * 套餐可选组选择弹层（N选M 多选 + N选1 单选直接替换 + 加价 + 售罄置灰）
 * - groups 通用形状，不绑业务 DTO；FIXED 组只读展示，OPTIONAL 组按 minSel/maxSel 校验
 * - goodsInfo 传入时头部展示图片/价格（底价+已选加价）/库存/已选项，对齐 dd-goods-sku；图块必有，缺图时以主题随机色块 + 套餐名前 2 字占位
 * - confirm emit { options:[{groupId,skuId}], surchargeFen, selectedText }；确认后不自动关闭，由调用方 ref.close()
 */
import { computed, reactive, ref } from 'vue'
import DdPopup from '../dd-popup/dd-popup.vue'
import DdButton from '../dd-button/dd-button.vue'
import DdToast, { showToast } from '../dd-toast/dd-toast.vue'
import { pickAvatarHue, avatarText as calcAvatarText } from '../../libs/utils'
import {
  type PackageSkuGroup,
  type PackageSkuItem,
  type PackageSkuOption,
  type PackageSkuSelections,
  isFixed,
  isItemDisabled,
  groupHint,
  groupMax,
  nextSelection,
  isGroupSatisfied,
  canConfirm as calcCanConfirm,
  unmetText,
  buildOptions,
  computeSurchargeFen,
  buildSelectedText,
  surchargeLabel,
} from './package-sku'

interface Props {
  /** 选择组列表 */
  groups?: PackageSkuGroup[]
  /** 套餐主图/底价/库存（与 dd-goods-sku 对齐：image|picture / price|price_fee / stock|quantity） */
  goodsInfo?: Record<string, any>
  /** 弹层标题 */
  title?: string
  /** 确认按钮文字 */
  confirmText?: string
  /** 是否显示关闭弹窗按钮 */
  closeable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  groups: () => [],
  goodsInfo: () => ({}),
  title: '选择套餐内容',
  confirmText: '确定',
  closeable: true,
})

const emit = defineEmits<{
  (e: 'open'): void
  (e: 'confirm', val: { options: PackageSkuOption[]; surchargeFen: number; selectedText: string }): void
  (e: 'close'): void
}>()

const show = ref(false)
/** 已选项：key = String(group.id) */
const selections = reactive<PackageSkuSelections>({})

const canConfirmNow = computed(() => calcCanConfirm(props.groups, selections))
const unmetTip = computed(() => unmetText(props.groups, selections))

/** 头部（对齐 dd-goods-sku）：传了 goodsInfo 才渲染，存量调用方零改动不显示 */
const hasHeader = computed(() => Object.keys(props.goodsInfo).length > 0)
const headerImage = computed(() => props.goodsInfo.image || props.goodsInfo.picture || '')
/** 缺图时文字占位块：每次 open 从主题 6 档基色随机取底色（libs/utils + dd-avatar-colors mixin） */
const avatarHue = ref<string>(pickAvatarHue())
/** 占位文字：取套餐名前 2 字 */
const avatarText = computed(() => calcAvatarText(props.goodsInfo.name))
/** 展示价（元）= 套餐底价 + 已选 OPTIONAL 项加价合计；按分相加再除 100，避免浮点误差 */
const surchargeFen = computed(() => computeSurchargeFen(props.groups, selections))
const price = computed(
  () =>
    (Math.round((props.goodsInfo.price ?? props.goodsInfo.price_fee ?? 0) * 100) +
      surchargeFen.value) /
    100,
)
/** 划线原价（元）：套餐级营销价，不随加价联动；originPrice|origin_price，缺省不显示 */
const originPrice = computed(() => props.goodsInfo.originPrice || props.goodsInfo.origin_price || '')
/** 库存：缺省不显示库存行（套餐可能无台账库存，如房时套餐） */
const stock = computed(() => props.goodsInfo.stock ?? props.goodsInfo.quantity)
/** 已选项实时摘要（确认前即联动展示） */
const selectedText = computed(() => buildSelectedText(props.groups, selections))

// 模板内避免复杂表达式（小程序约束），逐一下沉为方法
function isFixedGroup(group: PackageSkuGroup): boolean {
  return isFixed(group)
}

function itemDisabled(item: PackageSkuItem): boolean {
  return isItemDisabled(item)
}

function hintText(group: PackageSkuGroup): string {
  return groupHint(group)
}

function surchargeText(item: PackageSkuItem): string {
  return surchargeLabel(item)
}

function isSelected(group: PackageSkuGroup, item: PackageSkuItem): boolean {
  return (selections[String(group.id)] ?? []).includes(item.id)
}

function onItemClick(group: PackageSkuGroup, item: PackageSkuItem): void {
  if (isFixed(group) || isItemDisabled(item)) return
  const key = String(group.id)
  const next = nextSelection(group, selections[key] ?? [], item.id)
  if (next === null) {
    showToast({ message: `最多选择${groupMax(group)}项`, type: 'text' })
    return
  }
  selections[key] = next
}

function reset(): void {
  Object.keys(selections).forEach((key) => delete selections[key])
}

function open(): void {
  avatarHue.value = pickAvatarHue()
  show.value = true
  emit('open')
}

function close(): void {
  show.value = false
  emit('close')
}

function onConfirm(): void {
  if (!canConfirmNow.value) return
  emit('confirm', {
    options: buildOptions(props.groups, selections),
    surchargeFen: computeSurchargeFen(props.groups, selections),
    selectedText: buildSelectedText(props.groups, selections),
  })
}

defineExpose({ open, close, reset })
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-package-sku {
  background-color: var(--dd-bg-elevated, #{$dd-bg-elevated});
  overflow: hidden;

  &__container {
    padding: 4rpx 30rpx;
  }

  &__title {
    padding: 30rpx 0 10rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: var(--dd-text-primary, #{$dd-text-primary});
  }

  &__header {
    display: flex;
    flex-direction: row;
    padding: 20rpx 0;

    &__image {
      width: 180rpx;
      height: 180rpx;
      border-radius: 10rpx;
      overflow: hidden;
      margin-right: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      image {
        width: 100%;
        height: 100%;
      }

      &__text {
        font-size: 56rpx;
        font-weight: bold;
        line-height: 1;
      }

      @include dd-avatar-colors;
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
          color: var(--dd-error-400, #{$dd-error-400});
          margin-right: 4rpx;
        }

        &__value {
          font-size: 36rpx;
          color: var(--dd-error-400, #{$dd-error-400});
          font-weight: bold;
        }

        // 划线原价（样式对齐 dd-goods-card / dd-goods-sku）
        &__origin {
          margin-left: $dd-space-2;
          color: var(--dd-text-tertiary, #{$dd-text-tertiary});
          font-size: 22rpx;
          font-weight: 400;
          text-decoration: line-through;
        }
      }

      &__stock {
        font-size: 26rpx;
        color: var(--dd-text-tertiary, #{$dd-text-tertiary});
        margin-bottom: 20rpx;
      }

      &__selected {
        font-size: 26rpx;
        color: var(--dd-text-primary, #{$dd-text-primary});
      }
    }
  }

  &__content {
    max-height: 640rpx;
    padding-bottom: 10rpx;
  }

  &__group {
    margin-bottom: 30rpx;

    &__header {
      display: flex;
      flex-direction: row;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 20rpx;

      &__name {
        font-size: 28rpx;
        color: var(--dd-text-primary, #{$dd-text-primary});
      }

      &__hint {
        font-size: 24rpx;
        color: var(--dd-text-tertiary, #{$dd-text-tertiary});
      }
    }

    &__list {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
    }
  }

  &__chip {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10rpx 20rpx;
    border: 2rpx solid var(--dd-border-default, #{$dd-border-default});
    border-radius: 10rpx;
    margin-right: 20rpx;
    margin-bottom: 20rpx;
    font-size: 26rpx;
    color: var(--dd-text-primary, #{$dd-text-primary});
    background-color: var(--dd-bg-elevated, #{$dd-bg-elevated});

    &--active {
      border-color: var(--dd-primary, #{$dd-primary});
      color: var(--dd-primary, #{$dd-primary});
    }

    &--disabled {
      color: var(--dd-muted, #{$dd-muted});
      border-color: var(--dd-border-default, #{$dd-border-default});
    }

    &--fixed {
      color: var(--dd-text-secondary, #{$dd-text-secondary});
    }

    &__surcharge {
      margin-left: 8rpx;
      font-size: 24rpx;
      color: var(--dd-error-400, #{$dd-error-400});
    }

    &__soldout {
      margin-left: 8rpx;
      font-size: 22rpx;
      color: var(--dd-error-400, #{$dd-error-400});
    }
  }

  &__footer {
    padding: 20rpx 0 40rpx 0;

    &__tip {
      display: block;
      margin-bottom: 16rpx;
      font-size: 24rpx;
      color: var(--dd-error-400, #{$dd-error-400});
    }
  }
}
</style>
