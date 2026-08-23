<template>
  <view class="dd-image" :class="{ 'dd-image--round': round }" :style="containerStyle" @click="onClick">
    <image
      class="dd-image__img"
      :src="src"
      :mode="fitMode"
      :lazy-load="lazyLoad"
      :show-menu-by-longpress="showMenuByLongpress"
      @load="onLoad"
      @error="onError"
    />
    <view v-if="status === 'loading'" class="dd-image__mask">
      <slot name="loading">
        <view class="dd-image__spinner"></view>
      </slot>
    </view>
    <view v-if="status === 'error'" class="dd-image__mask">
      <slot name="error">
        <dd-icon name="photo-fail" class="dd-image__error-icon" />
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

type Fit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'

interface Props {
  src?: string
  fit?: Fit
  width?: string | number
  height?: string | number
  radius?: string | number
  round?: boolean
  lazyLoad?: boolean
  showMenuByLongpress?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  fit: 'cover',
  width: '100%',
  height: '100%',
  radius: 0,
  round: false,
  lazyLoad: false,
  showMenuByLongpress: false,
})

const emit = defineEmits<{
  (e: 'load', ev: any): void
  (e: 'error', ev: any): void
  (e: 'click', ev: any): void
}>()

type Status = 'loading' | 'loaded' | 'error'
const status = ref<Status>(props.src ? 'loading' : 'error')

// ponytail: scale-down 降级为 aspectFit —— uni image 无原生 scale-down 等价 mode
const fitMode = computed(() => {
  const map: Record<Fit, string> = {
    fill: 'scaleToFill',
    contain: 'aspectFit',
    cover: 'aspectFill',
    none: 'center',
    'scale-down': 'aspectFit',
  }
  return map[props.fit]
})

function toSize(v: string | number): string {
  return typeof v === 'number' ? `${v}rpx` : v
}

const containerStyle = computed(() => {
  const radius = props.round ? '50%' : toSize(props.radius)
  return {
    width: toSize(props.width),
    height: toSize(props.height),
    borderRadius: radius,
  }
})

function onLoad(ev: any) {
  status.value = 'loaded'
  emit('load', ev)
}

function onError(ev: any) {
  status.value = 'error'
  emit('error', ev)
}

function onClick(ev: any) {
  emit('click', ev)
}

watch(
  () => props.src,
  (val) => {
    status.value = val ? 'loading' : 'error'
  }
)
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-image {
  position: relative;
  display: inline-block;
  overflow: hidden;
  background: $dd-neutral-800; // var(--dd-bg-inset) 占位底色
  vertical-align: middle;

  &--round {
    border-radius: 50% !important;
  }
}

.dd-image__img {
  display: block;
  width: 100%;
  height: 100%;
}

.dd-image__mask {
  position: absolute;
  inset: 0;
  @include dd-flex-center;
  background: $dd-neutral-800;
}

.dd-image__spinner {
  width: $dd-size-icon-lg;
  height: $dd-size-icon-lg;
  border: $dd-space-1 solid $dd-border-default;
  border-top-color: $dd-primary-500;
  border-radius: 50%;
  animation: dd-image-spin 0.8s linear infinite;
}

.dd-image__error-icon {
  font-size: $dd-size-icon-lg; // 24px
  color: $dd-text-tertiary;
  line-height: 1;
}

@keyframes dd-image-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
