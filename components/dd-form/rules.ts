/**
 * dd-form 轻量校验引擎（vant runRules 思想，自研无依赖）
 * 规则分散在各 dd-field 上，dd-form 只做调度。
 */

export type DdFieldValidateTrigger = 'onBlur' | 'onChange' | 'onSubmit'

/** dd-field 向 dd-form 注册的实例契约 */
export interface DdFieldInstance {
  name: string
  getValue: () => any
  /** 校验并显示错误；返回错误消息（undefined = 通过） */
  validate: () => Promise<string | undefined>
  resetValidation: () => void
  scrollIntoView: () => void
}

/** dd-form 通过 provide 下发的上下文契约 */
export interface DdFormContext {
  props: {
    validateTrigger: DdFieldValidateTrigger
    labelPosition: 'left' | 'top'
    labelWidth: string
    disabled: boolean
  }
  register: (field: DdFieldInstance) => void
  unregister: (name: string) => void
}

export interface DdFieldRule {
  /** 必填（空值报错） */
  required?: boolean
  /** 错误消息；缺省时按规则类型兜底 */
  message?: string
  /** 正则校验（仅对非空值测试） */
  pattern?: RegExp
  /**
   * 自定义校验：返回 true=通过，false=用 message 报错，
   * 返回 string=直接以该字符串为错误消息（vant 语义）；支持 Promise
   */
  validator?: (value: any) => boolean | string | Promise<boolean | string>
  /** 触发时机；缺省 = 任意触发都执行 */
  trigger?: DdFieldValidateTrigger
}

/** 空值判断：'' / null / undefined / 空数组 */
export function isEmptyValue(value: any): boolean {
  if (value === '' || value === null || value === undefined) return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

async function runValidator(rule: DdFieldRule, value: any): Promise<string | undefined> {
  const res = await rule.validator!(value)
  if (res === true) return undefined
  if (typeof res === 'string') return res
  return rule.message ?? '校验不通过'
}

/**
 * 按触发方式过滤规则后顺序执行，首个失败短路。
 * @returns 错误消息；undefined = 全部通过
 */
export async function runRules(
  value: any,
  rules: DdFieldRule[] = [],
  trigger?: DdFieldValidateTrigger
): Promise<string | undefined> {
  for (const rule of rules) {
    if (trigger && rule.trigger && rule.trigger !== trigger) continue

    if (rule.required && isEmptyValue(value)) {
      return rule.message ?? '不能为空'
    }
    if (rule.pattern && !isEmptyValue(value) && !rule.pattern.test(String(value))) {
      return rule.message ?? '格式不正确'
    }
    if (rule.validator) {
      const err = await runValidator(rule, value)
      if (err !== undefined) return err
    }
  }
  return undefined
}
