<template>
  <view
    class="dd-field"
    :class="[
      rootClass,
      {
        'dd-field--error': errorState,
        'dd-field--disabled': disabledState,
        'dd-field--readonly': readonly,
        'dd-field--borderless': !border,
        'dd-field--center': center,
        'dd-field--label-top': effectiveLabelPosition === 'top',
        'dd-field--clickable': clickableState,
        'dd-field--large': size === 'large',
      },
    ]"
    :hover-class="clickableState ? 'dd-field--active' : ''"
    :hover-stay-time="100"
    @click="onClickRow"
  >
    <view
      v-if="label || $slots.label"
      class="dd-field__label"
      :class="`dd-field__label--${effectiveLabelAlign}`"
      :style="labelStyle"
    >
      <text v-if="requiredState" class="dd-field__required-mark">*</text>
      <view class="dd-field__label-text" :style="titleStyle">
        <slot name="label">{{ label }}</slot>
      </view>
    </view>
    <view class="dd-field__value">
      <view class="dd-field__body">
        <view
          v-if="$slots['left-icon'] || leftIcon || icon"
          class="dd-field__left-icon"
          @click="emit('click-left-icon', $event)"
        >
          <slot name="left-icon">
            <dd-icon :name="icon || leftIcon" />
          </slot>
        </view>
        <view class="dd-field__control-wrap" @click="emit('click-input', $event)">
          <slot>
            <textarea
              v-if="type === 'textarea'"
              class="dd-field__control dd-field__textarea"
              :value="modelValue"
              :placeholder="placeholder"
              :placeholder-style="placeholderStyle"
              :disabled="inputDisabled"
              :maxlength="maxlength"
              :auto-height="isAutoHeight"
              :focus="props.focus || focusState"
              :style="controlStyle"
              :confirm-type="confirmType"
              @input="onInput"
              @focus="onFocus"
              @blur="onBlur"
              @confirm="onConfirm"
            />
            <input
              v-else
              class="dd-field__control"
              :type="inputType"
              :password="isPassword"
              :value="modelValue"
              :placeholder="placeholder"
              :placeholder-style="placeholderStyle"
              :disabled="inputDisabled"
              :maxlength="maxlength"
              :focus="props.focus || focusState"
              :style="controlStyle"
              :confirm-type="confirmType"
              @input="onInput"
              @focus="onFocus"
              @blur="onBlur"
              @confirm="onConfirm"
            />
          </slot>
        </view>
        <view v-if="showClear" class="dd-field__clear" @click.stop="onClear">
          <dd-icon :name="clearIcon" />
        </view>
        <view
          v-if="$slots['right-icon'] || rightIcon"
          class="dd-field__right-icon"
          @click="emit('click-right-icon', $event)"
        >
          <slot name="right-icon">
            <dd-icon :name="rightIcon" />
          </slot>
        </view>
        <view
          v-if="isLink"
          class="dd-field__arrow"
          :class="`dd-field__arrow--${arrowDirection}`"
        ><dd-icon name="arrow" /></view>
        <view v-if="$slots.button" class="dd-field__button" @click.stop>
          <slot name="button"></slot>
        </view>
      </view>
      <view
        v-if="displayError || $slots['error-message']"
        class="dd-field__error-message"
        :class="`dd-field__error-message--${errorMessageAlign}`"
      >
        <slot name="error-message">{{ displayError }}</slot>
      </view>
      <text v-if="showWordLimit" class="dd-field__word-limit">{{ len }}/{{ maxlength }}</text>
    </view>
    <view v-if="$slots.extra" class="dd-field__extra">
      <slot name="extra"></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, inject, nextTick, onMounted, onUnmounted, ref } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'
import {
  runRules,
  type DdFieldRule,
  type DdFieldValidateTrigger,
  type DdFormContext,
} from '../dd-form/rules'

interface Props {
  /** any：default 插槽自定义控件（radio-group/checkbox-group）可绑数组/布尔值参与校验 */
  modelValue?: any
  type?: 'text' | 'textarea' | 'password' | 'number' | 'digit'
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  /** true 恒显星号；'auto' = rules 含 required 规则时显示 */
  required?: boolean | 'auto'
  border?: boolean
  center?: boolean
  clickable?: boolean
  isLink?: boolean
  arrowDirection?: 'left' | 'right' | 'up' | 'down'
  /** 单元格尺寸，large 增大行高（与 dd-cell 对齐） */
  size?: 'normal' | 'large'
  icon?: string
  leftIcon?: string
  rightIcon?: string
  url?: string
  linkType?: 'navigateTo' | 'redirectTo' | 'reLaunch' | 'switchTab'
  titleStyle?: string
  inputAlign?: 'left' | 'center' | 'right'
  clearable?: boolean
  /** always 恒显清空按钮；focus 聚焦时显示（默认） */
  clearTrigger?: 'always' | 'focus'
  /** 清空按钮图标名 */
  clearIcon?: string
  maxlength?: number
  showWordLimit?: boolean
  /** textarea 自适应：true = auto-height；对象 = 以 rpx 设 min/maxHeight（内部 upx2px 转换） */
  autosize?: boolean | { minHeight?: number; maxHeight?: number }
  /** textarea 最小行数（以行高换算 min-height） */
  rows?: number
  focus?: boolean
  error?: boolean
  errorMessage?: string
  /** 错误提示文案对齐 */
  errorMessageAlign?: 'left' | 'center' | 'right'
  /** 输入格式化（如手机号 3-4-4 分隔） */
  formatter?: (value: string) => string
  formatTrigger?: 'onChange' | 'onBlur'
  labelWidth?: string
  labelAlign?: 'left' | 'center' | 'right'
  labelPosition?: 'left' | 'top'
  /** 键盘右下角按钮文案（uniapp 原生 confirm-type） */
  confirmType?: 'done' | 'send' | 'search' | 'next' | 'go'
  /** 占位符样式（uniapp 原生 placeholder-style） */
  placeholderStyle?: string
  /** 表单字段名（注册进 dd-form 参与校验/取值） */
  name?: string
  rules?: DdFieldRule[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  label: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  required: false,
  border: true,
  center: false,
  clickable: false,
  isLink: false,
  arrowDirection: 'right',
  size: 'normal',
  icon: '',
  leftIcon: '',
  rightIcon: '',
  url: '',
  linkType: 'navigateTo',
  titleStyle: '',
  inputAlign: 'left',
  clearable: false,
  clearTrigger: 'focus',
  clearIcon: 'clear',
  maxlength: -1,
  showWordLimit: false,
  autosize: false,
  rows: 0,
  focus: false,
  error: false,
  errorMessage: '',
  errorMessageAlign: 'left',
  formatter: undefined,
  formatTrigger: 'onChange',
  labelWidth: '',
  labelAlign: undefined,
  labelPosition: undefined,
  confirmType: 'done',
  placeholderStyle: 'color:#9E9E9E',
  name: '',
  rules: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: any): void
  (e: 'focus', val: Event): void
  (e: 'blur', val: Event): void
  (e: 'clear'): void
  (e: 'confirm', val: string): void
  (e: 'click', val: Event): void
  (e: 'click-input', val: Event): void
  (e: 'click-left-icon', val: Event): void
  (e: 'click-right-icon', val: Event): void
}>()

const formCtx = inject<DdFormContext | null>('dd-form', null)
const stateErrorMessage = ref('')
const focused = ref(false)

// ponytail: scrollIntoView 用 pageScrollTo(selector)，仅页面级滚动，嵌套 scroll-view 不滚动；uid 保证选择器唯一
const uid = getCurrentInstance()?.uid ?? 0
const rootClass = `dd-field-${uid}`

const disabledState = computed(() => props.disabled || !!formCtx?.props.disabled)
// ponytail: uniapp input 无 readonly 属性，原生层用 disabled 拦输入，readonly 仅免去禁用样式
const inputDisabled = computed(() => disabledState.value || props.readonly)
const requiredState = computed(
  () =>
    props.required === true ||
    (props.required === 'auto' && !!props.rules?.some((r) => r.required))
)
const clickableState = computed(() => props.clickable || props.isLink || !!props.url)
const errorState = computed(() => props.error || !!displayError.value)
const displayError = computed(() => props.errorMessage || stateErrorMessage.value)
const showClear = computed(
  () =>
    props.clearable &&
    !disabledState.value &&
    !!String(props.modelValue ?? '') &&
    (props.clearTrigger === 'always' || focused.value)
)
const showWordLimit = computed(() => props.showWordLimit && props.maxlength > 0)
const len = computed(() => String(props.modelValue ?? '').length)

const effectiveLabelPosition = computed(
  () => props.labelPosition || formCtx?.props.labelPosition || 'left'
)
const effectiveLabelWidth = computed(() => props.labelWidth || formCtx?.props.labelWidth || '')
const effectiveLabelAlign = computed(() => props.labelAlign || 'left')

const labelStyle = computed(() =>
  effectiveLabelPosition.value === 'top' || !effectiveLabelWidth.value
    ? undefined
    : { width: effectiveLabelWidth.value }
)

// ponytail: password 用 uni 原生 password 布尔属性跨端
const inputType = computed<'text' | 'number' | 'digit'>(() => {
  if (props.type === 'password' || props.type === 'text') return 'text'
  return props.type as 'number' | 'digit'
})
const isPassword = computed(() => props.type === 'password')
const isAutoHeight = computed(() => props.autosize === true)
/** autosize 对象形式：不启用原生 auto-height，用高度区间模拟；props 为 rpx，运行时 upx2px 转 px（H5 动态 style 不识别 rpx） */
const autosizeStyle = computed(() => {
  if (typeof props.autosize === 'object' && props.autosize) {
    const s: Record<string, string> = {}
    if (props.autosize.minHeight) s.minHeight = `${uni.upx2px(props.autosize.minHeight)}px`
    if (props.autosize.maxHeight) s.maxHeight = `${uni.upx2px(props.autosize.maxHeight)}px`
    return s
  }
  return undefined
})

const controlStyle = computed(() => ({
  textAlign: props.inputAlign,
  ...(props.type === 'textarea' && props.rows > 0 && !props.autosize
    ? { minHeight: `${props.rows * 1.5}em` }
    : {}),
  ...(autosizeStyle.value || {}),
}))

function applyFormatter(val: string): string {
  return props.formatter ? props.formatter(val) : val
}

function onInput(e: any) {
  const raw = e?.detail?.value ?? e?.target?.value ?? ''
  const val = props.formatTrigger === 'onChange' ? applyFormatter(raw) : raw
  emit('update:modelValue', val)
  validateWithTrigger('onChange')
}

function onFocus(e: Event) {
  focused.value = true
  emit('focus', e)
}

function onBlur(e: Event) {
  focused.value = false
  if (props.formatTrigger === 'onBlur') {
    const val = applyFormatter(String(props.modelValue ?? ''))
    if (val !== props.modelValue) emit('update:modelValue', val)
  }
  emit('blur', e)
  validateWithTrigger('onBlur')
}

function onConfirm(e: any) {
  const v = e?.detail?.value ?? e?.target?.value ?? ''
  emit('confirm', v)
}

function onClear() {
  emit('update:modelValue', '')
  emit('clear')
  validateWithTrigger('onChange')
}

function navigate() {
  const opts = { url: props.url }
  switch (props.linkType) {
    case 'redirectTo':
      uni.redirectTo(opts)
      break
    case 'reLaunch':
      uni.reLaunch(opts)
      break
    case 'switchTab':
      uni.switchTab(opts)
      break
    default:
      uni.navigateTo(opts)
  }
}

function onClickRow(e: Event) {
  if (props.url) navigate()
  emit('click', e)
}

/** 校验并显示错误；返回错误消息（undefined = 通过） */
async function validate(trigger?: DdFieldValidateTrigger): Promise<string | undefined> {
  if (!props.rules?.length) {
    stateErrorMessage.value = ''
    return undefined
  }
  const message = await runRules(props.modelValue, props.rules, trigger)
  stateErrorMessage.value = message ?? ''
  return message
}

/** 事件驱动校验：form 默认触发时机匹配、或某条规则显式声明该 trigger 时执行 */
async function validateWithTrigger(trigger: DdFieldValidateTrigger) {
  if (!formCtx || !props.rules?.length) return
  const hasExplicit = props.rules.some((r) => r.trigger === trigger)
  if (formCtx.props.validateTrigger !== trigger && !hasExplicit) return
  await validate(trigger)
}

function resetValidation() {
  stateErrorMessage.value = ''
}

function scrollIntoView() {
  uni.pageScrollTo({ selector: `.${rootClass}`, duration: 300 })
}

/** 手动聚焦/失焦（vant focus()/blur() 对齐；blur 经 uni.hideKeyboard 收起键盘） */
const focusState = ref(false)

function focusField() {
  focusState.value = false
  nextTick(() => {
    focusState.value = true
  })
}

function blurField() {
  focusState.value = false
  uni.hideKeyboard()
}

onMounted(() => {
  if (formCtx && props.name) {
    formCtx.register({
      name: props.name,
      getValue: () => props.modelValue,
      validate,
      resetValidation,
      scrollIntoView,
    })
  }
})

onUnmounted(() => {
  if (formCtx && props.name) formCtx.unregister(props.name)
})

defineExpose({ validate, validateWithTrigger, resetValidation, scrollIntoView, focus: focusField, blur: blurField })
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

// 样式对齐 vant 4 Field（cell：padding 10px 16px / line-height 24px / 16px 字号 / label 6.2em 主文本色）
// 颜色全部走 $dd-* 主题 token；1px 发丝线为刻意的例外
.dd-field {
  position: relative;
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap; // extra 插槽独占第二行
  box-sizing: border-box;
  width: 100%;
  padding: 20rpx $dd-space-4;
  overflow: hidden;
  font-size: $dd-font-size-body;
  line-height: $dd-line-height-lead;
  color: var(--dd-text-primary, #{$dd-text-primary});
  background: var(--dd-bg-elevated, #{$dd-bg-elevated});

  // vant 式发丝线：两侧缩进 32rpx
  &::after {
    position: absolute;
    box-sizing: border-box;
    content: ' ';
    pointer-events: none;
    right: $dd-space-4;
    bottom: 0;
    left: $dd-space-4;
    border-bottom: 1px solid var(--dd-border-subtle, #{$dd-border-subtle});
    transform: scaleY(0.5);
  }

  &--large {
    padding-top: $dd-space-3;
    padding-bottom: $dd-space-3;
  }

  &--center {
    align-items: center;
  }

  &--label-top {
    flex-direction: column;

    .dd-field__label {
      width: 100%;
      margin-right: 0;
    }
  }

  &__label {
    display: flex;
    align-items: center;
    flex: none;
    box-sizing: border-box;
    width: 6.2em;
    margin-right: $dd-space-3;
    color: var(--dd-text-primary, #{$dd-text-primary});
    text-align: left;
    word-wrap: break-word;

    &--center {
      justify-content: center;
    }
    &--right {
      justify-content: flex-end;
    }
  }

  &__required-mark {
    margin-right: 4rpx;
    color: var(--dd-error, #{$dd-error});
  }

  &__label-text {
    min-width: 0;
    word-wrap: break-word;
  }

  &__value {
    flex: 1;
    min-width: 0;
  }

  &__body {
    display: flex;
    align-items: center;
  }

  &__control-wrap {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    min-height: 48rpx;
  }

  &__control {
    flex: 1;
    min-width: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    resize: none;
    background: transparent;
    color: var(--dd-text-primary, #{$dd-text-primary});
    font-size: inherit;
    line-height: inherit;

    &::placeholder {
      color: var(--dd-text-tertiary, #{$dd-text-tertiary});
    }

    // readonly（原生 disabled 拦输入但无禁用样式）：保持正常文本色
    &:disabled {
      color: var(--dd-text-primary, #{$dd-text-primary});
      opacity: 1;
    }
  }

  &__textarea {
    min-height: 48rpx;
  }

  &__left-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    margin-right: $dd-space-1;
    font-size: $dd-font-size-h4;
    color: var(--dd-text-primary, #{$dd-text-primary});
  }

  &__clear {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-left: $dd-space-1;
    padding: $dd-space-1 0 $dd-space-1 $dd-space-2;
    font-size: $dd-font-size-h4;
    color: var(--dd-text-tertiary, #{$dd-text-tertiary});
  }

  &__right-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    margin-left: $dd-space-1;
    font-size: $dd-font-size-h4;
    color: var(--dd-text-tertiary, #{$dd-text-tertiary});
  }

  &__arrow {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    margin-left: $dd-space-1;
    font-size: $dd-font-size-h4;
    color: var(--dd-text-tertiary, #{$dd-text-tertiary});

    &--left {
      transform: rotate(180deg);
    }
    &--up {
      transform: rotate(-90deg);
    }
    &--down {
      transform: rotate(90deg);
    }
  }

  &__button {
    flex-shrink: 0;
    margin-left: $dd-space-2;
    display: flex;
    align-items: center;
  }

  &__error-message {
    font-size: $dd-font-size-caption;
    line-height: 32rpx;
    color: var(--dd-error, #{$dd-error});
    text-align: left;

    &--center {
      text-align: center;
    }
    &--right {
      text-align: right;
    }
  }

  &__word-limit {
    display: block;
    margin-top: $dd-space-1;
    font-size: $dd-font-size-caption;
    line-height: 32rpx;
    color: var(--dd-text-secondary, #{$dd-text-secondary});
    text-align: right;
  }

  // error：输入文字与 placeholder 变红，label 不变（vant 行为）
  &--error {
    .dd-field__control,
    .dd-field__control::placeholder {
      color: var(--dd-error, #{$dd-error});
    }
  }

  // disabled：仅文字变灰，不整体降透明度（vant 行为）
  &--disabled {
    .dd-field__label,
    .dd-field__left-icon {
      color: var(--dd-text-tertiary, #{$dd-text-tertiary});
    }

    .dd-field__control,
    .dd-field__control::placeholder {
      color: var(--dd-text-tertiary, #{$dd-text-tertiary});
    }
  }

  &--borderless {
    &::after {
      display: none;
    }
  }

  &--active {
    background: var(--dd-surface-container-high, #{$dd-surface-container-high});
  }

  &__extra {
    flex-basis: 100%;
    margin-top: $dd-space-1;
  }
}
</style>
