<template>
  <view
    class="dd-goods-card"
    :class="[
      `dd-goods-card--${layout}`,
      `dd-goods-card--${size}`,
      { 'dd-goods-card--disabled': disabled },
    ]"
    :style="customStyle"
    :hover-class="hoverable ? 'dd-goods-card--hover' : ''"
    :hover-stay-time="120"
    @click="onClick"
  >
    <!-- 缩略图 + 金色角标（缺图时文字占位：随机主题底色 + 名称前 2 字） -->
    <view class="dd-goods-card__thumb" :class="'dd-goods-card__thumb--' + avatarHue">
      <slot name="thumb">
        <image
          v-if="thumb"
          class="dd-goods-card__thumb-img"
          :src="thumb"
          :mode="thumbMode"
        ></image>
        <text v-else class="dd-goods-card__thumb-text">{{ avatarText }}</text>
      </slot>
      <text v-if="tag" class="dd-goods-card__tag" :style="{ zIndex: zIndexConfig.base }">{{ tag }}</text>
    </view>

    <!-- 信息区 -->
    <view class="dd-goods-card__body">
      <slot name="default">
        <text v-if="title" class="dd-goods-card__title">{{ title }}</text>
        <text v-if="desc" class="dd-goods-card__desc">{{ desc }}</text>

        <view class="dd-goods-card__price-row">
          <view class="dd-goods-card__price">
            <dd-price
              v-if="price !== undefined && price !== null && price !== ''"
              :rate="price"
              :currency="currency"
              :decimal-length="decimalLength"
              :size="size"
            ></dd-price>
            <text v-if="originPrice" class="dd-goods-card__price-origin">
              {{ currency }}{{ originPrice }}
            </text>
          </view>
          <!-- 价格行右侧扩展位（步进器/加购等与价格同排贴底）；未用时回退已选数量 -->
          <view class="dd-goods-card__price-right flex_m">
            <slot name="price-right">
              <text v-if="num" class="dd-goods-card__num">×{{ num }}</text>
            </slot>
          </view>
        </view>

        <view v-if="$slots.bottom" class="dd-goods-card__bottom">
          <slot name="bottom"></slot>
        </view>
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import DdPrice from '../dd-price/dd-price.vue'
// z-index 统一取 libs/config/zIndex.js（角标抬到缩略图之上取 base 档）
import zIndexConfig from '../../libs/config/zIndex.js'
import { pickAvatarHue, avatarText as calcAvatarText } from '../../libs/utils'

interface Props {
  /** 商品图片地址 */
  thumb?: string
  /** 商品名称 */
  title?: string
  /** 商品描述/规格说明 */
  desc?: string
  /** 单价（元，直接展示）；不传不渲染 */
  price?: string | number
  /** 划线原价（元，直接展示） */
  originPrice?: string | number
  /** 货币符号 */
  currency?: string
  /** 价格小数位数 */
  decimalLength?: string | number
  /** 角标文案（如「热卖」「售罄」） */
  tag?: string
  /** 布局：horizontal 横向（左图右文）/ vertical 竖向（上图下文） */
  layout?: 'horizontal' | 'vertical'
  /** 尺寸：md 常规 / sm 小号（横向用于购物车列表行且不渲染描述，竖向用于一行三列宫格） / xs 超小号（竖向一行四列缩略图，订单卡商品行） */
  size?: 'sm' | 'md' | 'xs'
  /** 已选数量（右下角，不传不渲染） */
  num?: string | number
  /** 置灰（售罄等不可点场景） */
  disabled?: boolean
  /** 图片裁剪模式，透传 image mode */
  thumbMode?: string
  /** 是否启用按压反馈 */
  hoverable?: boolean
  /** 自定义根节点样式 */
  customStyle?: string
}

const props = withDefaults(defineProps<Props>(), {
  thumb: '',
  title: '',
  desc: '',
  price: undefined,
  originPrice: '',
  currency: '¥',
  decimalLength: 2,
  tag: '',
  layout: 'horizontal',
  size: 'md',
  num: '',
  disabled: false,
  thumbMode: 'aspectFill',
  hoverable: true,
  customStyle: '',
})

const emit = defineEmits<{ (e: 'click', val: Event): void }>()

// 缺图文字占位（与 dd-goods-sku / dd-package-sku 同规则）：随机主题底色 + 名称前 2 字（实例化时随机一次）
const avatarHue = ref<string>(pickAvatarHue())
const avatarText = computed(() => calcAvatarText(props.title))

function onClick(e: Event) {
  if (props.disabled) return
  emit('click', e)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-goods-card {
  display: flex;
  box-sizing: border-box;
  background: var(--dd-bg-elevated, #{$dd-bg-elevated});
  // radius 非可换肤 token，走 SCSS 值（与 dd-card 同口径）
  border-radius: $dd-radius-lg;
  box-shadow: var(--dd-shadow-1, #{$dd-shadow-1});
  overflow: hidden;
  @include dd-transition(all 0.3s ease);

  &--hover {
    transform: translateY(-4rpx);
    box-shadow: var(--dd-shadow-2, #{$dd-shadow-2});
  }

  // ponytail: 置灰用整卡降透明度，配合角标「售罄」示意；如需保留文字可读性再改 per-part 置灰
  &--disabled {
    opacity: 0.55;
  }

  &__thumb {
    position: relative;
    flex-shrink: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    &-img {
      display: block;
      width: 100%;
      height: 100%;
    }

    &-text {
      font-size: 40rpx;
      font-weight: bold;
      line-height: 1;
    }

    @include dd-avatar-colors;
  }

  &__tag {
    position: absolute;
    top: $dd-space-1;
    left: $dd-space-1;
    padding: 2rpx $dd-space-2;
    border-radius: $dd-radius-sm;
    background: linear-gradient(
      135deg,
      $dd-primary-600,
      var(--dd-primary, #{$dd-primary})
    );
    color: var(--dd-primary-contrast, #{$dd-primary-contrast});
    font-size: 20rpx;
    line-height: 1.4;
  }

  &__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &__title {
    color: var(--dd-text-primary, #{$dd-text-primary});
    font-size: 28rpx;
    font-weight: 600;
    line-height: 1.4;
    @include dd-ellipsis;
  }

  &__desc {
    margin-top: $dd-space-1;
    color: var(--dd-text-secondary, #{$dd-text-secondary});
    font-size: 24rpx;
    line-height: 1.4;
    // 单行省略：给价格行（现价+划线价）留足横向空间，避免挤出右侧操作位
    @include dd-ellipsis;
  }

  &__price-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
  }

  &__price {
    // 占满剩余宽度且可收缩，划线价过长时自身省略，不把右侧操作位挤出
    flex: 1;
    min-width: 0;
    display: inline-flex;
    align-items: baseline;
    color: var(--dd-error-400, #{$dd-error-400});
    font-weight: 600;
  }

  &__price-origin {
    margin-left: $dd-space-2;
    color: var(--dd-text-tertiary, #{$dd-text-tertiary});
    font-size: 22rpx;
    font-weight: 400;
    text-decoration: line-through;
    // 空间不足时划线价自身省略
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__price-right {
    flex-shrink: 0;
    margin-left: $dd-space-2;
  }

  &__num {
    color: var(--dd-text-tertiary, #{$dd-text-tertiary});
    font-size: 24rpx;
  }

  &__bottom {
    margin-top: $dd-space-2;
    width: 100%;
  }
}

// 横向：左图右文，图 140rpx 见方
.dd-goods-card--horizontal {
  padding: $dd-space-3;

  .dd-goods-card__thumb {
    width: 140rpx;
    height: 140rpx;
    border-radius: $dd-radius-md;
  }

  .dd-goods-card__body {
    padding-left: $dd-space-3;
  }

  .dd-goods-card__title {
    @include dd-ellipsis;
  }
}

// 竖向：上图下文，图占满整宽
.dd-goods-card--vertical {
  flex-direction: column;
  padding: 0;

  .dd-goods-card__thumb {
    width: 100%;
    aspect-ratio: 1;
  }

  .dd-goods-card__body {
    padding: $dd-space-3;
  }
}

// 小号卡：划线价随小号档缩小（价格字号由 dd-price size 联动）
.dd-goods-card--sm {
  .dd-goods-card__price-origin {
    font-size: 20rpx;
  }
}

// 小号横向（购物车列表行）：96rpx 紧凑图 + 小字号，不渲染描述
.dd-goods-card--horizontal.dd-goods-card--sm {
  padding: $dd-space-2;

  .dd-goods-card__thumb {
    width: 96rpx;
    height: 96rpx;
  }

  .dd-goods-card__body {
    padding-left: $dd-space-2;
  }

  .dd-goods-card__title {
    font-size: 26rpx;
  }

  .dd-goods-card__num {
    font-size: 22rpx;
  }
}

// 小号竖向（一行三列宫格）：方图 + 标题最多两行（对齐点选套餐页三列规格卡）
.dd-goods-card--vertical.dd-goods-card--sm {
  .dd-goods-card__body {
    padding: $dd-space-2;
  }

  .dd-goods-card__title {
    font-size: 24rpx;
    @include dd-ellipsis(2);
  }

  .dd-goods-card__desc {
    font-size: 20rpx;
  }
}

// 超小号竖向（一行四列缩略图，订单卡商品行）：去掉卡片底色/阴影，只留圆角方图 + 两行内名称
.dd-goods-card--vertical.dd-goods-card--xs {
  background: transparent;
  box-shadow: none;

  .dd-goods-card__thumb {
    border-radius: $dd-radius-md;
  }

  .dd-goods-card__thumb-text {
    font-size: 28rpx;
  }

  .dd-goods-card__body {
    padding: $dd-space-1 0 0;
  }

  .dd-goods-card__title {
    font-size: 22rpx;
    font-weight: 400;
    @include dd-ellipsis(2);
  }

  // 四列宽度下描述无处安放，超小号不渲染
  .dd-goods-card__desc {
    display: none;
  }

  .dd-goods-card__price-row {
    height: 40rpx;
  }
  // 一条窄卡里价格占满剩余宽度，过长时自身裁切，避免把右侧数量挤出
  .dd-goods-card__price {
    overflow: hidden;
  }

  .dd-goods-card__num {
    font-size: 20rpx;
  }
}
</style>