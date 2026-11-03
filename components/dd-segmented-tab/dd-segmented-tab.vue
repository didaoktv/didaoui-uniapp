<template>
  <view
    v-if="variant === 'pill'"
    class="dd-seg dd-seg--pill"
    :class="{ 'dd-seg--sm': size === 'sm', 'dd-seg--no-ellipsis': !ellipsis }"
  >
    <view class="dd-seg__track">
      <view
        v-for="(opt, index) in options"
        :key="index"
        class="dd-seg__item"
        :class="{ 'dd-seg__item--active': index === modelValue }"
        :style="{ zIndex: zIndexConfig.base }"
        @click="onSelect(index)"
      >
        <text class="dd-seg__label">{{ labelOf(opt) }}</text>
      </view>
      <view
        class="dd-seg__indicator"
        :style="indicatorStyle"
      ></view>
    </view>
  </view>
  <view
    v-else
    class="dd-seg dd-seg--text"
    :class="{ 'dd-seg--sm': size === 'sm', 'dd-seg--no-ellipsis': !ellipsis }"
    :style="gapStyle"
  >
    <view
      v-for="(opt, index) in options"
      :key="index"
      class="dd-seg-text__item"
      :class="{ 'dd-seg-text__item--active': index === modelValue }"
      @click="onSelect(index)"
    >
      <text class="dd-seg__label">{{ labelOf(opt) }}</text>
      <view v-if="index === modelValue" class="dd-seg-text__underline"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, ref, watch } from 'vue'
// z-index 统一取 libs/config/zIndex.js（分段项盖住滑块指示器取 base 档）
import zIndexConfig from '../../libs/config/zIndex.js'

interface Props {
  modelValue?: number
  options?: (string | { label: string })[]
  variant?: 'pill' | 'text'
  /** 尺寸：md 标准；sm 小号（与页面 24rpx 字号胶囊控件同高，用于工具行等紧凑场景） */
  size?: 'sm' | 'md'
  /**
   * text 变体水平间距（rpx）。不传则沿用 SCSS 默认 $dd-space-6；
   * 项数多（如 7 项横滑）需要收窄时由消费方显式传值，避免把整体节奏写死在组件里
   */
  gap?: number
  /**
   * 标签超长是否打点省略。默认 true（单行省略号）；
   * false 时不打点也不换行：项改为按内容自适应宽度（放弃等分）、标签强制单行，
   * 总宽超出容器会溢出——标签过长时请精简文案或保留省略
   */
  ellipsis?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  options: () => [],
  variant: 'pill',
  size: 'md',
  ellipsis: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: number): void
  (e: 'change', val: number): void
}>()

const instance = getCurrentInstance()
const indicatorStyle = ref({ width: '0px', transform: 'translateX(0px)' })
// 未传 gap 时不产出内联样式，交回 SCSS 里的 $dd-space-6 兜底
const gapStyle = computed(() =>
  props.gap === undefined ? undefined : { columnGap: `${props.gap}rpx` },
)

function labelOf(opt: string | { label: string }): string {
  return typeof opt === 'string' ? opt : opt.label
}

function onSelect(index: number) {
  if (index === props.modelValue) return
  emit('update:modelValue', index)
  emit('change', index)
}

function measure() {
  if (props.variant !== 'pill') return
  nextTick(() => {
    const query = uni.createSelectorQuery().in(instance)
    query
      .selectAll('.dd-seg__item')
      .boundingClientRect()
      .select('.dd-seg__track')
      .boundingClientRect()
      .exec((res) => {
        const items = (res[0] || []) as UniApp.NodeInfo[]
        const track = res[1] as UniApp.NodeInfo
        if (!items.length || !track) return
        const target = items[props.modelValue]
        // 宽为 0 说明此刻容器不可见（弹层/抽屉/未激活 tab 内挂载），此时不写入几何：
        // 否则指示块会被钉成 0 宽且再无重测触发（可见性变化不会经过本组件的 watch）
        if (!target || !target.width || !track.width) return
        const left = (target.left || 0) - (track.left || 0)
        indicatorStyle.value = {
          width: (target.width || 0) + 'px',
          transform: `translateX(${left}px)`,
        }
      })
  })
}

onMounted(measure)
// modelValue（停靠位）/ options（标签改动或引用变化）/ size（sm↔md 档位，改项宽）三者都影响几何，
// 统一监听；deep 用于捕捉 options 元素 label 被就地改写（数组引用不变的场景）
watch([() => props.modelValue, () => props.options, () => props.size], measure, { deep: true })

// 隐藏态挂载的补测入口：父级容器变可见后（弹层打开 / tab 切换）调用一次即可收敛
defineExpose({ refresh: measure })
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-seg {
  font-family: $dd-font-body;
}

// === pill ===
.dd-seg--pill {
  .dd-seg__track {
    position: relative;
    display: flex;
    width: 100%;
    box-sizing: border-box;
    padding: $dd-space-1;
    background: var(--dd-surface-container-high, #{$dd-surface-container-high});
    border: 1px solid var(--dd-border-default, #{$dd-border-default});
    border-radius: $dd-radius-full;
  }

  // 等分填充父容器（antd-mobile Segmented 的做法）：项按 flex 等分，标签超长省略而非撑破容器
  .dd-seg__item {
    position: relative;
    flex: 1 1 0;
    min-width: 0;
    overflow: hidden;
    padding: 12rpx $dd-space-4;
    @include dd-flex-center;
    color: var(--dd-text-tertiary, #{$dd-text-tertiary});
    font-size: $dd-font-size-body;
    font-weight: 500;
    @include dd-transition(color 0.3s);

    &--active {
      color: var(--dd-primary-contrast, #{$dd-primary-contrast});
      font-weight: 600;
    }
  }

  // sm 小号：字号 caption（12px=24rpx）、更紧内边距，整体高度对齐页面 24rpx 字号胶囊
  &.dd-seg--sm {
    .dd-seg__item {
      padding: $dd-space-1;
      font-size: $dd-font-size-caption;
    }
  }

  .dd-seg__indicator {
    position: absolute;
    top: $dd-space-1;
    bottom: $dd-space-1;
    left: 0;
    background: $dd-color-white;
    border-radius: $dd-radius-full;
    box-shadow: var(--dd-shadow-1, #{$dd-shadow-1});
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

// === text ===
.dd-seg--text {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  column-gap: $dd-space-6;
  row-gap: $dd-space-2;

  &.dd-seg--sm {
    .dd-seg-text__item {
      font-size: $dd-font-size-caption;
    }
  }

  .dd-seg-text__item {
    position: relative;
    padding: $dd-space-2 0;
    color: var(--dd-text-tertiary, #{$dd-text-tertiary});
    font-size: $dd-font-size-body;
    font-weight: 500;
    @include dd-flex-center;
    @include dd-transition(color 0.3s);

    &--active {
      color: var(--dd-primary-400, #{$dd-primary-400});
      font-weight: 600;
    }
  }

  .dd-seg-text__underline {
    position: absolute;
    bottom: 0;
    left: 20%;
    width: 60%;
    height: $dd-space-1;
    background: var(--dd-primary-400, #{$dd-primary-400});
    border-radius: $dd-radius-full;
  }
}

.dd-seg__label {
  line-height: 1.2;
  @include dd-ellipsis(1);
}

// ellipsis=false：不打点不换行，项按内容自适应宽度（放弃等分），标签强制单行；
// ponytail: 总宽超出容器会溢出（未做横滑），标签过长请精简文案或保留省略
.dd-seg--no-ellipsis {
  .dd-seg__item,
  .dd-seg-text__item {
    flex: 0 0 auto;
  }

  .dd-seg__label {
    overflow: visible;
    white-space: nowrap;
    text-overflow: clip;
  }
}

// text 变体容器本可换行，no-ellipsis 时整体强制单行
.dd-seg--text.dd-seg--no-ellipsis {
  flex-wrap: nowrap;
}
</style>
