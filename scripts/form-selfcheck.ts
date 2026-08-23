// dd-form 校验引擎自检（可运行校验）
// 用法：npx tsc components/dd-form/rules.ts scripts/form-selfcheck.ts --module commonjs --target es2019 --outDir .check --skipLibCheck
//       然后 node .check/scripts/form-selfcheck.js
// 断言 runRules/isEmptyValue 的语义不变量：required/pattern/validator 三类规则、trigger 过滤、短路、message 兜底。
import { runRules, isEmptyValue, type DdFieldRule } from '../components/dd-form/rules'

let failed = 0

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    failed++
    console.error('FAIL: ' + msg)
  }
}

async function assertErr(
  value: any,
  rules: DdFieldRule[],
  trigger: any,
  expected: string | undefined,
  msg: string
): Promise<void> {
  const got = await runRules(value, rules, trigger)
  assert(got === expected, `${msg}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(got)}`)
}

async function main(): Promise<void> {
  // === isEmptyValue 边界 ===
  assert(isEmptyValue('') === true, 'isEmptyValue("") 应为空')
  assert(isEmptyValue(null) === true, 'isEmptyValue(null) 应为空')
  assert(isEmptyValue(undefined) === true, 'isEmptyValue(undefined) 应为空')
  assert(isEmptyValue([]) === true, 'isEmptyValue([]) 应为空')
  assert(isEmptyValue('a') === false, 'isEmptyValue("a") 应非空')
  assert(isEmptyValue(0) === false, 'isEmptyValue(0) 应非空')
  assert(isEmptyValue(false) === false, 'isEmptyValue(false) 应非空')
  assert(isEmptyValue([1]) === false, 'isEmptyValue([1]) 应非空')

  // === required ===
  await assertErr('', [{ required: true, message: '必填项' }], undefined, '必填项', 'required 空字符串报错')
  await assertErr('ok', [{ required: true, message: '必填项' }], undefined, undefined, 'required 非空通过')
  await assertErr([], [{ required: true, message: '至少一项' }], undefined, '至少一项', 'required 空数组报错')
  await assertErr('', [{ required: true }], undefined, '不能为空', 'required message 兜底文案')

  // === pattern ===
  await assertErr('13800138000', [{ pattern: /^1\d{10}$/, message: '手机号格式错误' }], undefined, undefined, 'pattern 通过')
  await assertErr('123', [{ pattern: /^1\d{10}$/ }], undefined, '格式不正确', 'pattern 失败兜底文案')
  await assertErr('', [{ pattern: /^1\d{10}$/ }], undefined, undefined, 'pattern 对空值跳过')

  // === validator ===
  await assertErr('abc', [{ validator: () => true }], undefined, undefined, 'validator true 通过')
  await assertErr('abc', [{ validator: () => false, message: '已存在' }], undefined, '已存在', 'validator false 用 message')
  await assertErr('abc', [{ validator: () => '名字太俗了' }], undefined, '名字太俗了', 'validator 返回字符串即错误')
  await assertErr(
    'dup',
    [{ validator: () => Promise.resolve(false), message: '重复' }],
    undefined,
    '重复',
    'validator 异步 false'
  )
  await assertErr(
    'dup',
    [{ validator: () => Promise.resolve('异步错误') }],
    undefined,
    '异步错误',
    'validator 异步字符串'
  )

  // === trigger 过滤 ===
  const onBlurOnly: DdFieldRule[] = [{ required: true, message: '必填', trigger: 'onBlur' }]
  await assertErr('', onBlurOnly, 'onBlur', '必填', 'trigger 命中时执行')
  await assertErr('', onBlurOnly, 'onChange', undefined, 'trigger 不匹配时跳过')
  await assertErr('', onBlurOnly, undefined, '必填', '未指定 trigger 参数时全执行')

  // === 多规则短路 ===
  await assertErr(
    '',
    [
      { required: true, message: '第一' },
      { pattern: /a/, message: '第二' },
    ],
    undefined,
    '第一',
    '多规则首个失败短路'
  )
  await assertErr(
    'b',
    [
      { required: true, message: '第一' },
      { pattern: /a/, message: '第二' },
    ],
    undefined,
    '第二',
    '多规则顺序执行到第二个'
  )

  // === 空规则集 ===
  await assertErr('', [], undefined, undefined, '空规则集直接通过')

  if (failed > 0) {
    throw new Error(`${failed} assertion(s) failed`)
  }
  console.log('form rules self-check: all assertions passed')
}

main()
