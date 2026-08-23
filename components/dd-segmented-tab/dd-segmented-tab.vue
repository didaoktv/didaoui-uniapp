<template>
  <view
    v-if="variant === 'pill'"
    class="dd-seg dd-seg--pill"
  >
    <view
      ref="trackRef"
      class="dd-seg__track"
    >
      <view
        v-for="(opt, index) in options"
        :key="index"
        class="dd-seg__item"
        :class="{ 'dd-seg__item--active': index === modelValue }"
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
  <view v-else class="dd-seg dd-seg--text">
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
import { nextTick, onMounted, ref, watch } from 'vue'
import { getCurrentInstance } from 'vue'

interface Props {
  modelValue?: number
  options?: (string | { label: string })[]
  variant?: 'pill' | 'text'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  options: () => [],
  variant: 'pill',
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: number): void
  (e: 'change', val: number): void
}>()

const instance = getCurrentInstance()
const indicatorStyle = ref({ width: '0px', transform: 'translateX(0px)' })

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
        if (!target) return
        const left = (target.left || 0) - (track.left || 0)
        indicatorStyle.value = {
          width: (target.width || 0) + 'px',
          transform: `translateX(${left}px)`,
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

.dd-seg {
  font-family: $dd-font-body;
}

// === pill ===
.dd-seg--pill {
  .dd-seg__track {
    position: relative;
    display: inline-flex;
    padding: $dd-space-1;
    background: $dd-neutral-800;
    border: 1px solid $dd-border-default;
    border-radius: $dd-radius-full;
  }

  .dd-seg__item {
    position: relative;
    z-index: 1;
    min-width: 120rpx;
    padding: 12rpx $dd-space-4;
    @include dd-flex-center;
    color: $dd-text-tertiary;
    font-size: $dd-font-size-body;
    font-weight: 500;
    @include dd-transition(color 0.3s);

    &--active {
      color: $dd-neutral-900;
      font-weight: 600;
    }
  }

  .dd-seg__indicator {
    position: absolute;
    top: $dd-space-1;
    bottom: $dd-space-1;
    left: 0;
    background: $dd-color-white;
    border-radius: $dd-radius-full;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

// === text ===
.dd-seg--text {
  display: flex;
  flex-direction: row;
  gap: $dd-space-6;

  .dd-seg-text__item {
    position: relative;
    padding: $dd-space-2 0;
    color: $dd-text-tertiary;
    font-size: $dd-font-size-body;
    font-weight: 500;
    @include dd-flex-center;
    @include dd-transition(color 0.3s);

    &--active {
      color: $dd-primary-400;
      font-weight: 600;
    }
  }

  .dd-seg-text__underline {
    position: absolute;
    bottom: 0;
    left: 20%;
    width: 60%;
    height: $dd-space-1;
    background: $dd-primary-400;
    border-radius: $dd-radius-full;
  }
}

.dd-seg__label {
  line-height: 1.2;
  @include dd-ellipsis(1);
}
</style>
