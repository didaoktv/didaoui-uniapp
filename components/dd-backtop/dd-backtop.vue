<template>
  <view
    class="dd-backtop"
    :class="{ 'dd-backtop--show': visible }"
    :style="{ right: right + 'rpx', bottom: bottom + 'rpx' }"
    @click="onClick"
  >
    <slot name="icon">
      <view class="dd-backtop__icon"><dd-icon name="back-top" /></view>
    </slot>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface Props {
  scrollTop?: number
  visibilityHeight?: number
  right?: number
  bottom?: number
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  scrollTop: 0,
  visibilityHeight: 400,
  right: 40,
  bottom: 40,
  duration: 300,
})

const emit = defineEmits<{ (e: 'click'): void }>()

const visible = computed(() => props.scrollTop > props.visibilityHeight)

function onClick() {
  emit('click')
  uni.pageScrollTo({ scrollTop: 0, duration: props.duration })
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-backtop {
  position: fixed;
  z-index: $dd-z-index-fixed;
  width: 80rpx;
  height: 80rpx;
  border-radius: $dd-radius-full;
  background: $dd-surface;
  color: $dd-text-primary;
  box-shadow: $dd-shadow-2;
  @include dd-flex-center;
  opacity: 0;
  transform: scale(0);
  @include dd-no-touch;
  @include dd-transition(opacity 0.3s, transform 0.3s);

  &--show {
    opacity: 1;
    transform: scale(1);
    pointer-events: auto;
    user-select: auto;
  }

  &__icon {
    font-size: $dd-font-size-lead;
    line-height: 1;
  }
}
</style>
