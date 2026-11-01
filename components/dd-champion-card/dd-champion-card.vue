<template>
  <view
    class="dd-champ"
    :class="[`dd-champ--${variant}`, `dd-champ--rank${rank}`]"
    @click="onClick"
  >
    <!-- PODIUM: 居中列, 头像按 rank 缩放, rank1 带弹跳皇冠 -->
    <template v-if="variant === 'podium'">
      <view v-if="rank === 1" class="dd-champ__crown">👑</view>
      <view class="dd-champ__avatar" :style="avatarStyle">
        <image v-if="avatar" class="dd-champ__avatar-img" :src="avatar" mode="aspectFill" />
        <text v-else class="dd-champ__avatar-text">{{ initial }}</text>
      </view>
      <text class="dd-champ__name">{{ name }}</text>
      <text class="dd-champ__score">{{ score }}</text>
      <view class="dd-champ__rank-badge">
        <text class="dd-champ__rank-num">{{ rank }}</text>
      </view>
    </template>

    <!-- HORIZONTAL: 行式, 排名号+头像+名字+分数 -->
    <template v-else-if="variant === 'horizontal'">
      <text class="dd-champ__rank-inline">{{ rank }}</text>
      <view class="dd-champ__avatar dd-champ__avatar--sm" :style="avatarStyle">
        <image v-if="avatar" class="dd-champ__avatar-img" :src="avatar" mode="aspectFill" />
        <text v-else class="dd-champ__avatar-text">{{ initial }}</text>
      </view>
      <text class="dd-champ__name dd-champ__name--inline">{{ name }}</text>
      <text class="dd-champ__score dd-champ__score--inline">{{ score }}</text>
    </template>

    <!-- LIST: 无边框行, 小排名徽标+头像+名字+右对齐分数 -->
    <template v-else>
      <view class="dd-champ__rank-badge dd-champ__rank-badge--sm">
        <text class="dd-champ__rank-num">{{ rank }}</text>
      </view>
      <view class="dd-champ__avatar dd-champ__avatar--sm" :style="avatarStyle">
        <image v-if="avatar" class="dd-champ__avatar-img" :src="avatar" mode="aspectFill" />
        <text v-else class="dd-champ__avatar-text">{{ initial }}</text>
      </view>
      <text class="dd-champ__name dd-champ__name--inline">{{ name }}</text>
      <text class="dd-champ__score dd-champ__score--inline dd-champ__score--right">{{ score }}</text>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'podium' | 'horizontal' | 'list'
  rank?: number
  name?: string
  score?: string | number
  avatar?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'podium',
  rank: 1,
  name: '',
  score: '',
  avatar: '',
})

const emit = defineEmits<{ (e: 'click', val: { rank: number }): void }>()

// podium 头像尺寸: rank1=72, rank2=60, rank3=52
const podiumSizeMap: Record<number, number> = { 1: 144, 2: 120, 3: 104 }

// 奖牌色（头像描边/发光/徽标渐变/分数）由 SCSS 按 rank 修饰符取 token
const avatarStyle = computed(() => {
  const size = props.variant === 'podium' ? (podiumSizeMap[props.rank] || 144) : 80
  return {
    width: `${size}rpx`,
    height: `${size}rpx`,
  }
})

const initial = computed(() => {
  if (!props.name) return ''
  return props.name.charAt(0).toUpperCase()
})

function onClick() {
  emit('click', { rank: props.rank })
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-champ {
  box-sizing: border-box;
}

// === PODIUM ===
.dd-champ--podium {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $dd-space-2;
  position: relative;
  padding: $dd-space-4 $dd-space-2;
}

.dd-champ__crown {
  font-size: 56rpx;
  line-height: 1;
  animation: dd-champ-bounce 1.6s ease-in-out infinite;
}

@keyframes dd-champ-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12rpx); }
}

.dd-champ__avatar {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-width: 6rpx;
  border-style: solid;
  border-color: var(--dd-medal-gold, #{$dd-medal-gold});
  box-shadow: 0 0 40rpx rgba($dd-medal-gold, 0.4);
  background: var(--dd-surface-container-high, #{$dd-surface-container-high});
  box-sizing: border-box;

  &--sm {
    border-width: $dd-space-1;
  }
}

.dd-champ__avatar-img {
  width: 100%;
  height: 100%;
}

.dd-champ__avatar-text {
  font-size: $dd-font-size-h3;
  font-weight: 700;
  color: $dd-color-white;
}

.dd-champ__name {
  font-size: $dd-font-size-body;
  font-weight: 600;
  color: var(--dd-text-primary, #{$dd-text-primary});
  @include dd-ellipsis(1);

  &--inline {
    flex: 1;
    min-width: 0;
    margin-left: $dd-space-2;
  }
}

.dd-champ__score {
  font-size: $dd-font-size-caption;
  color: var(--dd-primary-400, #{$dd-primary-400});

  &--inline {
    flex-shrink: 0;
    margin-left: $dd-space-2;
  }

  &--right {
    margin-left: auto;
    text-align: right;
  }
}

// === 奖牌色：默认金（rank ≥4 沿用金），rank2/3 覆写银/铜 ===
.dd-champ--rank1 .dd-champ__score {
  color: var(--dd-medal-gold, #{$dd-medal-gold});
}
.dd-champ--rank2 .dd-champ__score {
  color: var(--dd-medal-silver, #{$dd-medal-silver});
}
.dd-champ--rank3 .dd-champ__score {
  color: var(--dd-medal-bronze, #{$dd-medal-bronze});
}

.dd-champ--rank1 .dd-champ__rank-badge {
  background: linear-gradient(
    135deg,
    var(--dd-medal-gold, #{$dd-medal-gold}) 0%,
    var(--dd-medal-gold-deep, #{$dd-medal-gold-deep}) 100%
  );
}
.dd-champ--rank2 {
  .dd-champ__avatar {
    border-color: var(--dd-medal-silver, #{$dd-medal-silver});
    box-shadow: 0 0 32rpx rgba($dd-medal-silver, 0.4);
  }
  .dd-champ__rank-badge {
    background: linear-gradient(
      135deg,
      var(--dd-medal-silver, #{$dd-medal-silver}) 0%,
      var(--dd-medal-silver-deep, #{$dd-medal-silver-deep}) 100%
    );
  }
}
.dd-champ--rank3 {
  .dd-champ__avatar {
    border-color: var(--dd-medal-bronze, #{$dd-medal-bronze});
    box-shadow: 0 0 24rpx rgba($dd-medal-bronze, 0.4);
  }
  .dd-champ__rank-badge {
    background: linear-gradient(
      135deg,
      var(--dd-medal-bronze, #{$dd-medal-bronze}) 0%,
      var(--dd-medal-bronze-deep, #{$dd-medal-bronze-deep}) 100%
    );
  }
}

.dd-champ__rank-badge {
  position: absolute;
  bottom: -$dd-space-1;
  right: 50%;
  transform: translateX(50%);
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--dd-medal-gold, #{$dd-medal-gold}) 0%,
    var(--dd-medal-gold-deep, #{$dd-medal-gold-deep}) 100%
  );

  &--sm {
    position: static;
    transform: none;
    width: $dd-size-icon-lg;
    height: $dd-size-icon-lg;
    flex-shrink: 0;
  }
}

.dd-champ__rank-num {
  font-size: $dd-font-size-caption;
  font-weight: 800;
  color: var(--dd-primary-contrast, #{$dd-primary-contrast});
  line-height: 1;
}

.dd-champ__rank-inline {
  font-size: $dd-font-size-h3;
  font-weight: 800;
  color: var(--dd-medal-gold, #{$dd-medal-gold});
  flex-shrink: 0;
  width: $dd-size-icon-lg;
  text-align: center;
}

// === HORIZONTAL ===
.dd-champ--horizontal {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: $dd-space-2;
  background: var(--dd-bg-elevated, #{$dd-bg-elevated});
  border: 1px solid var(--dd-border-default, #{$dd-border-default});
  border-radius: $dd-radius-lg;
  padding: $dd-space-3 $dd-space-4;
}

// === LIST ===
.dd-champ--list {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: $dd-space-2;
  background: var(--dd-bg-elevated, #{$dd-bg-elevated});
  border-bottom: 1px solid var(--dd-border-default, #{$dd-border-default});
  padding: $dd-space-3 $dd-space-4;
}
</style>
