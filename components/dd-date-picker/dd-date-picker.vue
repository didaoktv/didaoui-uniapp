<template>
  <view class="dd-dp" :class="{ 'dd-dp--open': show }">
    <view class="dd-dp__mask" @click="onMaskClick"></view>
    <view class="dd-dp__sheet">
      <view class="dd-dp__toolbar">
        <text class="dd-dp__cancel" @click="onCancel">取消</text>
        <text class="dd-dp__title">{{ title }}</text>
        <text class="dd-dp__confirm" @click="onConfirm">确定</text>
      </view>
      <picker-view
        class="dd-dp__wheels"
        :value="indexes"
        :indicator-style="indicatorStyle"
        @change="onPickerChange"
      >
        <picker-view-column v-for="(col, ci) in columns" :key="ci">
          <view v-for="(item, ii) in col" :key="ii" class="dd-dp__item">
            <text class="dd-dp__item-text">{{ item }}</text>
          </view>
        </picker-view-column>
      </picker-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  show?: boolean
  type?: 'date' | 'time' | 'datetime' | 'range'
  modelValue?: string
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  type: 'date',
  modelValue: '',
  title: '选择日期',
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'update:show', val: boolean): void
  (e: 'confirm', val: string): void
  (e: 'cancel'): void
}>()

// ponytail: 年份范围固定为当前年±10 年；range 类型按单日期格式输出(规格声明未完整实现)
const currentYear = new Date().getFullYear()
const startYear = currentYear - 10
const endYear = currentYear + 10

const indicatorStyle =
  'height:80rpx;background:rgba(255,193,7,0.08);border-top:1px solid rgba(255,193,7,0.3);border-bottom:1px solid rgba(255,193,7,0.3);box-shadow:0 0 20rpx rgba(255,193,7,0.15);'

const indexes = ref<number[]>([])

const yearList = computed(() => {
  const arr: string[] = []
  for (let y = startYear; y <= endYear; y++) arr.push(`${y}年`)
  return arr
})
const monthList = Array.from({ length: 12 }, (_, i) => `${i + 1}月`)
const hourList = Array.from({ length: 24 }, (_, i) => `${i}时`)
const minuteList = Array.from({ length: 60 }, (_, i) => `${i}分`)

function daysInMonth(y: number, m: number) {
  return new Date(y, m, 0).getDate()
}
function dayListFor(y: number, m: number) {
  return Array.from({ length: daysInMonth(y, m) }, (_, i) => `${i + 1}日`)
}

const columns = computed<string[][]>(() => {
  const y = startYear + (indexes.value[0] ?? 0)
  const m = (indexes.value[1] ?? 0) + 1
  switch (props.type) {
    case 'time':
      return [hourList, minuteList]
    case 'datetime':
      return [yearList.value, monthList, dayListFor(y, m), hourList, minuteList]
    case 'range':
    case 'date':
    default:
      return [yearList.value, monthList, dayListFor(y, m)]
  }
})

function parseValue(val: string) {
  const now = new Date()
  const base = {
    y: now.getFullYear(),
    m: now.getMonth() + 1,
    d: now.getDate(),
    h: now.getHours(),
    min: now.getMinutes(),
  }
  if (!val) return base
  try {
    if (props.type === 'time') {
      const [h, min] = val.split(':').map(Number)
      return { ...base, h: h || 0, min: min || 0 }
    }
    const [datePart, timePart] = val.split(' ')
    const [y, m, d] = datePart.split('-').map(Number)
    let h = base.h
    let min = base.min
    if (timePart && props.type === 'datetime') {
      const [hh, mm] = timePart.split(':').map(Number)
      h = hh || 0
      min = mm || 0
    }
    return { y: y || base.y, m: m || 1, d: d || 1, h, min }
  } catch {
    return base
  }
}

function initIndexes() {
  const p = parseValue(String(props.modelValue ?? ''))
  const yi = Math.max(0, yearList.value.indexOf(`${p.y}年`))
  const mi = Math.max(0, p.m - 1)
  const di = Math.max(0, p.d - 1)
  if (props.type === 'time') indexes.value = [p.h, p.min]
  else if (props.type === 'datetime') indexes.value = [yi, mi, di, p.h, p.min]
  else indexes.value = [yi, mi, di]
}

watch(() => props.show, (v) => {
  if (v) initIndexes()
})

function onPickerChange(e: any) {
  const val = (e?.detail?.value ?? []).slice()
  const dayIdx = props.type === 'date' || props.type === 'range' ? 2 : props.type === 'datetime' ? 3 : -1
  if (dayIdx >= 0) {
    const y = startYear + (val[0] ?? 0)
    const m = (val[1] ?? 0) + 1
    const maxDay = daysInMonth(y, m)
    if ((val[dayIdx] ?? 0) > maxDay - 1) {
      val[dayIdx] = maxDay - 1
    }
  }
  indexes.value = val
}

function buildOutput() {
  const v = indexes.value
  const pad = (n: number) => String(n).padStart(2, '0')
  if (props.type === 'time') return `${pad(v[0] ?? 0)}:${pad(v[1] ?? 0)}`
  const y = startYear + (v[0] ?? 0)
  const m = (v[1] ?? 0) + 1
  const d = (v[2] ?? 0) + 1
  if (props.type === 'datetime') return `${y}-${pad(m)}-${pad(d)} ${pad(v[3] ?? 0)}:${pad(v[4] ?? 0)}`
  return `${y}-${pad(m)}-${pad(d)}`
}

function close() {
  emit('update:show', false)
}
function onMaskClick() {
  onCancel()
}
function onCancel() {
  emit('cancel')
  close()
}
function onConfirm() {
  const out = buildOutput()
  emit('update:modelValue', out)
  emit('confirm', out)
  close()
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

:deep(.uni-picker-view-mask) {
  background-image: linear-gradient(180deg, hsl(0deg 0% 9% / 95%), hsl(0deg 0% 9% / 60%)), linear-gradient(0deg, hsl(0deg 0% 9% / 95%), hsl(0deg 0% 9% / 60%));
}
.dd-dp {
  &__mask {
    position: fixed;
    inset: 0;
    z-index: $dd-z-index-overlay;
    background: $dd-color-overlay-strong;
    opacity: 0;
    pointer-events: none;
    @include dd-transition(opacity 0.3s);
  }

  &__sheet {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: $dd-z-index-popup;
    background: $dd-neutral-800;
    border-radius: $dd-radius-2xl $dd-radius-2xl 0 0;
    transform: translateY(100%);
    @include dd-transition(transform 0.3s);
    @include dd-safe-area-bottom;
  }

  &--open &__mask {
    opacity: 1;
    pointer-events: auto;
  }
  &--open &__sheet {
    transform: translateY(0);
  }

  &__toolbar {
    @include dd-flex-between;
    height: 96rpx;
    padding: 0 32rpx;
    @include dd-hairline-bottom($dd-border-default);
  }
  &__cancel {
    font-size: 28rpx;
    color: $dd-text-secondary;
  }
  &__title {
    font-size: 32rpx;
    font-weight: 600;
    color: $dd-text-primary;
    @include dd-ellipsis(1);
  }
  &__confirm {
    font-size: 28rpx;
    font-weight: 600;
    color: $dd-primary-400;
  }

  &__wheels {
    width: 100%;
    height: 400rpx;
  }

  &__item {
    @include dd-flex-center;
    height: 80rpx;
  }
  &__item-text {
    font-size: 32rpx;
    color: $dd-text-primary;
  }
}
</style>
