<template>
  <view class="dd-capsule-button" :class="`dd-capsule-button--${variant}`">
    <view
      v-if="showBack && variant !== 'close-only'"
      class="dd-capsule-button__btn dd-capsule-button__btn--back"
      @click="onBack"
    >
      <view class="dd-capsule-button__arrow"></view>
    </view>
    <view
      v-if="variant === 'default' && showBack && showMenu"
      class="dd-capsule-button__divider"
    ></view>
    <view
      v-if="showMenu && variant !== 'back-only'"
      class="dd-capsule-button__btn dd-capsule-button__btn--menu"
      @click="onMenu"
    >
      <dd-icon name="ellipsis" class="dd-capsule-button__dots" />
    </view>
  </view>
</template>

<script setup lang="ts">
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  variant?: 'default' | 'back-only' | 'close-only'
  showBack?: boolean
  showMenu?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  showBack: true,
  showMenu: true,
})

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'menu'): void
}>()

function onBack() {
  emit('back')
}
function onMenu() {
  emit('menu')
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

// 微信小程序标准 87×32px → 174×64rpx (ponytail: 固定尺寸，H5 降级同样尺寸)
.dd-capsule-button {
  width: 174rpx;
  height: $dd-size-button-sm;
  border-radius: $dd-radius-full;
  @include dd-glass;
  display: flex;
  align-items: stretch;
  overflow: hidden;

  &__btn {
    flex: 1;
    @include dd-flex-center;
    color: $dd-text-secondary;
    @include dd-transition(background 0.2s ease);

    &:active {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  // CSS 绘制返回箭头 "<": border-left+border-bottom + rotate(45deg) (无 SVG，MP 兼容)
  &__arrow {
    width: 20rpx;
    height: 20rpx;
    border-left: $dd-space-1 solid $dd-text-secondary;
    border-bottom: $dd-space-1 solid $dd-text-secondary;
    transform: rotate(45deg);
    margin-left: $dd-space-1;
  }

  &__dots {
    font-size: $dd-font-size-h3;
    line-height: 1;
    color: $dd-text-secondary;
  }

  // 1px 竖向分隔线，仅 default 变体
  &__divider {
    width: 1px;
    height: $dd-space-4;
    align-self: center;
    background: $dd-border-default;
    flex-shrink: 0;
  }

  &--back-only &__btn--back {
    flex: 1;
  }
  &--close-only &__btn--menu {
    flex: 1;
  }
}
</style>
