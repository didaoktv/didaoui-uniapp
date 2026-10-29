<template>
  <view
    class="dd-step"
    :class="[`dd-step--${direction}`, `dd-step--${status}`, `dd-step--${size}`]"
    :style="colorStyle"
  >
    <template v-if="direction === 'horizontal'">
      <view class="dd-step__head">
        <view v-if="!isLast" class="dd-step__line" :style="lineStyle"></view>
        <view class="dd-step__circle" :style="circleStyle">
          <dd-icon
            v-if="icon || status === 'finish'"
            :name="icon || 'success'"
            class="dd-step__circle-text"
          />
          <text v-else class="dd-step__circle-text">{{ index + 1 }}</text>
        </view>
      </view>
      <view class="dd-step__content">
        <text class="dd-step__title">{{ title }}</text>
        <text v-if="description" class="dd-step__desc">{{ description }}</text>
      </view>
    </template>

    <template v-else>
      <view class="dd-step__head dd-step__head--vertical">
        <view class="dd-step__circle" :style="circleStyle">
          <dd-icon
            v-if="icon || status === 'finish'"
            :name="icon || 'success'"
            class="dd-step__circle-text"
          />
          <text v-else class="dd-step__circle-text">{{ index + 1 }}</text>
        </view>
        <view
          v-if="!isLast"
          class="dd-step__line dd-step__line--vertical"
          :style="lineStyle"
        ></view>
      </view>
      <view class="dd-step__content dd-step__content--vertical">
        <text class="dd-step__title">{{ title }}</text>
        <text v-if="description" class="dd-step__desc">{{ description }}</text>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'
// z-index 统一取 libs/config/zIndex.js（圆点/连接线的层内叠放取 base 档）
import zIndexConfig from '../../libs/config/zIndex.js'

type StepStatus = 'wait' | 'process' | 'finish'

interface Props {
  title?: string
  description?: string
  /** 圆点内图标（dd-icon 名称），传入后替代序号/完成对勾 */
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  icon: '',
})

const ctx = inject<any>('ddSteps', null)
const index = ctx ? ctx.register() : 0

const direction = computed<'horizontal' | 'vertical'>(() =>
  ctx ? ctx.direction.value : 'horizontal'
)

const size = computed<'sm' | 'md' | 'lg'>(() => (ctx ? ctx.size.value : 'md'))

const status = computed<StepStatus>(() => {
  if (!ctx) return 'wait'
  const active = ctx.active.value
  if (index < active) return 'finish'
  if (index === active) return 'process'
  return 'wait'
})

const isLast = computed(() => (ctx ? index === ctx.count.value - 1 : true))

const activeColor = computed(() => (ctx ? ctx.activeColor.value : ''))
const inactiveColor = computed(() => (ctx ? ctx.inactiveColor.value : ''))

// 仅在外部传入自定义色时覆盖组件私有 CSS 变量，默认色由样式层 token 提供
const colorStyle = computed(() => {
  const vars: Record<string, string> = {}
  if (activeColor.value) vars['--dd-step-active'] = activeColor.value
  if (inactiveColor.value) vars['--dd-step-inactive'] = inactiveColor.value
  return vars
})

const circleStyle = computed(() => ({
  // z-index 统一取 libs/config/zIndex.js（圆点 base 档内 +1，盖住连接线）
  zIndex: zIndexConfig.base + 1,
}))

const lineStyle = computed(() => ({
  // z-index 统一取 libs/config/zIndex.js（连接线垫底取 base 档）
  zIndex: zIndexConfig.base,
}))
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-step {
  /* 组件私有变量：默认取主题 token，外部传 activeColor/inactiveColor 时由 :style 覆盖 */
  --dd-step-active: var(--dd-primary, #{$dd-primary});
  --dd-step-inactive: var(--dd-step-inactive-color, #{$dd-step-inactive-color});
  --dd-step-circle-bg: var(--dd-surface-container-high, #{$dd-surface-container-high});
  --dd-step-circle-fg: #{$dd-color-white};
  /* 尺寸档位：圆点直径 + 圆点/标题/描述字号 */
  --dd-step-circle-size: #{$dd-size-icon-md};
  --dd-step-font-size: #{$dd-font-size-caption};

  &--sm {
    --dd-step-circle-size: #{$dd-size-icon-sm};
    --dd-step-font-size: #{$dd-font-size-overline};
  }

  &--lg {
    --dd-step-circle-size: #{$dd-size-icon-lg};
    --dd-step-font-size: #{$dd-font-size-body};
  }

  &--horizontal {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 0;
  }

  /* 垂直：左侧圆点+连接线，右侧文字 */
  &--vertical {
    display: flex;
    align-items: stretch;
  }

  &__head {
    position: relative;
    width: 100%;
    height: var(--dd-step-circle-size);
    display: flex;
    align-items: center;
    justify-content: center;

    &--vertical {
      width: var(--dd-step-circle-size);
      height: auto;
      flex-direction: column;
      /* 最后一步无连接线时圆点仍需顶部对齐，否则会被 head 垂直居中 */
      justify-content: flex-start;
      align-self: stretch;
      flex-shrink: 0;
    }
  }

  &__line {
    position: absolute;
    top: 50%;
    left: 50%;
    /* 延伸到下一个圆点圆心（各步骤等宽） */
    right: -50%;
    height: 1px;
    background: var(--dd-step-inactive);
    transform: translateY(-50%);

    &--vertical {
      position: static;
      transform: none;
      width: 1px;
      height: auto;
      flex: 1;
      min-height: 32rpx;
      /* 不留底部间隙，让线接到下一个圆点 */
      margin: $dd-space-1 0 0;
    }
  }

  &__circle {
    position: relative;
    width: var(--dd-step-circle-size);
    height: var(--dd-step-circle-size);
    border-radius: $dd-radius-full;
    @include dd-flex-center;
    flex-shrink: 0;
    background: var(--dd-step-circle-bg);
    color: var(--dd-step-inactive);
    @include dd-transition(all 0.3s ease);
  }

  /* 进行中/已完成：圆点取品牌色，文字取反白色 */
  &--process &__circle,
  &--finish &__circle {
    background: var(--dd-step-active);
    color: var(--dd-step-circle-fg);
  }

  /* 连接线按下一步骤状态着色：仅已完成段为品牌色 */
  &--finish &__line {
    background: var(--dd-step-active);
  }

  &__circle-text {
    font-size: var(--dd-step-font-size);
    font-weight: 700;
    line-height: 1;
  }

  &__content {
    text-align: center;
    margin-top: $dd-space-1;

    &--vertical {
      text-align: left;
      flex: 1;
      padding-bottom: $dd-space-4;
      padding-left: $dd-space-1;
      margin-top: 0;
    }
  }

  &__title {
    font-size: var(--dd-step-font-size);
    color: var(--dd-text-primary, #{$dd-text-primary});
    line-height: $dd-line-height-caption;
  }

  &__desc {
    display: block;
    margin-top: $dd-space-1;
    font-size: var(--dd-step-font-size);
    color: var(--dd-text-tertiary, #{$dd-text-tertiary});
    line-height: 1.4;
  }
}
</style>
