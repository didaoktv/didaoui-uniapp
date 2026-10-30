<template>
  <view class="dd-fold">
    <view class="dd-fold__clip" :style="clipStyle">
      <view class="dd-fold__body">
        <slot />
      </view>
      <view v-if="clamped" class="dd-fold__fade" :style="fadeStyle" />
    </view>
    <view v-if="overflow" class="dd-fold__toggle" @tap.stop="onToggle">
      <text class="dd-fold__toggle-text">{{ expanded ? collapseText : expandText }}</text>
      <dd-icon :name="expanded ? 'arrow-up' : 'arrow-down'" class="dd-fold__icon" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, ref, watch } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  /** 展开态，配合 v-model:expanded 受控（组件本身不做内部状态） */
  expanded?: boolean
  /** 折叠高度（rpx），内容自然高度超过它才折叠 */
  maxHeight?: number
  /** 底部渐变高度（rpx） */
  fadeHeight?: number
  /** 渐变终色，默认取页面底色 token；与所在区域底色不一致时传入 */
  fadeColor?: string
  expandText?: string
  collapseText?: string
}

const props = withDefaults(defineProps<Props>(), {
  expanded: false,
  maxHeight: 320,
  fadeHeight: 96,
  fadeColor: '',
  expandText: '展开详情',
  collapseText: '收起',
})

const emit = defineEmits<{
  (e: 'update:expanded', val: boolean): void
  (e: 'toggle', val: boolean): void
}>()

const instance = getCurrentInstance()
/** 内容自然高度是否超过 maxHeight（低于则完全不折叠，不出现渐变与入口） */
const overflow = ref(false)

const clamped = computed(() => overflow.value && !props.expanded)

const clipStyle = computed(() =>
  clamped.value ? `max-height: ${props.maxHeight}rpx;` : '',
)

const fadeStyle = computed(() => {
  const to = props.fadeColor || 'var(--dd-bg-section, #6b7280)'
  return `height: ${props.fadeHeight}rpx; background: linear-gradient(to bottom, transparent, ${to} 78%);`
})

/** 量内容自然高度（父级 max-height/overflow 不改变子元素自身高度）；rpx→px 用平台换算，各端阈值一致 */
function measure(): void {
  const ctx = instance?.proxy
  if (!ctx) return
  uni
    .createSelectorQuery()
    .in(ctx)
    .select('.dd-fold__body')
    .boundingClientRect((rect) => {
      const height = (rect as { height?: number } | null)?.height ?? 0
      overflow.value = height > uni.upx2px(props.maxHeight) + 0.5
    })
    .exec()
}

/** 手动重量：插槽内容异步变化（加载更多、图片就绪等）后调用 */
defineExpose({ measure })

function onToggle(): void {
  const next = !props.expanded
  emit('update:expanded', next)
  emit('toggle', next)
}

// 首屏等一帧布局落定再量（小程序端 nextTick 早于布局）
onMounted(() => {
  nextTick(() => setTimeout(measure, 60))
})

watch(
  () => props.maxHeight,
  () => nextTick(measure),
)
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-fold {
  width: 100%;

  &__clip {
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  &__fade {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    pointer-events: none;
  }

  &__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $dd-space-1;
    padding-top: $dd-space-1;
    font-size: $dd-font-size-caption;
    line-height: $dd-line-height-caption;
    color: var(--dd-primary-400, #{$dd-primary-400});
  }

  &__icon {
    font-size: 1em;
  }
}
</style>
