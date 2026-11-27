<template>
  <view class="dd-week-grid">
    <!-- 表头：周一~周日 -->
    <view class="dd-week-grid__head">
      <view
        v-for="day in days"
        :key="`h-${day.date}`"
        class="dd-week-grid__head-cell"
      >
        <text class="dd-week-grid__weekday">{{ weekdayLabel(day.date) }}</text>
        <text class="dd-week-grid__date">{{ day.date.slice(5) }}</text>
      </view>
    </view>

    <!-- 7 日格子 -->
    <view class="dd-week-grid__body">
      <view
        v-for="day in days"
        :key="day.date"
        class="dd-week-grid__cell"
        :class="{ 'dd-week-grid__cell--rest': day.dayType === 'REST' }"
        @click="onDayTap(day)"
      >
        <block v-if="day.dayType === 'REST'">
          <text class="dd-week-grid__rest">休</text>
        </block>
        <block v-else>
          <view
            v-for="(shift, i) in day.shifts"
            :key="shift.id ?? i"
            class="dd-week-grid__shift"
          >
            <text class="dd-week-grid__time">{{
              shift.startTime === 'REST' ? '休' : shift.startTime
            }}</text>
            <text
              v-if="shift.endTime && shift.startTime !== 'REST'"
              class="dd-week-grid__end"
            >
              ~ {{ shift.endTime }}
            </text>
          </view>
        </block>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * dd-week-grid — 周视图排班网格（组件库首个周视图，dd-calendar 是月历语义不复用）。
 * 输入统一 days 契约（服务端补齐 7 天）；休息日 dayType=REST 且 shifts 为空，前端零派生。
 * ponytail: 仅排班两页（我的 / 管理层）使用；若出现第三种周视图用法再评估泛化。
 */
interface WeekShift {
  id?: string
  startTime: string
  endTime?: string | null
  role?: string | null
  [k: string]: unknown
}
interface WeekDay {
  date: string
  dayType: 'SHIFT' | 'REST'
  shifts: WeekShift[]
}

interface Props {
  days: WeekDay[]
}
defineProps<Props>()

const emit = defineEmits<{
  (e: 'day-tap', day: WeekDay): void
}>()

const LABELS = ['日', '一', '二', '三', '四', '五', '六']
/** 用 UTC 取星期，避开本地时区把日期挪到前一天 */
function weekdayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`)
  return `周${LABELS[d.getUTCDay()]}`
}

function onDayTap(day: WeekDay): void {
  emit('day-tap', day)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-week-grid {
  width: 100%;
  box-sizing: border-box;

  &__head,
  &__body {
    display: flex;
    flex-direction: row;
    width: 100%;
  }

  &__head-cell {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $dd-space-2 0;
  }

  &__weekday {
    font-size: $dd-font-size-caption;
    color: var(--dd-text-secondary, #{$dd-text-secondary});
  }

  &__date {
    font-size: $dd-font-size-overline;
    color: var(--dd-text-tertiary, #{$dd-text-tertiary});
    margin-top: 2rpx;
  }

  &__cell {
    flex: 1;
    min-width: 0;
    min-height: 120rpx;
    margin: 2rpx;
    padding: $dd-space-2;
    box-sizing: border-box;
    border-radius: $dd-radius-md;
    background: var(--dd-bg-section, #{$dd-bg-section});
    display: flex;
    flex-direction: column;
    align-items: center;

    &--rest {
      justify-content: center;
    }
  }

  &__rest {
    font-size: $dd-font-size-caption;
    color: var(--dd-text-tertiary, #{$dd-text-tertiary});
  }

  &__shift {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  &__time {
    font-size: $dd-font-size-body;
    font-weight: 600;
    color: var(--dd-text-primary, #{$dd-text-primary});
    line-height: 1.3;
    letter-spacing: 0.5rpx;
  }

  &__end {
    font-size: $dd-font-size-overline;
    color: var(--dd-text-tertiary, #{$dd-text-tertiary});
    line-height: 1.4;
    margin-top: 2rpx;
  }
}
</style>
