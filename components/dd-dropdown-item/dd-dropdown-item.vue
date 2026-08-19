<template>
  <view class="dd-dropdown-item" :class="{ 'dd-dropdown-item--disabled': disabled }">
    <view
      class="dd-dropdown-item__trigger"
      :class="{ 'dd-dropdown-item__trigger--open': isOpen }"
      :style="{ color: isOpen ? activeColor : '' }"
      @click="onTrigger"
    >
      <text class="dd-dropdown-item__title">{{ displayTitle }}</text>
      <dd-icon
        name="arrow-down"
        class="dd-dropdown-item__arrow"
        :class="{ 'dd-dropdown-item__arrow--open': isOpen }"
      />
    </view>
    <view
      v-if="ctx"
      class="dd-dropdown-item__panel"
      :class="[
        `dd-dropdown-item__panel--${direction}`,
        { 'dd-dropdown-item__panel--open': isOpen },
      ]"
      :style="panelStyle"
    >
      <scroll-view scroll-y class="dd-dropdown-item__scroll">
        <view
          v-for="(opt, i) in options"
          :key="i"
          class="dd-dropdown-item__option"
          :class="{ 'dd-dropdown-item__option--active': opt.value === modelValue }"
          :style="{ color: opt.value === modelValue ? activeColor : '' }"
          @click="onSelect(opt)"
        >
          <image
            v-if="opt.icon"
            class="dd-dropdown-item__option-icon"
            :src="opt.icon"
            mode="aspectFit"
          />
          <text class="dd-dropdown-item__option-text">{{ opt.text }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'

interface DropdownOption {
  text: string
  value: any
  icon?: string
}

interface Props {
  title?: string
  options?: DropdownOption[]
  modelValue?: any
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  options: () => [],
  modelValue: null,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: any): void
  (e: 'change', val: any): void
}>()

const ctx = inject<any>('ddDropdown', null)
const id = ref(ctx ? ctx.register() : -1)

const isOpen = computed(() => ctx && ctx.activeId.value === id.value)
const direction = computed(() => (ctx ? ctx.direction : 'down'))
const activeColor = computed(() => (ctx ? ctx.activeColor : '#F5A623'))

const displayTitle = computed(() => {
  if (props.title) return props.title
  const sel = props.options.find((o) => o.value === props.modelValue)
  return sel ? sel.text : ''
})

const panelStyle = computed(() => {
  if (!ctx) return {}
  const winH = uni.getWindowInfo?.().windowHeight || 667
  if (direction.value === 'down') {
    return { top: ctx.barRect.bottom + 'px', left: '0', right: '0' }
  }
  return { bottom: winH - ctx.barRect.top + 'px', left: '0', right: '0' }
})

function onTrigger() {
  if (props.disabled || !ctx) return
  ctx.toggle(id.value)
}

function onSelect(opt: DropdownOption) {
  emit('update:modelValue', opt.value)
  emit('change', opt.value)
  ctx?.close()
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

.dd-dropdown-item {
  flex: 1;
  min-width: 0;

  &--disabled {
    opacity: 0.5;
    @include dd-no-touch;
  }

  &__trigger {
    @include dd-flex-center;
    gap: 8rpx;
    height: 96rpx;
    padding: 0 16rpx;
    color: $dd-text-primary;
    font-size: $dd-font-size-body;
    @include dd-transition(color 0.3s);
  }

  &__title {
    @include dd-ellipsis(1);
  }

  &__arrow {
    font-size: 24rpx;
    line-height: 1;
    @include dd-transition(transform 0.3s);

    &--open {
      transform: rotate(180deg);
    }
  }

  &__panel {
    position: fixed;
    z-index: 10;
    background: $dd-surface;
    max-height: 50vh;
    overflow: hidden;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    @include dd-transition(transform 0.3s ease, opacity 0.3s ease, visibility 0.3s);

    &--down {
      transform: translateY(-100%);
    }

    &--up {
      transform: translateY(100%);
    }

    &--open {
      transform: translateY(0);
      opacity: 1;
      visibility: visible;
      z-index: 11;
      pointer-events: auto;
    }
  }

  &__scroll {
    max-height: 50vh;
  }

  &__option {
    display: flex;
    align-items: center;
    gap: 16rpx;
    height: 80rpx;
    padding: 0 32rpx;
    font-size: $dd-font-size-body;
    color: $dd-text-primary;
    @include dd-transition(color 0.2s);

    &--active {
      font-weight: 600;
    }
  }

  &__option-icon {
    width: 40rpx;
    height: 40rpx;
  }

  &__option-text {
    @include dd-ellipsis(1);
  }
}
</style>
