// ponytail: 组件库基础 mixin 的轻量版——只保留组件实际消费的能力
// （props customStyle/customClass/url/linkType、getRect）。
// 不携带运行时主题注入，DidaoUI 用 scss 变量体系，不需要。
import { defineMixin } from '../vue'

export const mixin = defineMixin({
    props: {
        customStyle: {
            type: [Object, String],
            default: () => ({})
        },
        customClass: {
            type: String,
            default: ''
        },
        url: {
            type: String,
            default: ''
        },
        linkType: {
            type: String,
            default: 'navigateTo'
        }
    },
    methods: {
        // 查询组件内节点信息
        async getRect(selector, all = false) {
            const inst = uni.createSelectorQuery().in(this)
            const q = all ? inst.selectAll(selector) : inst.select(selector)
            return new Promise((resolve) => {
                q.boundingClientRect((rect) => {
                    resolve(all && Array.isArray(rect) && rect.length ? rect : rect)
                }).exec()
            })
        },
        // 空操作：键盘等组件模板 @touchmove.stop.prevent="noop" 依赖此方法，
        // 缺失时 handler 为 undefined 会在渲染期抛 _withMods 错误
        noop(e) {
            e && typeof e.stopPropagation === 'function' && e.stopPropagation()
        }
    }
})

export default mixin
