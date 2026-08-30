/**
 * Shared props configuration store.
 *
 * Component defaults are registered lazily by each component props.js file so
 * importing one component no longer pulls defaults for every component.
 */
import config from './config'
import zIndex from './zIndex.js'
import color from './color.js'
import { shallowMerge } from '../function/index.js'

const componentKeys = [
    'actionSheet',
    'album',
    'alert',
    'avatar',
    'avatarGroup',
    'backtop',
    'badge',
    'box',
    'button',
    'calendar',
    'calendarStrip',
    'card',
    'cell',
    'cellGroup',
    'checkbox',
    'checkboxGroup',
    'circleProgress',
    'code',
    'codeInput',
    'col',
    'collapse',
    'collapseItem',
    'columnNotice',
    'countDown',
    'countTo',
    'datetimePicker',
    'divider',
    'dropdown',
    'dropdownItem',
    'empty',
    'form',
    'formItem',
    'gap',
    'grid',
    'gridItem',
    'guide',
    'icon',
    'image',
    'indexAnchor',
    'indexItem',
    'indexList',
    'input',
    'keyboard',
    'line',
    'lineProgress',
    'link',
    'list',
    'listItem',
    'loadingIcon',
    'loadingPage',
    'loadmore',
    'modal',
    'navbar',
    'navbarMini',
    'noNetwork',
    'noticeBar',
    'notify',
    'novelReader',
    'numberBox',
    'numberKeyboard',
    'overlay',
    'parse',
    'pdfReader',
    'picker',
    'pickerColumn',
    'popover',
    'popup',
    'radio',
    'radioGroup',
    'rate',
    'readMore',
    'row',
    'rowNotice',
    'safeBottom',
    'scrollList',
    'search',
    'section',
    'skeleton',
    'slider',
    'statusBar',
    'steps',
    'stepsItem',
    'sticky',
    'subsection',
    'swipeAction',
    'swipeActionItem',
    'swiper',
    'swiperIndicator',
    'switch',
    'tabbar',
    'tabbarItem',
    'table',
    'tabs',
    'tabsItem',
    'tag',
    'td',
    'text',
    'textarea',
    'th',
    'toast',
    'toolbar',
    'tooltip',
    'tr',
    'transition',
    'upload'
]

const props = {}

function ensureComponentProps(key) {
    if (!props[key] || typeof props[key] !== 'object') {
        props[key] = {}
    }
    return props[key]
}

function isPlainObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]'
}

function cloneDefaultValue(value) {
    if (Array.isArray(value)) {
        return value.slice()
    }
    if (isPlainObject(value)) {
        return mergeDefaults({}, value)
    }
    return value
}

function mergeDefaults(target, defaults = {}) {
    if (!target || typeof target !== 'object' || !defaults || typeof defaults !== 'object') {
        return target
    }
    Object.keys(defaults).forEach((key) => {
        const defaultValue = defaults[key]
        const targetValue = target[key]
        if (targetValue === undefined) {
            target[key] = cloneDefaultValue(defaultValue)
        } else if (isPlainObject(targetValue) && isPlainObject(defaultValue)) {
            mergeDefaults(targetValue, defaultValue)
        }
    })
    return target
}

componentKeys.forEach(ensureComponentProps)

export function registerComponentProps(defaultProps = {}) {
    Object.keys(defaultProps || {}).forEach((key) => {
        const componentProps = ensureComponentProps(key)
        mergeDefaults(componentProps, defaultProps[key])
    })
    return props
}

export function setPropsConfig(configProps = {}) {
    Object.keys(configProps || {}).forEach((key) => {
        shallowMerge(ensureComponentProps(key), configProps[key])
    })
    return props
}

function setConfig(configs = {}) {
    shallowMerge(config, configs.config || {})
    setPropsConfig(configs.props || {})
    shallowMerge(color, configs.color || {})
    shallowMerge(zIndex, configs.zIndex || {})
}

// ponytail: 不提供全局配置注入入口（含 http 实例注册），DidaoUI 组件默认值由各组件 props.js 就地注册
export default props
