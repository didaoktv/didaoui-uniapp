<template>
  <view class="dd-tree-select" :style="rootStyle">
    <!-- 左侧分类导航（dd-sidebar） -->
    <scroll-view class="dd-tree-select__nav" :scroll-y="true">
      <dd-sidebar :model-value="mainActiveIndex" @update:model-value="onNavChange">
        <dd-sidebar-item
          v-for="(item, index) in items"
          :key="index"
          :title="item.text"
          :dot="item.dot"
          :badge="item.badge"
          :disabled="item.disabled"
          :custom-class="item.className"
        >
          <template #title>
            <slot name="nav-text" :item="item">{{ item.text }}</slot>
          </template>
        </dd-sidebar-item>
      </dd-sidebar>
    </scroll-view>
    <!-- 右侧子项区（content 插槽可整体自定义） -->
    <scroll-view class="dd-tree-select__content" :scroll-y="true">
      <slot name="content">
        <view
          v-for="child in activeChildren"
          :key="child.id"
          class="dd-tree-select__item"
          :class="{
            'dd-tree-select__item--active': isActive(child.id),
            'dd-tree-select__item--disabled': child.disabled,
          }"
          @click="onItemClick(child)"
        >
          <text class="dd-tree-select__item-text">{{ child.text }}</text>
          <dd-icon
            v-if="isActive(child.id)"
            :name="selectedIcon"
            class="dd-tree-select__selected"
          />
        </view>
      </slot>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'
import DdSidebar from '../dd-sidebar/dd-sidebar.vue'
import DdSidebarItem from '../dd-sidebar-item/dd-sidebar-item.vue'

/** 右侧子选项 */
interface TreeSelectChild {
  /** 选项唯一 id */
  id: string | number
  /** 选项文案 */
  text: string
  disabled?: boolean
}

/** 左侧导航分类项 */
interface TreeSelectItem {
  /** 导航文案 */
  text?: string
  disabled?: boolean
  /** 导航项右上角红点 */
  dot?: boolean
  /** 导航项右上角徽标数 */
  badge?: string | number
  /** 额外类名 */
  className?: string
  /** 该分类下的子选项 */
  children?: TreeSelectChild[]
}

interface Props {
  /** 分类数据（左侧导航 + 右侧子项） */
  items?: TreeSelectItem[]
  /** 左侧导航选中索引（v-model:main-active-index） */
  mainActiveIndex?: number
  /** 右侧选中项 id，传数组开启多选（v-model:active-id） */
  activeId?: string | number | Array<string | number>
  /** 多选时最多可选数量（activeId 为数组时生效） */
  max?: number
  /** 组件高度，数字按 px，字符串原样输出（支持 rpx） */
  height?: string | number
  /** 选中项右侧图标名（dd-icon name） */
  selectedIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  mainActiveIndex: 0,
  activeId: 0,
  max: Number.POSITIVE_INFINITY,
  height: 300,
  selectedIcon: 'success',
})

const emit = defineEmits<{
  (e: 'update:mainActiveIndex', index: number): void
  (e: 'update:activeId', id: string | number | Array<string | number>): void
  (e: 'clickNav', index: number): void
  (e: 'clickItem', item: TreeSelectChild): void
}>()

const rootStyle = computed(() => ({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))

/** 当前选中分类的子选项 */
const activeChildren = computed<TreeSelectChild[]>(
  () => props.items[props.mainActiveIndex]?.children ?? [],
)

function isActive(id: string | number) {
  return Array.isArray(props.activeId) ? props.activeId.includes(id) : props.activeId === id
}

function onNavChange(index: number) {
  emit('update:mainActiveIndex', index)
  emit('clickNav', index)
}

function onItemClick(child: TreeSelectChild) {
  if (child.disabled) return
  let activeId: string | number | Array<string | number>
  if (Array.isArray(props.activeId)) {
    activeId = props.activeId.slice()
    const index = activeId.indexOf(child.id)
    if (index !== -1) {
      activeId.splice(index, 1)
    } else if (activeId.length < props.max) {
      activeId.push(child.id)
    } else {
      return
    }
  } else {
    activeId = child.id
  }
  emit('update:activeId', activeId)
  emit('clickItem', child)
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-tree-select {
  display: flex;
  font-size: $dd-font-size-body;

  &__nav {
    flex: 1;
    height: 100%;
    background: var(--dd-bg-section, #{$dd-bg-section});
  }

  &__content {
    flex: 2;
    height: 100%;
    background: var(--dd-bg-card, #{$dd-bg-card});
  }

  &__item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 96rpx;
    padding: 0 88rpx 0 $dd-space-4;
    font-weight: 600;
    color: var(--dd-text-primary, #{$dd-text-primary});

    &:active {
      background: var(--dd-interactive-hover, #{$dd-interactive-hover});
    }

    &--active {
      color: var(--dd-primary, #{$dd-primary});
    }

    &--disabled {
      color: var(--dd-text-tertiary, #{$dd-text-tertiary});

      &:active {
        background: transparent;
      }
    }
  }

  &__item-text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__selected {
    position: absolute;
    top: 50%;
    right: $dd-space-4;
    transform: translateY(-50%);
    font-size: 32rpx;
    color: var(--dd-primary, #{$dd-primary});
  }
}
</style>
