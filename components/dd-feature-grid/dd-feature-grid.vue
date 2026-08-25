<template>
  <view class="dd-feature-grid" :style="gridStyle">
    <view
      v-for="(item, index) in items"
      :key="itemKey ? item[itemKey] : index"
      class="dd-feature-grid__item"
      :class="[`dd-feature-grid__item--${variant}`]"
      :hover-class="'dd-feature-grid__item--press'"
      :hover-stay-time="100"
      @click="onItemClick(item, index)"
    >
      <view
        class="dd-feature-grid__icon"
        :style="iconStyle(item)"
      >
        <slot name="icon" :item="item" :index="index">
          <dd-icon :name="iconOf(item)" class="dd-feature-grid__icon-text" />
        </slot>
      </view>
      <text class="dd-feature-grid__label">{{ labelOf(item) }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface FeatureItem {
  [key: string]: any
  label?: string
  icon?: string
  color?: string
}

interface Props {
  items?: FeatureItem[]
  columns?: number
  variant?: 'circle' | 'squircle'
  labelKey?: string
  iconKey?: string
  colorKey?: string
  itemKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  columns: 4,
  variant: 'circle',
  labelKey: 'label',
  iconKey: 'icon',
  colorKey: 'color',
  itemKey: '',
})

const emit = defineEmits<{
  (e: 'item-click', val: { item: FeatureItem; index: number }): void
}>()

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
}))

const defaultBg = 'linear-gradient(135deg, #FFD54F 0%, #D4891A 100%)'

function iconStyle(item: FeatureItem) {
  const color = item[props.colorKey]
  return {
    background: color || defaultBg,
  }
}

function labelOf(item: FeatureItem) {
  return item[props.labelKey] ?? ''
}

function iconOf(item: FeatureItem) {
  return item[props.iconKey] ?? ''
}

function onItemClick(item: FeatureItem, index: number) {
  emit('item-click', { item, index })
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  row-gap: $dd-space-4;
  column-gap: $dd-space-2;
}

.dd-feature-grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $dd-space-2;
  @include dd-transition(transform 0.15s ease);

  &--press {
    transform: scale(0.92);
  }
}

.dd-feature-grid__icon {
  width: 84rpx;
  height: 84rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dd-gradient-primary-wide, #{$dd-gradient-primary-wide});
}

.dd-feature-grid__item--circle .dd-feature-grid__icon {
  border-radius: 50%;
}

.dd-feature-grid__item--squircle .dd-feature-grid__icon {
  border-radius: $dd-radius-xl;
}

.dd-feature-grid__icon-text {
  font-size: $dd-font-size-h2;
  color: var(--dd-primary-contrast, #{$dd-primary-contrast});
  line-height: 1;
}

.dd-feature-grid__label {
  font-size: $dd-font-size-caption;
  color: var(--dd-text-secondary, #{$dd-text-secondary});
  text-align: center;
  @include dd-ellipsis(1);
  max-width: 100%;
}
</style>
