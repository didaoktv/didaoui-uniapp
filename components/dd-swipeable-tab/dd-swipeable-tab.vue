<template>
  <view class="dd-swipe">
    <view
      v-if="mode === 'fixed'"
      ref="trackRef"
      class="dd-swipe__track dd-swipe__track--fixed"
    >
      <view
        v-for="(opt, index) in options"
        :key="index"
        class="dd-swipe__item"
        :class="{ 'dd-swipe__item--active': index === modelValue }"
        @click="onSelect(index)"
      >
        <text class="dd-swipe__label">{{ labelOf(opt) }}</text>
      </view>
      <view class="dd-swipe__indicator" :style="indicatorStyle"></view>
    </view>

    <scroll-view
      v-if="mode === 'scrollable'"
      scroll-x
      class="dd-swipe__scroll"
      :scroll-left="scrollLeft"
      :scroll-with-animation="true"
    >
      <view ref="trackRef" class="dd-swipe__track dd-swipe__track--scroll">
        <view
          v-for="(opt, index) in options"
          :key="index"
          class="dd-swipe__item dd-swipe__item--scroll"
          :class="{ 'dd-swipe__item--active': index === modelValue }"
          @click="onSelect(index)"
        >
          <text class="dd-swipe__label">{{ labelOf(opt) }}</text>
        </view>
        <view class="dd-swipe__indicator" :style="indicatorStyle"></view>
      </view>
    </scroll-view>
    <view class="dd-swipe__divider"></view>
  </view>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { getCurrentInstance } from 'vue'

interface Props {
  modelValue?: number
  options?: (string | { label: string })[]
  mode?: 'fixed' | 'scrollable'
  lineWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  options: () => [],
  mode: 'fixed',
  lineWidth: 0,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: number): void
  (e: 'change', val: number): void
}>()

const instance = getCurrentInstance()
const indicatorStyle = ref({ width: '0px', transform: 'translateX(0px)' })
const scrollLeft = ref(0)

function labelOf(opt: string | { label: string }): string {
  return typeof opt === 'string' ? opt : opt.label
}

function onSelect(index: number) {
  if (index === props.modelValue) return
  emit('update:modelValue', index)
  emit('change', index)
  measure()
}

function rpxToPx(rpx: number): number {
  const w = uni.getWindowInfo?.().windowWidth || 375
  return (rpx * w) / 750
}

function measure() {
  nextTick(() => {
    const query = uni.createSelectorQuery().in(instance)
    const itemSel =
      props.mode === 'scrollable' ? '.dd-swipe__item--scroll' : '.dd-swipe__item'
    query
      .selectAll(itemSel)
      .boundingClientRect()
      .select('.dd-swipe__track')
      .boundingClientRect()
      .exec((res) => {
        const items = (res[0] || []) as UniApp.NodeInfo[]
        const track = res[1] as UniApp.NodeInfo
        if (!items.length || !track) return
        const target = items[props.modelValue]
        if (!target) return
        const itemLeft = (target.left || 0) - (track.left || 0)
        const itemWidth = target.width || 0
        const indWidth = props.lineWidth
          ? rpxToPx(props.lineWidth)
          : itemWidth * 0.6
        const indLeft = itemLeft + (itemWidth - indWidth) / 2
        indicatorStyle.value = {
          width: indWidth + 'px',
          transform: `translateX(${indLeft}px)`,
        }
        if (props.mode === 'scrollable') {
          const viewW = track.width || 0
          scrollLeft.value = Math.max(0, itemLeft + itemWidth / 2 - viewW / 2)
        }
      })
  })
}

onMounted(measure)
watch(() => props.modelValue, measure)
watch(() => props.options, measure)
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-swipe {
  width: 100%;
}

.dd-swipe__track {
  position: relative;
  height: 88rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.dd-swipe__track--fixed {
  width: 100%;
  .dd-swipe__item {
    flex: 1;
  }
}

.dd-swipe__track--scroll {
  display: inline-flex;
  .dd-swipe__item--scroll {
    flex-shrink: 0;
    padding: 0 $dd-space-4;
  }
}

.dd-swipe__scroll {
  width: 100%;
  white-space: nowrap;
}

.dd-swipe__item {
  @include dd-flex-center;
  height: 100%;
  padding: 0 $dd-space-4;
  color: $dd-text-tertiary;
  font-size: $dd-font-size-body;
  font-weight: 500;
  box-sizing: border-box;
  @include dd-transition(color 0.3s);

  &--active {
    color: $dd-primary-400;
    font-weight: 600;
    .dd-swipe__label {
      text-shadow: 0 0 12px rgba(245, 166, 35, 0.5);
    }
  }
}

.dd-swipe__label {
  line-height: 1.2;
  @include dd-ellipsis(1);
}

.dd-swipe__indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: $dd-space-1;
  background: $dd-gradient-primary-h;
  border-radius: $dd-radius-full;
  box-shadow: $dd-shadow-glow-gold-sm;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dd-swipe__divider {
  height: 1px;
  background: $dd-neutral-800;
}
</style>
