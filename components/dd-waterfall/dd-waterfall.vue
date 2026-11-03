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
        :id="itemId(cell.index)"
        :style="`margin-bottom: ${gap}rpx;`"
      >
        <slot :item="cell.item" :index="cell.index" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, ref, watch } from 'vue'
import { assignColumns } from './waterfall'

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

const instance = getCurrentInstance()
/** 实例前缀：同一页面挂多个瀑布流时按 id 前缀串起「数据下标 → 视高」，
 *  列内 DOM 顺序是列主序，不能靠 query 返回顺序对应数据顺序 */
const uid = `dd-wf-${Math.random().toString(36).slice(2, 8)}`

const columnCount = computed(() => Math.max(1, Math.floor(props.columns) || 1))

/** 每项所在列号（下标 = 数据下标）：首屏按奇偶预排，量到视高后改为「谁矮进谁」 */
const columnOf = ref<number[]>([])

const itemId = (index: number): string => `${uid}-${index}`

const columnList = computed<Cell[][]>(() => {
  const cols = Array.from({ length: columnCount.value }, () => [] as Cell[])
  ;(props.modelValue || []).forEach((item, index) => {
    const col = columnOf.value[index] ?? index % cols.length
    cols[col].push({ item, index })
  })
  return cols
})

let measuring = false

/** 小程序 setData 后布局是异步的（H5 也得等一帧），量高前留出渲染窗口；uview 同款口径（默认 300ms） */
const MEASURE_DELAY = 200

/**
 * 按「当前最矮列」落位：按数据顺序逐项找累计高度最小的列塞入。
 * 这是瀑布流对不等高卡片的常规口径——列内独立堆叠不留整行空白，末项也会跟在较矮的那列下面。
 * 量不到高度（0 高/容器不可见/布局未就绪）时整轮放弃，保留奇偶预排，避免把全部卡片挤进第一列。
 * ponytail: 只在数据/列数变化时重量；卡片自己变高（如倒计时文案换行）不触发重排，需要时再说
 */
function layout(): void {
  const list = props.modelValue || []
  if (!list.length || measuring) return
  measuring = true
  nextTick(() => {
    setTimeout(() => {
      const query = uni.createSelectorQuery().in(instance)
      query.selectAll('.dd-waterfall__item').boundingClientRect()
      query.exec((res) => {
        measuring = false
        const rects = ((res && res[0]) || []) as UniApp.NodeInfo[]
        const heightById = new Map<string, number>()
        for (const r of rects) {
          if (r.id && r.id.startsWith(uid)) heightById.set(r.id, r.height || 0)
        }
        if (!heightById.size) return
        // 全部量不到高（容器不可见/布局未就绪）才放弃整轮；个别 0 高按 0 参与计算，不影响其余项落位
        let ready = 0
        heightById.forEach((h) => {
          if (h > 0) ready += 1
        })
        if (!ready) return
        const gapPx = uni.upx2px(props.gap)
        // 逐项进当前最矮列（纯逻辑在 waterfall.ts，附 scripts/waterfall-selfcheck.ts）
        const next = assignColumns(
          list.map((_, i) => heightById.get(itemId(i)) ?? 0),
          columnCount.value,
          gapPx,
        )
        // 结果没变就不触发重渲染，避免量高 → 重排 → 再量高的循环
        const same = next.length === columnOf.value.length && next.every((c, i) => c === columnOf.value[i])
        if (!same) columnOf.value = next
      })
    }, MEASURE_DELAY)
  })
}

onMounted(layout)
watch([() => props.modelValue, columnCount], layout)
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
