<template>
  <view
    class="dd-goods-card"
    :class="[
      `dd-goods-card--${layout}`,
      { 'dd-goods-card--disabled': disabled },
    ]"
    :style="customStyle"
    :hover-class="hoverable ? 'dd-goods-card--hover' : ''"
    :hover-stay-time="120"
    @click="onClick"
  >
    <!-- 缩略图 + 金色角标 -->
    <view class="dd-goods-card__thumb">
      <slot name="thumb">
        <image
          class="dd-goods-card__thumb-img"
          :src="thumb"
          :mode="thumbMode"
        ></image>
      </slot>
      <text v-if="tag" class="dd-goods-card__tag">{{ tag }}</text>
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
            ></dd-price>
            <text v-if="originPrice" class="dd-goods-card__price-origin">
              {{ currency }}{{ originPrice }}
            </text>
          </view>
          <text v-if="num" class="dd-goods-card__num">×{{ num }}</text>
        </view>

        <view v-if="$slots.bottom" class="dd-goods-card__bottom">
          <slot name="bottom"></slot>
        </view>
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import DdPrice from '../dd-price/dd-price.vue'

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
  num: '',
  disabled: false,
  thumbMode: 'aspectFill',
  hoverable: true,
  customStyle: '',
})

const emit = defineEmits<{ (e: 'click', val: Event): void }>()

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

    &-img {
      display: block;
      width: 100%;
      height: 100%;
    }
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
    z-index: 1;
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
    // 两行省略
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  &__price-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
  }

  &__price {
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
  }

  &__num {
    margin-left: $dd-space-2;
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
</style>