<template>
  <view class="dd-calendar">
    <view class="dd-calendar__head">
      <view class="dd-calendar__nav" hover-class="dd-calendar__nav--press" @click="prevMonth">‹</view>
      <text class="dd-calendar__title">{{ currentYear }}年{{ currentMonth + 1 }}月</text>
      <view class="dd-calendar__nav" hover-class="dd-calendar__nav--press" @click="nextMonth">›</view>
    </view>

    <view class="dd-calendar__week">
      <text v-for="w in weekLabels" :key="w" class="dd-calendar__week-item">{{ w }}</text>
    </view>

    <view class="dd-calendar__grid">
      <view
        v-for="cell in dayCells"
        :key="cell.key"
        class="dd-calendar__cell"
        :class="{
          'dd-calendar__cell--blank': cell.blank,
          'dd-calendar__cell--disabled': cell.disabled,
          'dd-calendar__cell--selected': cell.selected,
          'dd-calendar__cell--in-range': cell.inRange,
          'dd-calendar__cell--today': cell.today,
        }"
        hover-class="dd-calendar__cell--press"
        @click="cell.disabled || cell.blank ? undefined : onClickDay(cell)"
      >
        <text class="dd-calendar__day">{{ cell.day }}</text>
      </view>
    </view>

    <view v-if="timeSlots && timeSlots.length && selectedDate" class="dd-calendar__slots">
      <view class="dd-calendar__slots-title">
        <text>时段（{{ selectedDate }}）</text>
      </view>
      <view class="dd-calendar__slots-body">
        <text
          v-for="t in timeSlots"
          :key="selectedDate + t"
          class="dd-calendar__slot"
          :class="{ 'dd-calendar__slot--active': activeSlot === t }"
          hover-class="dd-calendar__slot--press"
          @click="onSlot(t)"
        >{{ t }}</text>
      </view>
    </view>

    <view class="dd-calendar__footer">
      <text class="dd-calendar__footer-btn" hover-class="dd-calendar__footer-btn--press" @click="onCancel">取消</text>
      <text class="dd-calendar__footer-btn dd-calendar__footer-btn--primary" hover-class="dd-calendar__footer-btn--press" @click="onConfirm">确定</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { daysInMonth, firstDayOfMonth, dateFormat, pad2 } from '../../libs/utils'

interface DayCell {
  key: string
  day: number
  date: string
  blank: boolean
  disabled: boolean
  selected: boolean
  inRange: boolean
  today: boolean
}

interface Props {
  modelValue?: string[]
  range?: boolean
  minDate?: string
  maxDate?: string
  disabledDate?: (date: string) => boolean
  timeSlots?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  range: false,
  minDate: '',
  maxDate: '',
  disabledDate: () => false,
  timeSlots: () => [],
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string[]): void
  (e: 'confirm', val: string | string[]): void
  (e: 'change', val: string | string[]): void
  (e: 'slot-click', val: { date: string; time: string }): void
}>()

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth())
const activeSlot = ref<string>('')

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']
const todayStr = dateFormat(now)

const selected = computed<string[]>(() => props.modelValue.slice().sort())

const selection = computed<string | string[]>(() => {
  if (!props.range) return selected.value[selected.value.length - 1] || ''
  if (selected.value.length < 2) return selected.value[0] || ''
  return [selected.value[0], selected.value[selected.value.length - 1]]
})

const selectedDate = computed(() => {
  if (props.range) return Array.isArray(selection.value) ? selection.value.join(' ~ ') : ''
  return selection.value as string
})

const dayCells = computed<DayCell[]>(() => {
  const today = new Date()
  const prevOffset = firstDayOfMonth(currentYear.value, currentMonth.value)
  const dim = daysInMonth(currentYear.value, currentMonth.value)
  const cells: DayCell[] = []
  for (let i = 0; i < prevOffset; i++) {
    cells.push({ key: 'b' + i, day: 0, date: '', blank: true, disabled: false, selected: false, inRange: false, today: false })
  }
  const [selStart, selEnd] = selected.value.length >= 2 ? [selected.value[0], selected.value[selected.value.length - 1]] : [null, null]
  for (let d = 1; d <= dim; d++) {
    const date = `${currentYear.value}-${pad2(currentMonth.value + 1)}-${pad2(d)}`
    const disabled =
      (props.minDate && date < props.minDate) ||
      (props.maxDate && date > props.maxDate) ||
      props.disabledDate(date)
    const selectedFlag = selected.value.includes(date)
    const inRange = !selectedFlag && selStart && selEnd && date > selStart && date < selEnd
    cells.push({
      key: date,
      day: d,
      date,
      blank: false,
      disabled,
      selected: selectedFlag,
      inRange: !!inRange,
      today: date === todayStr,
    })
  }
  return cells
})

function onClickDay(cell: DayCell) {
  let next: string[]
  if (!props.range) {
    next = selected.value.includes(cell.date) ? [] : [cell.date]
  } else if (selected.value.length === 0) {
    next = [cell.date]
  } else {
    // 第二个选择点：若在已选区间内则重置，否则与首点组成区间
    const first = selected.value[0]
    if (cell.date < first) next = [cell.date, first]
    else if (selected.value.length === 1) next = [first, cell.date]
    else next = [cell.date] // 再次点击重置为新起点
  }
  next.sort()
  emit('update:modelValue', next)
  const payload: string | string[] = props.range ? (next.length >= 2 ? [next[0], next[next.length - 1]] : next[0] || '') : next[0] || ''
  emit('change', payload)
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function onSlot(t: string) {
  activeSlot.value = t
  const date = props.range ? (Array.isArray(selection.value) ? selection.value[0] : selection.value) : (selection.value as string)
  emit('slot-click', { date: date || '', time: t })
}

function onCancel() {
  emit('change', props.range ? '' : '')
}

function onConfirm() {
  emit('confirm', selection.value)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-calendar {
  @include dd-glass(sm);
  border-radius: $dd-radius-xl;
  padding: $dd-space-3;
}

.dd-calendar__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $dd-space-2 $dd-space-2;
}

.dd-calendar__nav {
  width: 56rpx;
  height: 56rpx;
  border-radius: $dd-radius-md;
  background: var(--dd-surface-container-high, #{$dd-surface-container-high});
  @include dd-flex-center;
  color: var(--dd-text-secondary, #{$dd-text-secondary});
  font-size: $dd-font-size-h4;

  &--press {
    background: var(--dd-surface-press, #{$dd-surface-press});
  }
}

.dd-calendar__title {
  font-size: $dd-font-size-body;
  font-weight: $dd-font-weight-lead;
  color: var(--dd-text-primary, #{$dd-text-primary});
}

.dd-calendar__week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: $dd-space-1 0;
}

.dd-calendar__week-item {
  text-align: center;
  font-size: $dd-font-size-caption;
  color: var(--dd-text-tertiary, #{$dd-text-tertiary});
}

.dd-calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 4rpx;
}

.dd-calendar__cell {
  height: 72rpx;
  @include dd-flex-center;
  border-radius: $dd-radius-md;

  &--press:not(.dd-calendar__cell--disabled, .dd-calendar__cell--blank) {
    background: var(--dd-surface-hover, #{$dd-surface-hover});
  }
}

.dd-calendar__day {
  font-size: $dd-font-size-body;
  color: var(--dd-text-primary, #{$dd-text-primary});
}

.dd-calendar__cell--blank .dd-calendar__day {
  color: transparent;
}

.dd-calendar__cell--disabled .dd-calendar__day {
  color: var(--dd-text-tertiary, #{$dd-text-tertiary});
  opacity: 0.4;
}

.dd-calendar__cell--today .dd-calendar__day {
  color: var(--dd-primary-400, #{$dd-primary-400});
  font-weight: 700;
}

.dd-calendar__cell--selected {
  background: var(--dd-gradient-primary, #{$dd-gradient-primary});
  .dd-calendar__day {
    color: var(--dd-primary-contrast, #{$dd-primary-contrast});
    font-weight: 700;
  }
}

.dd-calendar__cell--in-range {
  background: rgba(245, 166, 35, 0.18);
  border-radius: 0;
}

.dd-calendar__slots {
  margin-top: $dd-space-3;
  border-top: 1px solid var(--dd-border-subtle, #{$dd-border-subtle});
  padding-top: $dd-space-3;
}

.dd-calendar__slots-title {
  font-size: $dd-font-size-caption;
  color: var(--dd-text-tertiary, #{$dd-text-tertiary});
  margin-bottom: $dd-space-2;
}

.dd-calendar__slots-body {
  display: flex;
  flex-wrap: wrap;
  gap: $dd-space-2;
}

.dd-calendar__slot {
  padding: $dd-space-1 $dd-space-3;
  font-size: $dd-font-size-caption;
  color: var(--dd-text-secondary, #{$dd-text-secondary});
  background: var(--dd-surface-container-high, #{$dd-surface-container-high});
  border-radius: $dd-radius-md;

  &--active {
    color: var(--dd-primary-contrast, #{$dd-primary-contrast});
    background: var(--dd-gradient-primary, #{$dd-gradient-primary});
    font-weight: 700;
  }

  &--press {
    opacity: 0.75;
  }
}

.dd-calendar__footer {
  display: flex;
  justify-content: flex-end;
  gap: $dd-space-3;
  margin-top: $dd-space-3;
  border-top: 1px solid var(--dd-border-subtle, #{$dd-border-subtle});
  padding-top: $dd-space-3;
}

.dd-calendar__footer-btn {
  padding: $dd-space-2 $dd-space-4;
  font-size: $dd-font-size-body;
  color: var(--dd-text-secondary, #{$dd-text-secondary});
  border-radius: $dd-radius-md;

  &--primary {
    color: var(--dd-primary-contrast, #{$dd-primary-contrast});
    background: var(--dd-gradient-primary, #{$dd-gradient-primary});
    font-weight: 700;
  }

  &--press {
    opacity: 0.75;
  }
}
</style>