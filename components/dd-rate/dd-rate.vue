<template>
  <view class="dd-rate" :class="{ 'dd-rate--readonly': readonly, 'dd-rate--disabled': disabled }">
    <view
      v-for="i in count"
      :key="i"
      class="dd-rate__item"
      :style="{ width: starSize, height: starSize }"
    >
      <dd-icon name="star" class="dd-rate__void" :style="{ fontSize: starSize, color: voidColor }" />
      <view class="dd-rate__fill" :style="{ width: fillPercent(i) + '%' }">
        <dd-icon name="star" class="dd-rate__star" :style="{ fontSize: starSize, color: fullColor, width: starSize }" />
      </view>
      <view v-if="!readonly && !disabled" class="dd-rate__hit">
        <template v-if="allowHalf">
          <view class="dd-rate__hit-left" @click="select(i - 0.5)"></view>
          <view class="dd-rate__hit-right" @click="select(i)"></view>
        </template>
        <view v-else class="dd-rate__hit-full" @click="select(i)"></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: number
  count?: number
  size?: number
  allowHalf?: boolean
  readonly?: boolean
  disabled?: boolean
  color?: string
  voidColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  count: 5,
  size: 20,
  allowHalf: false,
  readonly: false,
  disabled: false,
  color: '',
  voidColor: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: number): void
  (e: 'change', val: number): void
}>()

const starSize = computed(() => props.size * 2 + 'rpx')
const fullColor = computed(() => props.color || '#F5A623')
const voidColor = computed(() => props.voidColor || '#2A2A2A')

function fillPercent(i: number) {
  const v = props.modelValue
  if (v >= i) return 100
  if (props.allowHalf && v >= i - 0.5) return 50
  return 0
}

function select(val: number) {
  if (props.readonly || props.disabled) return
  emit('update:modelValue', val)
  emit('change', val)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-rate {
  display: inline-flex;
  align-items: center;
  gap: $dd-space-1;

  &__item {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: serif;
  }

  &__void {
    line-height: 1;
  }

  &__fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
  }

  &__star {
    display: block;
    line-height: 1;
    white-space: nowrap;
  }

  &__hit {
    position: absolute;
    inset: 0;
    display: flex;
  }
  &__hit-left,
  &__hit-right,
  &__hit-full {
    height: 100%;
  }
  &__hit-left {
    width: 50%;
  }
  &__hit-right {
    width: 50%;
  }
  &__hit-full {
    width: 100%;
  }

  &--disabled {
    opacity: 0.4;
    @include dd-no-touch;
  }
}
</style>
