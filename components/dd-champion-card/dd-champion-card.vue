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
      <view class="dd-champ__rank-badge" :style="rankBadgeStyle">
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
      <view class="dd-champ__rank-badge dd-champ__rank-badge--sm" :style="rankBadgeStyle">
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

// 金/银/铜 字面量色
const tierColors: Record<number, { border: string; glow: string; score: string; badgeStart: string; badgeEnd: string }> = {
  1: { border: '#FFD700', glow: '0 0 40rpx rgba(255,215,0,0.4)', score: '#FFD700', badgeStart: '#FFD700', badgeEnd: '#B8860B' },
  2: { border: '#C0C0C0', glow: '0 0 32rpx rgba(192,192,192,0.4)', score: '#C0C0C0', badgeStart: '#C0C0C0', badgeEnd: '#808080' },
  3: { border: '#CD7F32', glow: '0 0 24rpx rgba(205,127,50,0.4)', score: '#CD7F32', badgeStart: '#CD7F32', badgeEnd: '#8B4513' },
}

// podium 头像尺寸: rank1=72, rank2=60, rank3=52
const podiumSizeMap: Record<number, number> = { 1: 144, 2: 120, 3: 104 }

const tier = computed(() => tierColors[props.rank] || tierColors[1])

const avatarStyle = computed(() => {
  const size = props.variant === 'podium' ? (podiumSizeMap[props.rank] || 144) : 80
  return {
    width: `${size}rpx`,
    height: `${size}rpx`,
    borderColor: tier.value.border,
    boxShadow: tier.value.glow,
  }
})

const rankBadgeStyle = computed(() => ({
  background: `linear-gradient(135deg, ${tier.value.badgeStart} 0%, ${tier.value.badgeEnd} 100%)`,
}))

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
  background: $dd-surface-container-high;
  box-sizing: border-box;

  &--sm {
    border-width: 4rpx;
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
  color: $dd-text-primary;
  @include dd-ellipsis(1);

  &--inline {
    flex: 1;
    min-width: 0;
    margin-left: $dd-space-2;
  }
}

.dd-champ__score {
  font-size: $dd-font-size-caption;
  color: $dd-primary-400;

  &--inline {
    flex-shrink: 0;
    margin-left: $dd-space-2;
  }

  &--right {
    margin-left: auto;
    text-align: right;
  }
}

.dd-champ--rank1 .dd-champ__score {
  color: #FFD700;
}
.dd-champ--rank2 .dd-champ__score {
  color: #C0C0C0;
}
.dd-champ--rank3 .dd-champ__score {
  color: #CD7F32;
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

  &--sm {
    position: static;
    transform: none;
    width: 48rpx;
    height: 48rpx;
    flex-shrink: 0;
  }
}

.dd-champ__rank-num {
  font-size: $dd-font-size-caption;
  font-weight: 800;
  color: $dd-neutral-900;
  line-height: 1;
}

.dd-champ__rank-inline {
  font-size: $dd-font-size-h3;
  font-weight: 800;
  color: #FFD700;
  flex-shrink: 0;
  width: 48rpx;
  text-align: center;
}

// === HORIZONTAL ===
.dd-champ--horizontal {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: $dd-space-2;
  background: $dd-bg-elevated;
  border: 1px solid $dd-border-default;
  border-radius: $dd-radius-lg;
  padding: $dd-space-3 $dd-space-4;
}

// === LIST ===
.dd-champ--list {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: $dd-space-2;
  background: $dd-bg-elevated;
  border-bottom: 1px solid $dd-border-default;
  padding: $dd-space-3 $dd-space-4;
}
</style>
