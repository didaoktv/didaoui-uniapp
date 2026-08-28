<template>
  <!-- class/style 经单根节点 fallthrough 合并到 dd-button 根元素 -->
  <dd-button
    :type="type"
    :size="size"
    :disabled="!canGetCode"
    :class="customClass"
    :style="customStyle"
    @click="handleClick"
  >
    {{ showText }}
  </dd-button>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import DdButton from '../dd-button/dd-button.vue'

interface Props {
  /** 倒计时秒数 */
  time?: number | string
  /** 初始文本 */
  startText?: string
  /** 倒计时文本，X/x 占位剩余秒数 */
  changeText?: string
  /** 倒计时结束文本 */
  endText?: string
  /** H5刷新/各端离开再进入时是否继续倒计时 */
  keepRunning?: boolean
  /** 多个组件间的区分 key */
  uniqueKey?: string
  type?: 'primary' | 'secondary' | 'ghost' | 'text' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  customClass?: string
  customStyle?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  time: 60,
  startText: '获取验证码',
  changeText: 'X秒重新获取',
  endText: '重新获取',
  keepRunning: false,
  uniqueKey: 'dd-code-button',
  type: 'primary',
  size: 'sm',
  customClass: '',
  customStyle: () => ({}),
})

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'start'): void
  (e: 'change', seconds: number): void
  (e: 'finish'): void
}>()

const totalSeconds = computed(() => Math.max(1, Math.floor(Number(props.time) || 60)))

const storageKey = computed(() => `dd-code-btn:${props.uniqueKey}`)

const remainMs = ref(totalSeconds.value * 1000)
// 是否点过（用于区分初始文本与结束文本）
const isClick = ref(false)
const isRunning = ref(false)
const canGetCode = ref(true)

// ponytail: endTime + Date.now() 差值计时而非递减计数，避免 setInterval 漂移；小程序退后台定时器冻结，回前台下一个 tick 自动对齐
let endTime = 0
let timer: ReturnType<typeof setInterval> | null = null

const showText = computed(() => {
  if (!isClick.value) return props.startText
  if (!isRunning.value) return props.endText
  const seconds = Math.ceil(remainMs.value / 1000)
  return props.changeText.replace(/X|x/g, String(seconds))
})

function tick() {
  remainMs.value = Math.max(0, endTime - Date.now())
  if (remainMs.value <= 0) {
    finish()
    return
  }
  emit('change', Math.ceil(remainMs.value / 1000))
}

function finish() {
  stopTimer()
  isRunning.value = false
  canGetCode.value = true
  remainMs.value = totalSeconds.value * 1000
  if (props.keepRunning) uni.removeStorageSync(storageKey.value)
  emit('finish')
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

/** 开始倒计时（外部发验证码成功后调用），可传入剩余毫秒用于恢复 */
function start(remainOverride?: number) {
  stopTimer()
  if (!canGetCode.value && isClick.value) return
  emit('start')
  canGetCode.value = false
  isClick.value = true
  isRunning.value = true
  remainMs.value = remainOverride ?? totalSeconds.value * 1000
  endTime = Date.now() + remainMs.value
  // 开始即落盘结束时间戳：H5 刷新/进程被杀时 onUnmounted 不可靠，写一次比每秒写便宜
  if (props.keepRunning) {
    uni.setStorageSync(storageKey.value, Math.floor(endTime / 1000))
  }
  tick()
  timer = setInterval(tick, 1000)
}

function reset() {
  stopTimer()
  canGetCode.value = true
  isRunning.value = false
  remainMs.value = totalSeconds.value * 1000
  if (props.keepRunning) uni.removeStorageSync(storageKey.value)
}

function handleClick() {
  if (!canGetCode.value) return
  emit('click')
}

/** keepRunning: 挂载时检查本地记录的结束时间戳，未到期则续跑 */
function resume() {
  if (!props.keepRunning) return
  const endTs = Number(uni.getStorageSync(storageKey.value))
  if (!endTs) return
  uni.removeStorageSync(storageKey.value)
  const remain = (endTs - Math.floor(Date.now() / 1000)) * 1000
  if (remain > 0) start(remain)
}

onMounted(resume)

onUnmounted(stopTimer)

defineExpose({ canGetCode, start, reset })
</script>
