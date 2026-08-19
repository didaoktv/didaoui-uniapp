<template>
  <view
    class="dd-room-card"
    :class="[`dd-room-card--${view}`, `dd-room-card--${status}`, `dd-room-card--${type}`]"
    :hover-class="hoverable ? 'dd-room-card--press' : ''"
    :hover-stay-time="100"
    @click="onClick"
  >
    <!-- grid 模式: 方形卡 + 顶部状态栏 -->
    <template v-if="view === 'grid'">
      <view class="dd-room-card__topbar"></view>
      <view v-if="type === 'vip'" class="dd-room-card__vip-tag"><text>VIP</text></view>
      <view class="dd-room-card__grid-inner">
        <text class="dd-room-card__no">{{ roomNo }}</text>
        <view class="dd-room-card__status">
          <view class="dd-room-card__dot"></view>
          <text class="dd-room-card__status-text">{{ statusText }}</text>
        </view>
        <text v-if="capacity" class="dd-room-card__capacity">容纳{{ capacity }}人</text>
      </view>
    </template>

    <!-- list 模式: 头像 + 信息 + 右侧 -->
    <template v-else>
      <view class="dd-room-card__avatar">
        <text class="dd-room-card__avatar-text">{{ avatarText }}</text>
      </view>
      <view class="dd-room-card__list-info">
        <view class="dd-room-card__list-head">
          <text class="dd-room-card__name">{{ roomName || roomNo }}</text>
          <view class="dd-room-card__status dd-room-card__status--inline">
            <view class="dd-room-card__dot"></view>
            <text class="dd-room-card__status-text">{{ statusText }}</text>
          </view>
        </view>
        <text v-if="capacity" class="dd-room-card__capacity dd-room-card__capacity--inline">容纳{{ capacity }}人</text>
      </view>
      <view class="dd-room-card__list-right">
        <text v-if="time" class="dd-room-card__time">{{ time }}</text>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  view?: 'grid' | 'list'
  status?: 'occupied' | 'idle' | 'reserved'
  type?: 'vip' | 'standard' | 'theme'
  roomNo?: string
  roomName?: string
  capacity?: number | string
  time?: string
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  view: 'grid',
  status: 'idle',
  type: 'standard',
  roomNo: '',
  roomName: '',
  capacity: '',
  time: '',
  hoverable: true,
})

const emit = defineEmits<{ (e: 'click', val: { roomNo: string; status: string }): void }>()

const statusMap: Record<string, string> = {
  occupied: '使用中',
  idle: '空闲',
  reserved: '已预订',
}

const statusText = computed(() => statusMap[props.status] || '空闲')

// 头像文字: 房间号末尾数字或首字
const avatarText = computed(() => {
  const no = props.roomNo || props.roomName || ''
  const m = no.match(/\d+$/)
  return m ? m[0].slice(-2) : no.slice(0, 2)
})

function onClick() {
  emit('click', { roomNo: props.roomNo, status: props.status })
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-room-card {
  box-sizing: border-box;
  background: $dd-bg-elevated;
  @include dd-transition(transform 0.2s ease);
}

// === GRID ===
.dd-room-card--grid {
  position: relative;
  border: 1px solid $dd-border-default;
  border-radius: $dd-radius-lg;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  display: flex;
  flex-direction: column;
}

.dd-room-card__topbar {
  height: 12rpx;
  width: 100%;
  background: $dd-surface-container-highest;
  flex-shrink: 0;
}

.dd-room-card__grid-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $dd-space-2;
  padding: $dd-space-2;
}

.dd-room-card__no {
  font-size: $dd-font-size-h1;
  font-weight: $dd-font-weight-h1;
  color: $dd-text-primary;
  line-height: 1.2;
}

.dd-room-card__status {
  display: flex;
  align-items: center;
  gap: 8rpx;

  &--inline {
    margin-left: $dd-space-2;
  }
}

.dd-room-card__dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: $dd-neutral-500;
}

.dd-room-card__status-text {
  font-size: $dd-font-size-caption;
  color: $dd-text-tertiary;
}

.dd-room-card__capacity {
  font-size: $dd-font-size-caption;
  color: $dd-text-tertiary;

  &--inline {
    font-size: $dd-font-size-caption;
  }
}

.dd-room-card__vip-tag {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  z-index: 2;
  padding: 2rpx 12rpx;
  background: $dd-gradient-primary;
  border-radius: $dd-radius-sm;
  text {
    font-size: 20rpx;
    font-weight: 700;
    color: $dd-neutral-900;
    line-height: 1.6;
  }
}

// === 顶部栏/状态色: occupied=gold, reserved=accent, idle=neutral ===
.dd-room-card--occupied.dd-room-card--grid {
  .dd-room-card__topbar {
    background: $dd-gradient-primary-h;
  }
  .dd-room-card__dot {
    background: $dd-primary-400;
    box-shadow: 0 0 12rpx rgba(245, 166, 35, 0.6);
  }
  .dd-room-card__status-text {
    color: $dd-primary-400;
  }
}

.dd-room-card--reserved.dd-room-card--grid {
  .dd-room-card__topbar {
    background: $dd-gradient-accent-h;
  }
  .dd-room-card__dot {
    background: $dd-accent-400;
    box-shadow: 0 0 12rpx rgba(45, 75, 160, 0.6);
  }
  .dd-room-card__status-text {
    color: $dd-accent-300;
  }
}

.dd-room-card--idle.dd-room-card--grid {
  .dd-room-card__topbar {
    background: $dd-surface-container-highest;
  }
}

// === LIST ===
.dd-room-card--list {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: $dd-space-3;
  padding: $dd-space-3 $dd-space-4;
  border: 1px solid $dd-border-default;
  border-radius: $dd-radius-md;
}

.dd-room-card__avatar {
  flex-shrink: 0;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $dd-gradient-accent;

  &-text {
    font-size: $dd-font-size-body;
    font-weight: 700;
    color: $dd-color-white;
  }
}

.dd-room-card--vip .dd-room-card__avatar {
  background: $dd-gradient-primary;
}

.dd-room-card--theme .dd-room-card__avatar {
  background: $dd-gradient-accent;
}

.dd-room-card__list-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.dd-room-card__list-head {
  display: flex;
  align-items: center;
}

.dd-room-card__name {
  font-size: $dd-font-size-body;
  font-weight: 600;
  color: $dd-text-primary;
  @include dd-ellipsis(1);
}

.dd-room-card__list-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.dd-room-card__time {
  font-size: $dd-font-size-caption;
  color: $dd-text-secondary;
}

// list 状态色
.dd-room-card--occupied.dd-room-card--list {
  .dd-room-card__dot {
    background: $dd-primary-400;
    box-shadow: 0 0 12rpx rgba(245, 166, 35, 0.6);
  }
  .dd-room-card__status-text {
    color: $dd-primary-400;
  }
}

.dd-room-card--reserved.dd-room-card--list {
  .dd-room-card__dot {
    background: $dd-accent-400;
    box-shadow: 0 0 12rpx rgba(45, 75, 160, 0.6);
  }
  .dd-room-card__status-text {
    color: $dd-accent-300;
  }
}

.dd-room-card--press {
  transform: scale(0.98);
  opacity: 0.92;
}
</style>
