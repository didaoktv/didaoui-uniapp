<template>
  <view class="dd-avatar" :class="[`dd-avatar--${size}`, `dd-avatar--${shape}`, { 'dd-avatar--vip': vip }]">
    <view class="dd-avatar__inner">
      <image
        v-if="src && !fallback"
        class="dd-avatar__img"
        :src="src"
        mode="aspectFill"
        @error="onImgError"
      />
      <view v-else class="dd-avatar__text-wrap">
        <text class="dd-avatar__text">{{ displayText }}</text>
      </view>
    </view>
    <view v-if="online" class="dd-avatar__online"></view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  src?: string
  text?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
  vip?: boolean
  online?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  text: '',
  size: 'md',
  shape: 'circle',
  vip: false,
  online: false,
})

const fallback = ref(false)

const displayText = computed(() => {
  const t = props.text || ''
  return t ? t.charAt(0).toUpperCase() : ''
})

function onImgError() {
  fallback.value = true
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-avatar {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;

  &__inner {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    background: $dd-gradient-primary;
  }

  &__img {
    width: 100%;
    height: 100%;
  }

  &__text-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  &__text {
    font-family: $dd-font-heading;
    font-weight: 600;
    color: $dd-color-white;
    line-height: 1;
  }

  &__online {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 25%;
    height: 25%;
    min-width: 16rpx;
    min-height: 16rpx;
    max-width: 28rpx;
    max-height: 28rpx;
    border-radius: 50%;
    background: $dd-success-500;
    border: 4rpx solid $dd-bg-elevated;
    box-shadow: 0 0 12rpx rgba(76, 175, 80, 0.6);
    box-sizing: border-box;
  }
}

// === 形状 ===
.dd-avatar--circle .dd-avatar__inner {
  border-radius: 50%;
}

.dd-avatar--square .dd-avatar__inner {
  border-radius: $dd-radius-md;
}

// === 5 尺寸 (px→rpx x2) ===
.dd-avatar--xs {
  width: 48rpx;
  height: 48rpx;
  .dd-avatar__text { font-size: $dd-font-size-caption; }
}

.dd-avatar--sm {
  width: 64rpx;
  height: 64rpx;
  .dd-avatar__text { font-size: $dd-font-size-body; }
}

.dd-avatar--md {
  width: 88rpx;
  height: 88rpx;
  .dd-avatar__text { font-size: $dd-font-size-h3; }
}

.dd-avatar--lg {
  width: 128rpx;
  height: 128rpx;
  .dd-avatar__text { font-size: $dd-font-size-h2; }
}

.dd-avatar--xl {
  width: 192rpx;
  height: 192rpx;
  .dd-avatar__text { font-size: $dd-font-size-h1; }
}

// === VIP: 金色渐变环 + 发光 ===
.dd-avatar--vip {
  padding: 4rpx;
  background: $dd-gradient-primary-wide;
  box-shadow: $dd-shadow-glow-gold-lg;

  .dd-avatar__inner {
    border-radius: inherit;
  }
}

.dd-avatar--vip.dd-avatar--circle {
  border-radius: 50%;
}

.dd-avatar--vip.dd-avatar--square {
  border-radius: $dd-radius-lg;
}
</style>
