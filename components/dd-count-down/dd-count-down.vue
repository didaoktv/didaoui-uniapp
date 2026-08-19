<template>
  <view class="dd-count-down">
    <slot
      :days="timeData.days"
      :hours="timeData.hours"
      :minutes="timeData.minutes"
      :seconds="timeData.seconds"
      :milliseconds="timeData.milliseconds"
      :total="timeData.total"
      :formatted="formattedText"
    >
      <text class="dd-count-down__text">{{ formattedText }}</text>
    </slot>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

interface Props {
  /** 倒计时总时长 (ms) */
  time?: number
  /** 格式: HH:mm:ss | DD天 HH:mm:ss | mm:ss | HH:mm:ss:SSS */
  format?: string
  /** 是否自动开始 */
  autoStart?: boolean
  /** 毫秒级精度 (30ms 节流渲染) */
  millisecond?: boolean
}

interface TimeData {
  days: number
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
  total: number
}

const props = withDefaults(defineProps<Props>(), {
  time: 0,
  format: 'HH:mm:ss',
  autoStart: true,
  millisecond: false,
})

const emit = defineEmits<{
  (e: 'change', data: TimeData): void
  (e: 'finish'): void
  (e: 'start'): void
  (e: 'stop'): void
}>()

const remain = ref(props.time)
// ponytail: 用 endTime + Date.now() 差值而非递减计数，避免 setInterval 漂移累积；ms 模式渲染节流到 30ms
let endTime = 0
let timer: ReturnType<typeof setInterval> | null = null
let finished = false

function parseTime(total: number): TimeData {
  const t = Math.max(0, total)
  return {
    days: Math.floor(t / 86400000),
    hours: Math.floor((t % 86400000) / 3600000),
    minutes: Math.floor((t % 3600000) / 60000),
    seconds: Math.floor((t % 60000) / 1000),
    milliseconds: t % 1000,
    total: t,
  }
}

const timeData = computed<TimeData>(() => parseTime(remain.value))

function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0')
}

const formattedText = computed(() => {
  const d = timeData.value
  return props.format
    .replace('SSS', pad(d.milliseconds, 3))
    .replace('DD', pad(d.days))
    .replace('HH', pad(d.hours))
    .replace('mm', pad(d.minutes))
    .replace('ss', pad(d.seconds))
})

function tick() {
  remain.value = Math.max(0, endTime - Date.now())
  emit('change', timeData.value)
  if (remain.value <= 0) {
    if (!finished) {
      finished = true
      stop()
      emit('finish')
    }
  }
}

function start() {
  if (timer) return
  if (remain.value <= 0) remain.value = props.time
  endTime = Date.now() + remain.value
  finished = false
  emit('start')
  tick()
  const interval = props.millisecond ? 30 : 1000
  timer = setInterval(tick, interval)
}

function stop() {
  if (timer) {
    clearInterval(timer)
    timer = null
    emit('stop')
  }
}

function reset() {
  stop()
  remain.value = props.time
  finished = false
}

defineExpose({ start, stop, reset })

watch(
  () => props.time,
  (val) => {
    remain.value = val
    finished = false
    if (timer) {
      endTime = Date.now() + val
    }
  }
)

onMounted(() => {
  if (props.autoStart && props.time > 0) start()
})

onUnmounted(() => {
  stop()
})
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-count-down {
  display: inline-flex;
  align-items: center;
}

.dd-count-down__text {
  font-size: $dd-font-size-body;
  color: $dd-text-primary;
  font-variant-numeric: tabular-nums;
  font-weight: $dd-font-weight-body;
  line-height: 1;
}
</style>
