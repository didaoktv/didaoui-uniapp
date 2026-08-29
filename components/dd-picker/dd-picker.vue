<template>
  <view class="dd-picker" :class="{ 'dd-picker--open': show }">
    <view class="dd-picker__mask" @click="onMaskClick"></view>
    <view class="dd-picker__sheet">
      <view class="dd-picker__toolbar">
        <text class="dd-picker__cancel" @click="onCancel">取消</text>
        <text class="dd-picker__title">{{ title }}</text>
        <text class="dd-picker__confirm" @click="onConfirm">确定</text>
      </view>
      <view class="dd-picker__body">
        <picker-view
          class="dd-picker__wheels"
          :value="indexes"
          @change="onPickerChange"
        >
          <picker-view-column v-for="(col, ci) in normalizedColumns" :key="ci">
            <view v-for="(item, ii) in col" :key="ii" class="dd-picker__item">
              <text class="dd-picker__item-text">{{ item.text }}</text>
            </view>
          </picker-view-column>
        </picker-view>
        <view v-if="loading" class="dd-picker__layer">
          <text class="dd-picker__layer-text">加载中...</text>
        </view>
        <view v-else-if="readonly" class="dd-picker__layer"></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface PickerItem {
  text: string
  value: any
}

interface Props {
  show?: boolean
  columns?: PickerItem[] | PickerItem[][]
  title?: string
  loading?: boolean
  readonly?: boolean
  // 每次打开时各列定位到的索引（缺省/超界则回落到当前值或 0），用于回显已有选中项（如房型筛选当前值）
  defaultIndexes?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  columns: () => [],
  title: '',
  loading: false,
  readonly: false,
  defaultIndexes: () => [],
})

const emit = defineEmits<{
  (e: 'update:show', val: boolean): void
  (e: 'confirm', val: { values: any[]; indexes: number[]; items: PickerItem[] }): void
  (e: 'cancel'): void
  (e: 'change', val: { values: any[]; indexes: number[] }): void
}>()

const normalizedColumns = computed<PickerItem[][]>(() => {
  const c = props.columns as any
  if (!c || !c.length) return []
  if (Array.isArray(c[0])) return c as PickerItem[][]
  return [c as PickerItem[]]
})

const indexes = ref<number[]>([])

watch(
  () => normalizedColumns.value,
  (cols) => {
    const next = cols.map((_, i) => indexes.value[i] ?? 0)
    indexes.value = next
  },
  { immediate: true }
)

// 打开时按 defaultIndexes 回显各列索引；非法值（超界/非数字）回落当前值或 0
watch(
  () => props.show,
  (v) => {
    if (!v) return
    const cols = normalizedColumns.value
    const d = props.defaultIndexes
    indexes.value = cols.map((_, i) => {
      const preset = d[i]
      if (typeof preset !== 'number' || preset < 0) return indexes.value[i] ?? 0
      return Math.min(preset, Math.max(0, (cols[i]?.length || 1) - 1))
    })
  }
)

function emitChange() {
  const items = normalizedColumns.value.map((col, i) => col[indexes.value[i] ?? 0] || { text: '', value: null })
  return {
    values: items.map((it) => it.value),
    indexes: indexes.value.slice(),
    items,
  }
}

function onPickerChange(e: any) {
  indexes.value = (e?.detail?.value ?? []).slice()
  const data = emitChange()
  emit('change', { values: data.values, indexes: data.indexes })
}

function close() {
  emit('update:show', false)
}
function onMaskClick() {
  onCancel()
}
function onCancel() {
  emit('cancel')
  close()
}
function onConfirm() {
  if (props.loading || props.readonly) return
  emit('confirm', emitChange())
  close()
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';
:deep(.uni-picker-view-mask) {
  background-image: linear-gradient(180deg, var(--dd-surface-container, #{$dd-surface-container}), transparent 60%),
                    linear-gradient(0deg, var(--dd-surface-container, #{$dd-surface-container}), transparent 60%);
}
// ponytail: H5 picker-view 吸附 itemSize 取 indicator 框高度(默认34px)，必须与行高一致拖动松手才对齐。
// 需与下方 .dd-picker__item 的 88rpx 保持一致；改行高时必须同步改这里。小程序为原生组件此规则天然无效，安全。
:deep(.uni-picker-view-indicator) {
  height: 88rpx;
}
.dd-picker {
  &__mask {
    position: fixed;
    inset: 0;
    z-index: $dd-z-index-overlay;
    background: var(--dd-color-overlay-strong, #{$dd-color-overlay-strong});
    opacity: 0;
    pointer-events: none;
    @include dd-transition(opacity 0.3s);
  }

  &__sheet {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: $dd-z-index-popup;
    background: var(--dd-bg-elevated, #{$dd-bg-elevated});
    border-radius: $dd-radius-lg $dd-radius-lg 0 0;
    transform: translateY(100%);
    @include dd-transition(transform 0.3s);
    @include dd-safe-area-bottom;
  }

  &--open &__mask {
    opacity: 1;
    pointer-events: auto;
  }
  &--open &__sheet {
    transform: translateY(0);
  }

  &__toolbar {
    @include dd-flex-between;
    height: 96rpx;
    padding: 0 32rpx;
    @include dd-hairline-bottom(var(--dd-border-default, #{$dd-border-default}));
  }
  &__cancel {
    font-size: 28rpx;
    color: var(--dd-text-secondary, #{$dd-text-secondary});
  }
  &__title {
    flex: 1;
    text-align: center;
    font-size: 32rpx;
    font-weight: 600;
    color: var(--dd-text-primary, #{$dd-text-primary});
    @include dd-ellipsis(1);
  }
  &__confirm {
    font-size: 28rpx;
    font-weight: 600;
    color: var(--dd-primary, #{$dd-primary});
  }

  &__body {
    position: relative;
  }
  &__wheels {
    width: 100%;
    height: 440rpx;
  }

  &__item {
    @include dd-flex-center;
    height: 88rpx;
  }
  &__item-text {
    font-size: 28rpx;
    color: var(--dd-text-primary, #{$dd-text-primary});
    @include dd-ellipsis(1);
  }

  &__layer {
    position: absolute;
    inset: 0;
    @include dd-flex-center;
    background: var(--dd-color-overlay-strong, #{$dd-color-overlay-strong});
  }
  &__layer-text {
    font-size: 24rpx;
    color: var(--dd-text-tertiary, #{$dd-text-tertiary});
  }
}
</style>
