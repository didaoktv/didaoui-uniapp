"use strict";
/**
 * dd-form 轻量校验引擎（vant runRules 思想，自研无依赖）
 * 规则分散在各 dd-field 上，dd-form 只做调度。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmptyValue = isEmptyValue;
exports.runRules = runRules;
/** 空值判断：'' / null / undefined / 空数组 */
function isEmptyValue(value) {
    if (value === '' || value === null || value === undefined)
        return true;
    if (Array.isArray(value) && value.length === 0)
        return true;
    return false;
}
async function runValidator(rule, value) {
    var _a;
    const res = await rule.validator(value);
    if (res === true)
        return undefined;
    if (typeof res === 'string')
        return res;
    return (_a = rule.message) !== null && _a !== void 0 ? _a : '校验不通过';
}
/**
 * 按触发方式过滤规则后顺序执行，首个失败短路。
 * @returns 错误消息；undefined = 全部通过
 */
async function runRules(value, rules = [], trigger) {
    var _a, _b;
    for (const rule of rules) {
        if (trigger && rule.trigger && rule.trigger !== trigger)
            continue;
        if (rule.required && isEmptyValue(value)) {
            return (_a = rule.message) !== null && _a !== void 0 ? _a : '不能为空';
        }
        if (rule.pattern && !isEmptyValue(value) && !rule.pattern.test(String(value))) {
            return (_b = rule.message) !== null && _b !== void 0 ? _b : '格式不正确';
        }
        if (rule.validator) {
            const err = await runValidator(rule, value);
            if (err !== undefined)
                return err;
        }
    }
    return undefined;
}
