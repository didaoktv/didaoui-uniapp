<template>
    <view class="dd-album">
        <!-- 相册行容器，每行显示 rowCount 个图片 -->
        <view
            class="dd-album__row"
            ref="albumRowRef"
            v-for="(arr, index) in showUrls"
            :forComputedUse="albumWidth"
            :key="index"
            :style="{flexWrap: autoWrap ? 'wrap' : 'nowrap'}"
        >
            <!-- 图片包装容器 -->
            <view
                class="dd-album__row__wrapper"
                v-for="(item, index1) in arr"
                :key="index1"
                :style="[imageStyle(index + 1, index1 + 1)]"
                @tap="onPreviewTap($event, getSrc(item))"
            >
                <!-- 图片显示 -->
                <image
                    :src="getSrc(item)"
                    :mode="
                        urls.length === 1
                            ? imageHeight > 0
                                ? singleMode
                                : 'widthFix'
                            : multipleMode
                    "
                    :style="[
                        {
                            width: imageWidth,
                            height: imageHeight,
                            borderRadius: shape == 'circle' ? '10000px' : addUnit(radius)
                        }
                    ]"
                ></image>
                <!-- 超出最大显示数量时的更多提示 -->
                <view
                    v-if="
                        showMore &&
                        urls.length > rowCount * showUrls.length &&
                        index === showUrls.length - 1 &&
                        index1 === showUrls[showUrls.length - 1].length - 1
                    "
                    class="dd-album__row__wrapper__text"
                    :style="{
						    borderRadius: shape == 'circle' ? '50%' : addUnit(radius),
					    }"
                >
                    <dd-text
                        :text="`+${urls.length - maxCount}`"
                        color="#fff"
                        :size="multipleSize * 0.3"
                        align="center"
                        customStyle="justify-content: center"
                    ></dd-text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, ref, watch } from 'vue'
import { addUnit, getRect, sleep } from '../../libs/function/index.js'
import test from '../../libs/function/test'
// #ifdef APP-NVUE
// 不支持百分比单位，这里需要通过dom查询组件的宽度
const dom = uni.requireNativePlugin('dom')
// #endif

/**
 * Album 相册
 * @description 本组件提供一个类似相册的功能，让开发者开发起来更加得心应手。减少重复的模板代码
 *
 * @property {Array}           urls             图片地址列表 Array<String>|Array<Object>形式
 * @property {String}          keyName          指定从数组的对象元素中读取哪个属性作为图片地址
 * @property {String | Number} singleSize       单图时，图片长边的长度  （默认 180 ）
 * @property {String | Number} multipleSize     多图时，图片边长 （默认 70 ）
 * @property {String | Number} space            多图时，图片水平和垂直之间的间隔 （默认 6 ）
 * @property {String}          singleMode       单图时，图片缩放裁剪的模式 （默认 'scaleToFill' ）
 * @property {String}          multipleMode     多图时，图片缩放裁剪的模式 （默认 'aspectFill' ）
 * @property {String | Number} maxCount         取消按钮的提示文字 （默认 9 ）
 * @property {Boolean}         previewFullImage 是否可以预览图片 （默认 true ）
 * @property {String | Number} rowCount         每行展示图片数量，如设置，singleSize和multipleSize将会无效	（默认 3 ）
 * @property {Boolean}         showMore         超出maxCount时是否显示查看更多的提示 （默认 true ）
 * @property {String}          shape            图片形状，circle-圆形，square-方形 （默认 'square' ）
 * @property {String | Number} radius           圆角值，单位任意，如果为数值，则为px单位 （默认 0 ）
 * @property {Boolean}         autoWrap         自适应换行模式，不受rowCount限制，图片会自动换行 （默认 false ）
 * @property {String}          unit             图片单位 （默认 px ）
 * @event    {Function}        albumWidth       某些特殊的情况下，需要让文字与相册的宽度相等，这里事件的形式对外发送  （回调参数 width ）
 * @example <dd-album :urls="urls2" @albumWidth="width => albumWidth = width" multipleSize="68" ></dd-album>
 */

interface Props {
  // 图片地址，Array<String>|Array<Object>形式
  urls?: any[]
  // 指定从数组的对象元素中读取哪个属性作为图片地址
  keyName?: string
  // 单图时，图片长边的长度
  singleSize?: any
  // 多图时，图片边长
  multipleSize?: any
  // 多图时，图片水平和垂直之间的间隔
  space?: any
  // 单图时，图片缩放裁剪的模式
  singleMode?: string
  // 多图时，图片缩放裁剪的模式
  multipleMode?: string
  // 最多展示的图片数量，超出时最后一个位置将会显示剩余图片数量
  maxCount?: any
  // 是否可以预览图片
  previewFullImage?: boolean
  // 每行展示图片数量，如设置，singleSize和multipleSize将会无效
  rowCount?: any
  // 超出maxCount时是否显示查看更多的提示
  showMore?: boolean
  // 图片形状，circle-圆形，square-方形（原 props.js 取自未注册的 image 默认值，实际为 undefined）
  shape?: any
  // 圆角，单位任意（同上，实际为 undefined）
  radius?: any
  // 自适应换行
  autoWrap?: boolean
  // 单位
  unit?: string
  // 阻止点击冒泡
  stop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  urls: () => [],
  keyName: '',
  singleSize: 180,
  multipleSize: 70,
  space: 6,
  singleMode: 'scaleToFill',
  multipleMode: 'aspectFill',
  maxCount: 9,
  previewFullImage: true,
  rowCount: 3,
  showMore: true,
  autoWrap: false,
  unit: 'px',
  stop: true,
})

const emit = defineEmits<{
  (e: 'preview', payload: { urls: any[]; currentIndex: number }): void
  (e: 'albumWidth', width: any): void
}>()

const instance = getCurrentInstance()
const albumRowRef = ref<any>(null)

// 单图的宽度
const singleWidth = ref<any>(0)
// 单图的高度
const singleHeight = ref<any>(0)
// 单图时，如果无法获取图片的尺寸信息，让图片宽度默认为容器的一定百分比
const singlePercent = 0.6

watch(
  () => props.urls,
  (newVal: any[]) => {
    // 当只有一张图片时，获取图片尺寸信息
    if (newVal.length === 1) {
      getImageRect()
    }
  },
  { immediate: true }
)

/**
 * 计算图片样式
 * @param {Number} index1 - 行索引
 * @param {Number} index2 - 列索引
 * @returns {Object} 图片样式对象
 */
const imageStyle = computed(() => {
  return (index1: number, index2: number) => {
    const { space, rowCount, multipleSize } = props,
      rowLen = showUrls.value.length
    const style: any = {
      marginRight: addUnit(space),
      marginBottom: addUnit(space),
    }
    // 如果为最后一行，则每个图片都无需下边框
    if (index1 === rowLen && !props.autoWrap) style.marginBottom = 0
    // 每行的最右边一张和总长度的最后一张无需右边框
    if (!props.autoWrap) {
      if (index2 === rowCount || (index1 === rowLen && index2 === showUrls.value[index1 - 1].length))
        style.marginRight = 0
    }
    return style
  }
})

/**
 * 将图片地址数组划分为二维数组，用于按行显示
 * @returns {Array} 二维数组，每个子数组代表一行图片
 */
const showUrls = computed(() => {
  if (props.autoWrap) {
    // 自动换行模式下，所有图片放在一行中显示
    return [props.urls.slice(0, props.maxCount)]
  } else {
    // 固定行数模式下，按 rowCount 分割图片
    const arr: any[] = []
    props.urls.map((item: any, index: number) => {
      // 限制最大展示数量
      if (index + 1 <= props.maxCount) {
        // 计算该元素为第几个素组内
        const itemIndex = Math.floor(index / props.rowCount)
        // 判断对应的索引是否存在
        if (!arr[itemIndex]) {
          arr[itemIndex] = []
        }
        arr[itemIndex].push(item)
      }
    })
    return arr
  }
})

/**
 * 计算图片宽度
 * @returns {String} 图片宽度样式值
 */
const imageWidth = computed(() => addUnit(props.urls.length === 1 ? singleWidth.value : props.multipleSize, props.unit))

/**
 * 计算图片高度
 * @returns {String} 图片高度样式值
 */
const imageHeight = computed(() => addUnit(props.urls.length === 1 ? singleHeight.value : props.multipleSize, props.unit))

/**
 * 计算相册总宽度，用于外部组件对齐
 * 此变量无实际用途，仅仅是为了利用computed特性，让其在urls长度等变化时，重新计算图片的宽度
 * @returns {Number} 相册宽度
 */
const albumWidth = computed(() => {
  let width = 0
  if (props.urls.length === 1) {
    width = singleWidth.value
  } else {
    width = showUrls.value[0].length * props.multipleSize + props.space * (showUrls.value[0].length - 1)
  }
  emit('albumWidth', width)
  return width
})

function noop(e: any) {
  e && typeof e.stopPropagation === 'function' && e.stopPropagation()
}

/**
 * 点击图片预览
 * @param {Event} e - 点击事件对象
 * @param {String} url - 当前点击图片的地址
 */
function onPreviewTap(e: any, url: any) {
  // 获取所有图片地址
  const urls = props.urls.map((item: any) => {
    return getSrc(item)
  })
  if (props.previewFullImage) {
    // 使用系统默认预览图片功能
    uni.previewImage({
      current: url,
      urls,
    })
    // 是否阻止事件传播（原 mixin 无 preventEvent，此处按 stopPropagation 语义补齐）
    props.stop && noop(e)
  } else {
    // 发送自定义预览事件
    emit('preview', {
      urls,
      currentIndex: urls.indexOf(url),
    })
  }
}

/**
 * 获取图片地址
 * @param {String|Object} item - 图片项，可以是字符串或对象
 * @returns {String} 图片地址
 */
function getSrc(item: any) {
  return test.object(item) ? (props.keyName && item[props.keyName]) || item.src : item
}

/**
 * 单图时，获取图片的尺寸
 * 在小程序中，需要将网络图片的的域名添加到小程序的download域名才可能获取尺寸
 * 在没有添加的情况下，让单图宽度默认为盒子的一定宽度(singlePercent)
 */
function getImageRect() {
  const src = getSrc(props.urls[0])
  uni.getImageInfo({
    src,
    success: (res) => {
      let singleSize = props.singleSize
      // 单位
      let unit = ''
      if (Number.isNaN(Number(props.singleSize))) {
        // 大小中有字符 则记录字符
        unit = props.singleSize.replace(/\d+/g, '') // 单位
        singleSize = Number(props.singleSize.replace(/\D+/g, '')) // 具体值
      }

      // 判断图片横向还是竖向展示方式
      const isHorizotal = res.width >= res.height
      singleWidth.value = isHorizotal ? singleSize : (res.width / res.height) * singleSize
      singleHeight.value = !isHorizotal ? singleSize : (res.height / res.width) * singleWidth.value

      // 如果有单位统一设置单位
      if (unit != null && unit !== '') {
        singleWidth.value = singleWidth.value + unit
        singleHeight.value = singleHeight.value + unit
      }
    },
    fail: () => {
      // 获取图片信息失败时，通过组件宽度计算
      getComponentWidth()
    },
  })
}

/**
 * 获取组件的宽度，用于计算单图显示尺寸
 */
async function getComponentWidth() {
  // 延时一定时间，以获取dom尺寸
  await sleep(30)
  // #ifndef APP-NVUE
  // H5、小程序等平台通过 getRect 获取组件宽度
  getRect('.dd-album__row', false, instance).then((size: any) => {
    singleWidth.value = size.width * singlePercent
  })
  // #endif

  // #ifdef APP-NVUE
  // NVUE 平台通过 dom 插件获取组件宽度
  // 这里ref="albumRowRef"所在的标签为通过for循环出来，ref 值为数组，取第一个
  const refs = albumRowRef.value
  const ref = Array.isArray(refs) ? refs[0] : refs
  ref &&
    dom.getComponentRect(ref, (res: any) => {
      singleWidth.value = res.size.width * singlePercent
    })
  // #endif
}

defineExpose({
  singleWidth,
  singleHeight,
  showUrls,
  imageStyle,
  imageWidth,
  imageHeight,
  albumWidth,
  getSrc,
  onPreviewTap,
  getImageRect,
  getComponentWidth,
})
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';
.dd-album {
    @include dd-flex(column);

    &__row {
        @include dd-flex(row);

        &__wrapper {
            position: relative;

            &__text {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.3);
                @include dd-flex(row);
                justify-content: center;
                align-items: center;
            }
        }
    }
}
</style>
