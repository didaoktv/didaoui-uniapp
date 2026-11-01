<template>
  <view class="dd-waterfall" :class="customClass" :style="customStyle">
    <view
      v-for="(column, colIndex) in columnList"
      :key="colIndex"
      class="dd-waterfall__column"
      :style="colIndex > 0 ? `margin-left: ${gap}rpx;` : ''"
    >
      <view
        v-for="cell in column"
        :key="cell.index"
        class="dd-waterfall__item"
        :style="`margin-bottom: ${gap}rpx;`"
      >
        <slot :item="cell.item" :index="cell.index" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type WaterfallItem = Record<string, any>

interface Props {
  /** 数据数组（v-model，只读消费；组件不修改它） */
  modelValue?: WaterfallItem[]
  /** 列数 */
  columns?: number
  /** 列间距与项间距（rpx） */
  gap?: number
  customStyle?: string
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  columns: 2,
  gap: 16,
  customStyle: '',
  customClass: '',
})

interface Cell {
  item: WaterfallItem
  /** 在原数组中的下标（同时用作渲染 key 与插槽参数） */
  index: number
}

const columnCount = computed(() => Math.max(1, Math.floor(props.columns) || 1))

/**
 * 按数据顺序轮流填列：第 i 项进第 i % 列。
 * 这是瀑布流对「顺序敏感」列表的正确填充口径——按最矮列塞下一个会把顺序彻底打散
 * （房态看板要按包厢号找房，A101、A104、AB202 交错是不可接受的）；
 * 列各自独立堆叠，因此仍没有普通 grid 的整行等高空白。
 */
const columnList = computed<Cell[][]>(() => {
  const cols = Array.from({ length: columnCount.value }, () => [] as Cell[])
  ;(props.modelValue || []).forEach((item, index) => {
    cols[index % cols.length].push({ item, index })
  })
  return cols
})
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-waterfall {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.dd-waterfall__column {
  display: flex;
  flex: 1;
  flex-direction: column;
  /* 列宽必须可压缩，否则长内容（长词、大图）会撑破均分 */
  min-width: 0;
}

.dd-waterfall__item {
  width: 100%;
}
</style>
