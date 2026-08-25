<template>
  <view class="dd-empty-state">
    <slot name="image">
      <view class="dd-empty-state__icon">
        <dd-icon :name="icon" class="dd-empty-state__emoji" />
      </view>
    </slot>

    <slot name="title">
      <text class="dd-empty-state__title">{{ titleText }}</text>
    </slot>

    <slot v-if="description || $slots.description" name="description">
      <text class="dd-empty-state__desc">{{ description }}</text>
    </slot>

    <slot v-if="showButton" name="button">
      <view class="dd-empty-state__btn" @click="onAction">
        <text class="dd-empty-state__btn-text">{{ buttonTextComputed }}</text>
      </view>
    </slot>

    <slot name="bottom"></slot>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

type EmptyType = 'no-data' | 'no-result' | 'error' | 'network'

interface Props {
  type?: EmptyType
  icon?: string
  title?: string
  description?: string
  buttonText?: string
  showButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'no-data',
  icon: 'music',
  title: '',
  description: '',
  buttonText: '',
  showButton: true,
})

const emit = defineEmits<{
  (e: 'action'): void
}>()

const titleMap: Record<EmptyType, string> = {
  'no-data': '暂无数据',
  'no-result': '未找到相关结果',
  error: '加载失败',
  network: '网络连接异常',
}

const buttonTextMap: Record<EmptyType, string> = {
  'no-data': '去添加',
  'no-result': '换个关键词',
  error: '重新加载',
  network: '检查网络',
}

const titleText = computed(() => props.title || titleMap[props.type])
const buttonTextComputed = computed(() => props.buttonText || buttonTextMap[props.type])

function onAction() {
  emit('action')
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $dd-space-8 $dd-space-6;
  text-align: center;

  &__icon {
    margin-bottom: $dd-space-4;
  }

  &__emoji {
    font-size: 120rpx;
    line-height: 1;
    animation: dd-empty-float 3s ease-in-out infinite;
  }

  &__title {
    font-size: $dd-font-size-h3;
    font-weight: $dd-font-weight-h3;
    color: var(--dd-text-primary, #{$dd-text-primary});
    line-height: $dd-line-height-h3;
  }

  &__desc {
    margin-top: $dd-space-2;
    font-size: $dd-font-size-body;
    color: var(--dd-text-tertiary, #{$dd-text-tertiary});
    line-height: $dd-line-height-caption;
    max-width: 560rpx;
  }

  &__btn {
    margin-top: $dd-space-5;
    padding: 0 $dd-space-5;
    height: $dd-size-button-md;
    border-radius: $dd-radius-full;
    background: var(--dd-gradient-primary, #{$dd-gradient-primary});
    @include dd-flex-center;
    box-shadow: var(--dd-shadow-glow-gold-md, #{$dd-shadow-glow-gold-md});
  }

  &__btn-text {
    font-size: $dd-font-size-body;
    font-weight: $dd-font-weight-body;
    color: var(--dd-primary-contrast, #{$dd-primary-contrast});
  }
}

@keyframes dd-empty-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-16rpx);
  }
}
</style>
