<template>
  <view class="dd-form">
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'
import type { DdFieldInstance, DdFieldValidateTrigger, DdFormContext } from './rules'

interface Props {
  /** 子字段默认校验触发时机（field 的 rule.trigger 可覆盖） */
  validateTrigger?: DdFieldValidateTrigger
  /** 逐项校验，遇错即停（默认并行全量） */
  validateFirst?: boolean
  /** 下发子 field 的标签位置 */
  labelPosition?: 'left' | 'top'
  /** 下发子 field 的标签宽度（如 '160rpx'，空 = 子自身默认） */
  labelWidth?: string
  /** 下发禁用全部子 field */
  disabled?: boolean
  /** submit 校验失败时滚动到第一个错误字段 */
  scrollToError?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  validateTrigger: 'onBlur',
  validateFirst: false,
  labelPosition: 'left',
  labelWidth: '',
  disabled: false,
  scrollToError: false,
})

const emit = defineEmits<{
  (e: 'submit', values: Record<string, any>): void
  (e: 'failed', errors: { name: string; message: string }[]): void
}>()

const fields = ref<DdFieldInstance[]>([])

provide<DdFormContext>('dd-form', {
  props,
  register(field) {
    if (!fields.value.some((f) => f.name === field.name)) fields.value.push(field)
  },
  unregister(name) {
    const i = fields.value.findIndex((f) => f.name === name)
    if (i >= 0) fields.value.splice(i, 1)
  },
})

function getFields(name?: string | string[]): DdFieldInstance[] {
  if (!name) return [...fields.value]
  const arr = Array.isArray(name) ? name : [name]
  return fields.value.filter((f) => arr.includes(f.name))
}

function getValues(): Record<string, any> {
  const values: Record<string, any> = {}
  fields.value.forEach((f) => {
    values[f.name] = f.getValue()
  })
  return values
}

async function validateField(name: string): Promise<void> {
  const field = fields.value.find((f) => f.name === name)
  if (!field) return
  const message = await field.validate()
  if (message !== undefined) throw [{ name, message }]
}

async function validate(name?: string | string[]): Promise<Record<string, any>> {
  const targets = getFields(name)
  if (props.validateFirst) {
    for (const field of targets) {
      const message = await field.validate()
      if (message !== undefined) throw [{ name: field.name, message }]
    }
  } else {
    const results = await Promise.all(
      targets.map(async (f) => ({ name: f.name, message: await f.validate() }))
    )
    const errors = results.filter((r) => r.message !== undefined)
    if (errors.length > 0) throw errors
  }
  return getValues()
}

function resetValidation(name?: string | string[]): void {
  getFields(name).forEach((f) => f.resetValidation())
}

async function submit(): Promise<void> {
  try {
    const values = await validate()
    emit('submit', values)
  } catch (e) {
    const errors = e as { name: string; message: string }[]
    emit('failed', errors)
    if (props.scrollToError) {
      fields.value.find((f) => f.name === errors[0]?.name)?.scrollIntoView()
    }
  }
}

defineExpose({ validate, validateField, resetValidation, submit, getValues })
</script>

<style lang="scss" scoped>
.dd-form {
  display: block;
  width: 100%;
}
</style>
