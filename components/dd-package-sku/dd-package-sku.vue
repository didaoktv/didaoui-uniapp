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
  </view>
</template>

<script setup lang="ts">
/**
 * 套餐可选组选择弹层（N选M 多选 + 加价 + 售罄置灰）
 * - groups 通用形状，不绑业务 DTO；FIXED 组只读展示，OPTIONAL 组按 minSel/maxSel 校验
 * - confirm emit { options:[{groupId,skuId}], surchargeFen, selectedText }；确认后不自动关闭，由调用方 ref.close()
 */
import { computed, reactive, ref } from 'vue'
import DdPopup from '../dd-popup/dd-popup.vue'
import DdButton from '../dd-button/dd-button.vue'
import {
  type PackageSkuGroup,
  type PackageSkuItem,
  type PackageSkuOption,
  type PackageSkuSelections,
  isFixed,
  isItemDisabled,
  groupHint,
  groupMax,
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
  /** 弹层标题 */
  title?: string
  /** 确认按钮文字 */
  confirmText?: string
  /** 是否显示关闭弹窗按钮 */
  closeable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  groups: () => [],
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
  const selected = selections[key] ?? []
  const at = selected.indexOf(item.id)
  if (at >= 0) {
    selected.splice(at, 1)
  } else if (selected.length >= groupMax(group)) {
    uni.showToast({ title: `最多选择${groupMax(group)}项`, icon: 'none' })
    return
  } else {
    selected.push(item.id)
  }
  selections[key] = selected
}

function reset(): void {
  Object.keys(selections).forEach((key) => delete selections[key])
}

function open(): void {
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
