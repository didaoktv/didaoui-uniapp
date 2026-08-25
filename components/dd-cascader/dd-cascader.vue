<template>
  <dd-popup
    v-model="popupShow"
    position="bottom"
    :closeable="closeable"
    :safe-area-inset-bottom="true"
    :close-on-click-overlay="maskCloseAble"
    :z-index="uZIndex"
    @close="close"
  >
    <!-- column 头部：垂直步骤（ponytail: dd-steps 无 dot 模式，用默认数字圆点步骤） -->
    <view v-if="headerDirection === 'column'" class="dd-cascader__head dd-cascader__head--column">
      <dd-steps v-if="popupShow" direction="vertical" :active="tabsIndex">
        <view
          v-for="(item, index) in genTabsList"
          :key="index"
          class="dd-cascader__step-item"
          @click="toFatherIndex(index)"
        >
          <dd-step :title="item.name" />
        </view>
      </dd-steps>
    </view>
    <!-- ponytail: dd-segmented-tab 无横向滚动，层级名过长时溢出；升级路径：scroll-view 包裹 -->
    <view v-else class="dd-cascader__head">
      <dd-segmented-tab
        v-if="popupShow"
        :options="genTabsList.map((item) => item.name)"
        v-model="tabsIndex"
        variant="text"
      />
    </view>
    <view class="dd-cascader__box">
      <view
        class="dd-cascader__cols"
        :class="{ 'dd-cascader__cols--change': isChange }"
        :style="{ transform: optionsCols == 2 && isChange ? 'translateX(-33.3333333%)' : '' }"
      >
        <template v-for="(levelData, levelIndex) in levelList" :key="levelIndex">
          <view
            v-if="optionsCols == 2 || levelIndex == tabsIndex"
            class="dd-cascader__col"
            :style="{ width: optionsCols == 2 ? '33.33333%' : '750rpx' }"
          >
            <view class="dd-cascader__pane">
              <scroll-view :scroll-y="true" style="height: 100%">
                <view v-if="levelIndex === 0 || selectedValueIndexs[levelIndex - 1] !== undefined">
                  <dd-cell
                    v-for="(item, index) in levelData"
                    :key="index"
                    :title="item[labelKey]"
                    @click="levelChange(levelIndex, index)"
                  >
                    <template #right-icon>
                      <dd-icon
                        v-if="selectedValueIndexs[levelIndex] === index"
                        size="17"
                        name="checked"
                        class="dd-cascader__check"
                      />
                    </template>
                  </dd-cell>
                </view>
              </scroll-view>
            </view>
          </view>
        </template>
      </view>
    </view>
    <!-- 底部按钮区域 -->
    <view class="dd-cascader__action">
      <view class="dd-cascader__action-item">
        <dd-button type="secondary" block @click="handleCancel">取消</dd-button>
      </view>
      <view class="dd-cascader__action-item">
        <dd-button type="primary" block @click="handleConfirm">确定</dd-button>
      </view>
    </view>
  </dd-popup>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import DdPopup from '../dd-popup/dd-popup.vue'
import DdSteps from '../dd-steps/dd-steps.vue'
import DdStep from '../dd-step/dd-step.vue'
import DdSegmentedTab from '../dd-segmented-tab/dd-segmented-tab.vue'
import DdCell from '../dd-cell/dd-cell.vue'
import DdIcon from '../dd-icon/dd-icon.vue'
import DdButton from '../dd-button/dd-button.vue'

interface CascaderOption {
  label?: string
  value?: string | number
  children?: CascaderOption[]
  [key: string]: any
}

interface Props {
  /** 通过双向绑定控制组件的弹出与收起 */
  show?: boolean
  /** 级联数据 */
  data?: CascaderOption[]
  /** 默认选中的值 */
  modelValue?: Array<string | number>
  /** 指定选项的值为选项对象中的哪个属性值 */
  valueKey?: string
  /** 指定选项标签为选项对象中的哪个属性值 */
  labelKey?: string
  /** 指定选项的子选项为选项对象中的哪个属性值 */
  childrenKey?: string
  /** 是否允许通过点击遮罩关闭Picker */
  maskCloseAble?: boolean
  /** 弹出的z-index值 */
  zIndex?: string | number
  /** 是否在选择最后一级时自动关闭并触发confirm */
  autoClose?: boolean
  /** 选中项目的展示方向：column 垂直方向适合文字长度过长 */
  headerDirection?: 'row' | 'column'
  /** 选项区域列数，支持1列和2列 */
  optionsCols?: number
  /** 是否显示关闭图标 */
  closeable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  data: () => [],
  modelValue: () => [],
  valueKey: 'value',
  labelKey: 'label',
  childrenKey: 'children',
  maskCloseAble: true,
  zIndex: 0,
  autoClose: false,
  headerDirection: 'row',
  optionsCols: 2,
  closeable: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: Array<string | number>): void
  (e: 'update:show', val: boolean): void
  (e: 'change', val: Array<string | number>): void
  (e: 'confirm', val: Array<string | number>): void
  (e: 'cancel'): void
}>()

/** 存储每一级的数据 */
const levelList = ref<CascaderOption[][]>([])
/** 存储每一级选中的索引 */
const selectedValueIndexs = ref<number[]>([])
const tabsIndex = ref(0)
const popupShow = ref(false)
/** 存储确认的值 */
const confirmValues = ref<Array<string | number>>([])

watch(
  () => props.data,
  () => {
    initLevelList()
    setDefaultValue()
  },
  { immediate: true },
)

watch(
  () => props.show,
  (val) => {
    popupShow.value = val
  },
)

watch(
  () => props.modelValue,
  () => {
    setDefaultValue()
  },
  { immediate: true },
)

const isChange = computed(() => tabsIndex.value > 1)

const genTabsList = computed(() => {
  const tabsList: { name: string }[] = [{ name: '请选择' }]

  // 根据选中的值动态生成tabs
  for (let i = 0; i < selectedValueIndexs.value.length; i++) {
    if (selectedValueIndexs.value[i] !== undefined && levelList.value[i]) {
      const selectedItem = levelList.value[i][selectedValueIndexs.value[i]]
      if (selectedItem) {
        tabsList[i] = {
          name: selectedItem[props.labelKey] ?? '',
        }
        // 如果还有下一级，则添加"请选择"
        if (
          i === selectedValueIndexs.value.length - 1 &&
          selectedItem[props.childrenKey] &&
          selectedItem[props.childrenKey].length > 0
        ) {
          tabsList.push({ name: '请选择' })
        }
      }
    }
  }

  return tabsList
})

const uZIndex = computed(() => (props.zIndex ? Number(props.zIndex) : 2000))

function getSelectedValues(): Array<string | number> {
  const result: Array<string | number> = []
  for (let i = 0; i < selectedValueIndexs.value.length; i++) {
    const selectedIndex = selectedValueIndexs.value[i]
    if (selectedIndex === undefined) continue
    if (!levelList.value[i] || !levelList.value[i][selectedIndex]) continue
    result.push(levelList.value[i][selectedIndex][props.valueKey])
  }
  return result
}

function initLevelList() {
  // 初始化第一级数据
  if (props.data && props.data.length > 0) {
    levelList.value = [props.data]
    selectedValueIndexs.value = []
  }
}

function setDefaultValue() {
  // 检查data是否为空
  if (!props.data || props.data.length == 0) return
  // 检查modelValue是否为空
  if (!props.modelValue || props.modelValue.length == 0) {
    confirmValues.value = []
    return
  }
  // 根据modelValue获取indexs给selectedValueIndexs
  selectedValueIndexs.value = []
  levelList.value = []
  let currentLevelData = props.data

  for (let i = 0; i < props.modelValue.length; i++) {
    const value = props.modelValue[i]
    const index = currentLevelData.findIndex((item) => item[props.valueKey] === value)
    levelList.value[i] = currentLevelData

    if (index !== -1) {
      selectedValueIndexs.value.push(index)
      // 更新下一级的数据
      if (currentLevelData[index][props.childrenKey]) {
        currentLevelData = currentLevelData[index][props.childrenKey]
      } else {
        // 如果没有子级数据，则停止处理
        break
      }
    } else {
      // 如果找不到匹配项，则停止处理
      break
    }
  }
  // 同步确认值，避免"仅回显未改动时确认返回空数组"
  confirmValues.value = getSelectedValues()
}

function close() {
  emit('cancel')
  emit('update:show', false)
  popupShow.value = false
}

function levelChange(levelIndex: number, index: number) {
  // 设置当前级的选中值
  selectedValueIndexs.value[levelIndex] = index

  // 清除后续级别的选中值
  selectedValueIndexs.value.splice(levelIndex + 1)
  tabsIndex.value = Math.min(tabsIndex.value, levelIndex)

  // 清除后续级别的列表
  levelList.value.splice(levelIndex + 1)

  // 获取当前选中项
  const currentItem = levelList.value[levelIndex][index]

  // 如果有子级数据，则初始化下一级
  if (currentItem && currentItem[props.childrenKey] && currentItem[props.childrenKey].length > 0) {
    // 确保levelList数组足够长
    if (levelList.value.length <= levelIndex + 1) {
      levelList.value.push(currentItem[props.childrenKey])
    } else {
      levelList.value[levelIndex + 1] = currentItem[props.childrenKey]
    }
    // 切换到下一级tab
    tabsIndex.value = levelIndex + 1
  } else {
    // 没有子级数据，说明是最后一级
    if (props.autoClose) {
      // 如果启用自动关闭，则触发change事件并关闭
      emitChange()
      handleConfirm()
    } else {
      // 否则只触发change事件，不关闭
      emitChange(false)
    }
  }
}

function emitChange(closePopup = true) {
  // 构造选中结果
  const result = getSelectedValues()

  // 更新confirmValues
  confirmValues.value = [...result]

  // 触发change事件，返回value数组
  emit('change', confirmValues.value)

  // 根据参数决定是否关闭弹窗
  if (closePopup) {
    close()
  }
}

function handleCancel() {
  close()
}

function handleConfirm() {
  const values = confirmValues.value.length ? confirmValues.value : getSelectedValues()
  confirmValues.value = [...values]
  // 确认时触发confirm事件
  emit('update:modelValue', values)
  emit('confirm', values)
  close()
}

// 跳转父节点
function toFatherIndex(index: number) {
  tabsIndex.value = index
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-cascader {
  &__head {
    padding-top: 20rpx;
    margin-bottom: 10rpx;

    &--column {
      padding: 30rpx 20rpx 10rpx 20rpx;
    }
  }

  &__step-item {
    padding: 10rpx 0;
  }

  &__box {
    width: 100%;
    overflow: hidden;
    height: 800rpx;
  }

  &__cols {
    display: flex;
    flex-direction: row;
    width: 150%;
    transition: transform 0.3s ease-in-out 0s;
    transform: translateX(0);
  }

  &__col {
    height: 800rpx;
  }

  &__pane {
    height: 100%;
    padding: 10rpx;
    box-sizing: border-box;
    background-color: var(--dd-bg-section, #{$dd-bg-section});
  }

  &__check {
    color: var(--dd-primary-400, #{$dd-primary-400});
  }

  &__action {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border-top: 1px solid var(--dd-border-default, #{$dd-border-default});
  }

  &__action-item {
    flex: 1;
    padding: 20rpx;
  }
}
</style>
