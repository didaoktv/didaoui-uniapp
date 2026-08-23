<template>
  <view
    class="dd-workorder-card"
    :class="`dd-workorder-card--${type}`"
    hover-class="dd-workorder-card--press"
    :hover-stay-time="40"
    @click="onClick"
  >
    <view class="dd-workorder-card__head">
      <text class="dd-workorder-card__title">{{ title }}</text>
      <text v-if="status || typeText" class="dd-workorder-card__tag" :class="`dd-workorder-card__tag--${type}`">
        {{ status || typeText }}
      </text>
    </view>

    <view v-if="checklist && checklist.length" class="dd-workorder-card__checklist">
      <view
        v-for="item in checklist"
        :key="item.id"
        class="dd-workorder-card__check-item"
        hover-class="dd-workorder-card__check-item--press"
        :hover-stay-time="40"
        @click.stop="onCheck(item)"
      >
        <view class="dd-workorder-card__box" :class="{ 'dd-workorder-card__box--on': item.done }">
          <text v-if="item.done" class="dd-workorder-card__box-check">✓</text>
        </view>
        <text class="dd-workorder-card__check-text" :class="{ 'dd-workorder-card__check-text--done': item.done }">
          {{ item.text }}
        </text>
      </view>
    </view>

    <view v-if="progress !== undefined" class="dd-workorder-card__progress">
      <view class="dd-workorder-card__progress-track">
        <view class="dd-workorder-card__progress-bar" :style="{ width: progress + '%' }" />
      </view>
      <text class="dd-workorder-card__progress-text">{{ progress }}%</text>
    </view>

    <view v-if="time" class="dd-workorder-card__time">{{ time }}</view>

    <view v-if="$slots.actions" class="dd-workorder-card__actions">
      <slot name="actions" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

interface Props {
  title: string
  type?: 'service' | 'repair' | 'feedback' | 'decoration' | 'todo'
  status?: string
  checklist?: ChecklistItem[]
  progress?: number
  time?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  type: 'todo',
  status: '',
  checklist: () => [],
  progress: undefined,
  time: '',
})

const emit = defineEmits<{
  (e: 'check', val: { item: ChecklistItem; done: boolean }): void
  (e: 'click', val: { title: string }): void
}>()

const typeTextMap: Record<string, string> = {
  service: '服务铃',
  repair: '维修',
  feedback: '反馈',
  decoration: '布置',
  todo: '待办',
}

const typeText = computed(() => (props.status ? '' : typeTextMap[props.type] || '待办'))

function onCheck(item: ChecklistItem) {
  // 受控组件：不直接改 prop，仅把「期望的新状态」上抛，由父级持有 done 状态。
  // 避免父级 @check 再翻转一次导致双重切换。
  const done = !item.done
  emit('check', { item, done })
}

function onClick() {
  emit('click', { title: props.title })
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-workorder-card {
  @include dd-glass(sm);
  border-radius: $dd-radius-lg;
  padding: $dd-space-3 $dd-space-4;

  &--press {
    transform: scale(0.99);
    background: $dd-surface-hover;
  }
}

.dd-workorder-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $dd-space-2;
}

.dd-workorder-card__title {
  flex: 1;
  min-width: 0;
  font-size: $dd-font-size-body;
  font-weight: $dd-font-weight-lead;
  color: $dd-text-primary;
  @include dd-ellipsis(1);
}

.dd-workorder-card__tag {
  flex-shrink: 0;
  font-size: 20rpx;
  padding: 2rpx 14rpx;
  border-radius: $dd-radius-sm;

  &--service { color: $dd-primary-400; background: rgba(245, 166, 35, 0.12); }
  &--repair { color: $dd-error-400; background: rgba(229, 57, 53, 0.12); }
  &--feedback { color: $dd-accent-300; background: rgba(45, 75, 160, 0.2); }
  &--decoration { color: $dd-vip-500; background: rgba(156, 39, 176, 0.14); }
  &--todo { color: $dd-text-secondary; background: $dd-glass-border; }
}

.dd-workorder-card__checklist {
  margin-top: $dd-space-2;
  display: flex;
  flex-direction: column;
}

.dd-workorder-card__check-item {
  display: flex;
  align-items: center;
  gap: $dd-space-2;
  padding: $dd-space-1 0;

  &--press {
    opacity: 0.7;
  }
}

.dd-workorder-card__box {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
  border-radius: $dd-radius-sm;
  border: 2rpx solid $dd-border-strong;
  @include dd-flex-center;

  &--on {
    background: $dd-gradient-primary;
    border-color: transparent;
  }
}

.dd-workorder-card__box-check {
  font-size: $dd-font-size-caption;
  color: $dd-neutral-900;
  line-height: 1;
}

.dd-workorder-card__check-text {
  flex: 1;
  font-size: $dd-font-size-body;
  color: $dd-text-primary;

  &--done {
    color: $dd-text-tertiary;
    text-decoration: line-through;
  }
}

.dd-workorder-card__progress {
  display: flex;
  align-items: center;
  gap: $dd-space-2;
  margin-top: $dd-space-2;
}

.dd-workorder-card__progress-track {
  flex: 1;
  height: $dd-space-1;
  background: $dd-surface-container-high;
  border-radius: $dd-radius-full;
  overflow: hidden;
}

.dd-workorder-card__progress-bar {
  height: 100%;
  background: $dd-gradient-primary-h;
  border-radius: $dd-radius-full;
  transition: width 0.3s ease;
}

.dd-workorder-card__progress-text {
  font-size: $dd-font-size-caption;
  color: $dd-text-tertiary;
  font-family: $dd-font-mono;
}

.dd-workorder-card__time {
  margin-top: $dd-space-1;
  font-size: $dd-font-size-caption;
  color: $dd-text-tertiary;
}

.dd-workorder-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: $dd-space-3;
  margin-top: $dd-space-2;
  border-top: 1px solid $dd-border-subtle;
  padding-top: $dd-space-2;
}
</style>