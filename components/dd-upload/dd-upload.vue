<template>
  <view class="dd-upload" :class="{ 'dd-upload--disabled': disabled }">
    <view
      v-for="(file, index) in fileList"
      :key="file.url || index"
      class="dd-upload__item"
      @click="onPreview(index)"
    >
      <image
        class="dd-upload__img"
        :src="file.url"
        :mode="imageMode"
      />
      <view
        v-if="!disabled"
        class="dd-upload__delete"
        @click.stop="onDelete(index)"
      >
        <dd-icon name="cross" />
      </view>
    </view>
    <view
      v-if="showAdd"
      class="dd-upload__add"
      :hover-class="disabled ? '' : 'dd-upload__add--active'"
      @click="onChoose"
    >
      <dd-icon name="plus" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface UploadFileItem {
  url: string
  [key: string]: any
}

interface Props {
  fileList?: UploadFileItem[]
  maxCount?: number
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  imageFit?: 'cover' | 'contain' | 'fill'
  sourceType?: ('album' | 'camera')[]
}

const props = withDefaults(defineProps<Props>(), {
  fileList: () => [],
  maxCount: 9,
  maxSize: 0,
  multiple: true,
  disabled: false,
  imageFit: 'cover',
  sourceType: () => ['album', 'camera'],
})

const emit = defineEmits<{
  (e: 'update:fileList', val: UploadFileItem[]): void
  (e: 'change', val: UploadFileItem[]): void
  (e: 'oversize', val: UploadFileItem[]): void
  (e: 'delete', val: { index: number; file: UploadFileItem }): void
  (e: 'afterRead', val: UploadFileItem[]): void
}>()

const modeMap = {
  cover: 'aspectFill',
  contain: 'aspectFit',
  fill: 'scaleToFill',
} as const

const imageMode = computed(() => modeMap[props.imageFit])
const showAdd = computed(
  () => !props.disabled && props.fileList.length < props.maxCount
)

function onChoose() {
  if (props.disabled) return
  const remaining = props.maxCount - props.fileList.length
  if (remaining <= 0) return
  const count = props.multiple ? Math.min(remaining, 9) : 1
  uni.chooseImage({
    count,
    sourceType: props.sourceType as any,
    success: (res) => {
      const paths = res.tempFilePaths || []
      const sizes = res.tempFiles?.map((f: any) => f.size) || []
      const accepted: UploadFileItem[] = []
      const rejected: UploadFileItem[] = []
      paths.forEach((p, i) => {
        const item: UploadFileItem = { url: p }
        if (props.maxSize && sizes[i] && sizes[i] > props.maxSize) {
          rejected.push(item)
        } else {
          accepted.push(item)
        }
      })
      if (rejected.length) emit('oversize', rejected)
      if (accepted.length) {
        const next = [...props.fileList, ...accepted]
        emit('update:fileList', next)
        emit('change', next)
        emit('afterRead', accepted)
      }
    },
  })
}

function onDelete(index: number) {
  const file = props.fileList[index]
  const next = props.fileList.filter((_, i) => i !== index)
  emit('update:fileList', next)
  emit('change', next)
  emit('delete', { index, file })
}

function onPreview(index: number) {
  if (props.disabled) return
  const urls = props.fileList.map((f) => f.url).filter(Boolean)
  if (!urls.length) return
  uni.previewImage({ urls, current: urls[index] })
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-upload {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;

  &__item {
    position: relative;
    width: 160rpx;
    height: 160rpx;
    border-radius: $dd-radius-md;
    background: $dd-neutral-800;
    overflow: hidden;
  }

  &__img {
    width: 100%;
    height: 100%;
    display: block;
  }

  &__delete {
    position: absolute;
    top: 8rpx;
    right: 8rpx;
    width: 36rpx;
    height: 36rpx;
    border-radius: 50%;
    background: $dd-error;
    color: $dd-color-white;
    font-size: $dd-font-size-caption;
    @include dd-flex-center;
  }

  &__add {
    @include dd-flex-center;
    width: 160rpx;
    height: 160rpx;
    border: 1px dashed $dd-border-default;
    border-radius: $dd-radius-md;
    background: $dd-neutral-800;
    color: $dd-text-tertiary;
    font-size: 48rpx;
    box-sizing: border-box;
    @include dd-transition(background 0.2s);

    &--active {
      background: $dd-border-default;
    }
  }

  &--disabled {
    @include dd-no-touch;
  }
}
</style>
