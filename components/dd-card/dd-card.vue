<template>
  <view
    class="dd-card"
    :class="[
      `dd-card--${variant}`,
      padClass,
      {
        'dd-card--border': border,
        'dd-card--active': active,
        'dd-card--hover': hover,
      },
    ]"
    :hover-class="hoverable ? 'dd-card--hover-state' : ''"
    :hover-stay-time="120"
    @click="onClick"
  >
    <view
      v-if="$slots.header || $slots.extra"
      class="dd-card__header"
      :style="padStyle"
    >
      <view class="dd-card__header-inner"><slot name="header"></slot></view>
      <view v-if="$slots.extra" class="dd-card__extra"><slot name="extra"></slot></view>
    </view>
    <view class="dd-card__body" :style="padStyle"><slot></slot></view>
    <view v-if="$slots.footer" class="dd-card__footer" :style="padStyle"><slot name="footer"></slot></view>
  </view>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

interface Props {
  variant?: 'vertical' | 'horizontal' | 'compact'
  /**
   * 内边距（与 variant 正交，统一作用于 header/body/footer）：
   * 档位 none 贴边 / sm 12px / md 16px / lg 24px；也可直接给数字（按 px，如 `padding="24"` 或 `:padding="24"`）
   * 不传=沿用 variant 默认档
   */
  padding?: '' | 'none' | 'sm' | 'md' | 'lg' | number | `${number}`
  border?: boolean
  active?: boolean
  hover?: boolean
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'vertical',
  padding: '',
  border: true,
  active: false,
  hover: false,
  hoverable: false,
})

/** 数字入参（或数字字符串）解析为 px；档位键/空值返回 null */
const customPadPx = computed<number | null>(() => {
  const v = props.padding
  if (typeof v === 'number') return v
  if (typeof v === 'string' && /^\d+(\.\d+)?$/.test(v)) return Number(v)
  return null
})

/** 档位键拼对应类名；数字入参走行内 style（见 padStyle）；空值不覆盖 variant 默认档 */
const padClass = computed(() => {
  const v = props.padding
  if (!v || customPadPx.value !== null) return ''
  return `dd-card--padding-${v}`
})

/** 自定义 px 用行内 style 直接落到三区（不依赖 CSS 变量，兼容各端） */
const padStyle = computed(() =>
  customPadPx.value === null ? '' : { padding: `${customPadPx.value}px` },
)

const emit = defineEmits<{ (e: 'click', val: Event): void }>()

const slots = useSlots()
void slots

function onClick(e: Event) {
  emit('click', e)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-card {
  box-sizing: border-box;
  background: var(--dd-bg-elevated, #{$dd-bg-elevated});
  border-radius: $dd-radius-lg;
  box-shadow: var(--dd-shadow-1, #{$dd-shadow-1});
  overflow: hidden;
  @include dd-transition(all 0.3s ease);

  &__header {
    @include dd-flex-between;
    padding: $dd-space-4 $dd-space-5;
    box-sizing: border-box;
    @include dd-hairline-bottom(var(--dd-border-default, #{$dd-border-default}));

    &-inner {
      flex: 1;
      min-width: 0;
    }
  }

  &__extra {
    flex-shrink: 0;
    margin-left: $dd-space-3;
  }

  &__body {
    padding: $dd-space-5;
    box-sizing: border-box;
  }

  &__footer {
    padding: $dd-space-4 $dd-space-5;
    box-sizing: border-box;
    @include dd-hairline-top(var(--dd-border-default, #{$dd-border-default}));
  }

  &--border {
    border: 1px solid var(--dd-border-default, #{$dd-border-default});
  }

  &--hover,
  &--hover-state {
    transform: translateY(-4rpx);
    box-shadow: var(--dd-shadow-2, #{$dd-shadow-2});
  }

  &--active {
    border: 2px solid var(--dd-primary, #{$dd-primary});
    box-shadow: var(--dd-shadow-glow-gold-lg, #{$dd-shadow-glow-gold-lg});
  }
}

// horizontal: 去除 header/footer 分隔线, body flex
.dd-card--horizontal {
  display: flex;
  flex-direction: row;

  .dd-card__header,
  .dd-card__footer {
    &::after,
    &::before {
      display: none;
    }
  }

  .dd-card__body {
    flex: 1;
    padding: $dd-space-4;
  }

  // horizontal 不堆叠 header/footer, 整体作为 row
  .dd-card__header,
  .dd-card__footer {
    padding: $dd-space-4;
  }
}

// compact: 更小圆角 + 更紧凑 padding
.dd-card--compact {
  border-radius: $dd-radius-md;

  .dd-card__body {
    padding: $dd-space-3 $dd-space-4;
  }

  .dd-card__header {
    padding: $dd-space-3 $dd-space-4;
  }

  .dd-card__footer {
    padding: $dd-space-3 $dd-space-4;
  }
}

// 内边距档：与 variant 正交，显式覆盖头/体/尾三区（不传=沿用 variant 默认档；同权重靠后声明覆盖上面的 variant 规则）
@each $size, $pad in ('none': 0, 'sm': $dd-space-3, 'md': $dd-space-4, 'lg': $dd-space-5) {
  .dd-card--padding-#{$size} {
    .dd-card__header,
    .dd-card__body,
    .dd-card__footer {
      padding: $pad;
    }
  }
}

.dd-card--horizontal.dd-card--active {
  border: 2px solid var(--dd-primary, #{$dd-primary});
}
</style>
