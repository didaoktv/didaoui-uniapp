<template>
    <view
        class="dd-text"
        :class="[customClass]"
        v-if="show"
        :style="wrapStyle"
        @tap="clickHandler"
    >
        <text
            :class="['dd-text__price', type && `dd-text__value--${type}`]"
            v-if="mode === 'price'"
            :style="[valueStyle]"
            >￥</text
        >
        <view class="dd-text__prefix-icon" v-if="prefixIcon">
            <dd-icon
                :name="prefixIcon"
                :customStyle="addStyle(iconStyle)"
            ></dd-icon>
        </view>
        <dd-link
            v-if="mode === 'link'" class="dd-text__value"
            :style="{fontWeight: valueStyle.fontWeight, wordWrap: valueStyle.wordWrap, fontSize: valueStyle.fontSize}"
            :class="[type && `dd-text__value--${type}`,lines && `dd-line-${lines}`]" :text="value"
            :href="href"
            underLine
        ></dd-link>
        <template v-else-if="openType && isMp">
            <button
                class="dd-reset-button dd-text__value"
                :style="[valueStyle]"
                :data-index="index"
                :openType="openType"
                @getuserinfo="onGetUserInfo"
                @contact="onContact"
                @getphonenumber="onGetPhoneNumber"
                @error="onError"
                @launchapp="onLaunchApp"
                @opensetting="onOpenSetting"
                :lang="lang"
                :session-from="sessionFrom"
                :send-message-title="sendMessageTitle"
                :send-message-path="sendMessagePath"
                :send-message-img="sendMessageImg"
                :show-message-card="showMessageCard"
                :app-parameter="appParameter"
            >
                {{ value }}
            </button>
        </template>
        <text
            v-else
            class="dd-text__value"
            :style="[valueStyle]"
            :class="[
                type && `dd-text__value--${type}`,
                lines && `dd-line-${lines}`
            ]"
            >{{ value }}</text
        >
        <view class="dd-text__suffix-icon" v-if="suffixIcon">
            <dd-icon
                :name="suffixIcon"
                :customStyle="addStyle(iconStyle)"
            ></dd-icon>
        </view>
    </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'
import DdLink from '../dd-link/dd-link.vue'
import { addStyle, addUnit, deepMerge, error, priceFormat, timeFormat } from '../../libs/function/index.js';
import test from '../../libs/function/test';

function normalizeLineHeight(value: any) {
    const valueString = String(value).trim()
    const numericValue = Number(valueString)
    const isUnitless =
        /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(valueString) &&
        numericValue > 0 &&
        numericValue < 10

    return isUnitless ? valueString : addUnit(value)
}

/**
 * Text 文本
 * @description 此组件集成了文本类在项目中的常用功能，包括状态，拨打电话，格式化日期，*替换，超链接...等功能。 您大可不必在使用特殊文本时自己定义，text组件几乎涵盖您能使用的大部分场景。
 * @property {String} 					type		主题颜色
 * @property {Boolean} 					show		是否显示（默认 true ）
 * @property {String | Number}			text		显示的值
 * @property {String}					prefixIcon	前置图标
 * @property {String} 					suffixIcon	后置图标
 * @property {String} 					mode		文本处理的匹配模式 text-普通文本，price-价格，phone-手机号，name-姓名，date-日期，link-超链接
 * @property {String} 					href		mode=link下，配置的链接
 * @property {String | Function} 		format		格式化规则
 * @property {Boolean} 					call		mode=phone时，点击文本是否拨打电话（默认 false ）
 * @property {String} 					openType	小程序的打开方式
 * @property {Boolean} 					bold		是否粗体，默认normal（默认 false ）
 * @property {Boolean} 					block		是否块状（默认 false ）
 * @property {String | Number} 			lines		文本显示的行数，如果设置，超出此行数，将会显示省略号
 * @property {String} 					color		文本颜色（默认 '#303133' ）
 * @property {String | Number} 			size		字体大小（默认 15 ）
 * @property {Object | String} 			iconStyle	图标的样式 （默认 {fontSize: '30rpx'} ）
 * @property {String} 					decoration	文字装饰，下划线，中划线等，可选值 none|underline|line-through（默认 'none' ）
 * @property {Object | String | Number}	margin		外边距，对象、字符串，数值形式均可（默认 0 ）
 * @property {String | Number} 			lineHeight	文本行高，支持带单位值或无单位倍数（如 1.2）
 * @property {String} 					align		文本对齐方式，可选值left|center|right（默认 'left' ）
 * @property {String} 					wordWrap	文字换行，可选值break-word|normal|anywhere（默认 'normal' ）
 * @event {Function} click  点击触发事件
 * @example <dd-text text="我用十年青春,赴你最后之约"></dd-text>
 */
interface Props {
    // 主题颜色
    type?: string
    // 是否显示
    show?: boolean
    // 显示的值
    text?: string | number
    // 前置图标
    prefixIcon?: string
    // 后置图标
    suffixIcon?: string
    // 文本处理的匹配模式
    // text-普通文本，price-价格，phone-手机号，name-姓名，date-日期，link-超链接
    mode?: string
    // mode=link下，配置的链接
    href?: string
    // 格式化规则
    format?: string | ((text: any) => any)
    // mode=phone时，点击文本是否拨打电话
    call?: boolean
    // 小程序的打开方式
    openType?: string
    // 是否粗体，默认normal
    bold?: boolean
    // 是否块状
    block?: boolean
    // 文本显示的行数，如果设置，超出此行数，将会显示省略号
    lines?: string | number
    // 文本颜色
    color?: string
    // 字体大小
    size?: string | number
    // 图标的样式
    iconStyle?: Record<string, any> | string
    // 文字装饰，下划线，中划线等，可选值 none|underline|line-through
    decoration?: string
    // 外边距，对象、字符串，数值形式均可
    margin?: Record<string, any> | string | number
    // 文本行高
    lineHeight?: string | number
    // 文本对齐方式，可选值left|center|right
    align?: string
    // 文字换行，可选值break-word|normal|anywhere
    wordWrap?: string
    // 占满剩余空间
    flex1?: boolean
    // 通用兜底 prop：自定义类名
    customClass?: string
    // 通用兜底 prop：定义需要用到的外部样式
    customStyle?: Record<string, any> | string
    // 小程序 button 透传属性
    lang?: string
    sessionFrom?: string
    sendMessageTitle?: string
    sendMessagePath?: string
    sendMessageImg?: string
    showMessageCard?: boolean
    appParameter?: string
}

const props = withDefaults(defineProps<Props>(), {
    type: '',
    show: true,
    text: '',
    prefixIcon: '',
    suffixIcon: '',
    mode: '',
    href: '',
    format: '',
    call: false,
    openType: '',
    bold: false,
    block: false,
    lines: '',
    color: '',
    size: 15,
    iconStyle: () => ({ fontSize: '30rpx' }),
    decoration: 'none',
    margin: 0,
    lineHeight: '',
    align: 'left',
    wordWrap: 'normal',
    flex1: false,
    customClass: '',
    customStyle: () => ({}),
})

const emit = defineEmits<{
    (e: 'click', ev: any): void;
    (e: 'getuserinfo', detail: any): void;
    (e: 'contact', detail: any): void;
    (e: 'getphonenumber', detail: any): void;
    (e: 'error', detail: any): void;
    (e: 'launchapp', detail: any): void;
    (e: 'opensetting', detail: any): void;
}>()

// ponytail: 模板里的 :data-index="index" 沿袭 Options API 行为，取值为 undefined
const index = undefined

const isNvue = computed(() => {
    let nvue = false
    // #ifdef APP-NVUE
    nvue = true
    // #endif
    return nvue
})

const isMp = computed(() => {
    let mp = false
    // #ifdef MP
    mp = true
    // #endif
    return mp
})

// 默认的姓名脱敏规则
function formatName(name: string) {
    let value = ''
    if (name.length === 2) {
        value = name.substr(0, 1) + '*'
    } else if (name.length > 2) {
        let char = ''
        for (let i = 0, len = name.length - 2; i < len; i++) {
            char += '*'
        }
        value = name.substr(0, 1) + char + name.substr(-1, 1)
    } else {
        value = name
    }
    return value
}

// 经处理后需要显示的值
const value = computed(() => {
    const {
        text,
        mode,
        format,
        href
    } = props
    // 价格类型
    if (mode === 'price') {
        // 如果text不为金额进行提示
        if (!/^\d+(\.\d+)?$/.test(String(text))) {
            error('金额模式下，text参数需要为金额格式');
        }
        // 进行格式化，判断用户传入的format参数为正则，或者函数，如果没有传入format，则使用默认的金额格式化处理
        if (typeof format === 'function') {
            // 如果用户传入的是函数，使用函数格式化
            return format(text)
        }
        // 如果format非正则，非函数，则使用默认的金额格式化方法进行操作
        return priceFormat(text, 2)
    } if (mode === 'date') {
        // 判断是否合法的日期或者时间戳
        !test.date(text) && error('日期模式下，text参数需要为日期或时间戳格式')
        // 进行格式化，判断用户传入的format参数为正则，或者函数，如果没有传入format，则使用默认的格式化处理
        if (typeof format === 'function') {
            // 如果用户传入的是函数，使用函数格式化
            return format(text)
        } if (format) {
            // 如果format非正则，非函数，则使用默认的时间格式化方法进行操作
            return timeFormat(text, format)
        }
        // 如果没有设置format，则设置为默认的时间格式化形式
        return timeFormat(text, 'yyyy-mm-dd')
    } if (mode === 'phone') {
        // 判断是否合法的手机号
        // !test.mobile(text) && error('手机号模式下，text参数需要为手机号码格式')
        if (typeof format === 'function') {
            // 如果用户传入的是函数，使用函数格式化
            return format(text)
        } if (format === 'encrypt') {
            // 如果format为encrypt，则将手机号进行星号加密处理
            const str = String(text)
            return `${str.substr(0, 3)}****${str.substr(7)}`
        }
        return text
    } if (mode === 'name') {
        // 判断是否合法的字符粗
        !(typeof (text) === 'string') && error('姓名模式下，text参数需要为字符串格式')
        if (typeof format === 'function') {
            // 如果用户传入的是函数，使用函数格式化
            return format(text)
        } if (format === 'encrypt') {
            // 如果format为encrypt，则将姓名进行星号加密处理
            return formatName(String(text))
        }
        return text
    } if (mode === 'link') {
        // 判断是否合法的字符粗
        !test.url(href) && error('超链接模式下，href参数需要为URL格式')
        return text
    }
    return text
})

const wrapStyle = computed(() => {
    let style: Record<string, any> = {
        margin: props.margin,
        justifyContent: props.align === 'left' ? 'flex-start' : props.align === 'center' ? 'center' : 'flex-end'
    }
    // 占满剩余空间
    if (props.flex1) {
        style.flex = 1;
        // #ifndef APP-NVUE
        style.width = '100%';
        // #endif
    }
    return style;
})

const valueStyle = computed(() => {
    const style: Record<string, any> = {
        textDecoration: props.decoration,
        fontWeight: props.bold ? 'bold' : 'normal',
        wordWrap: props.wordWrap,
        fontSize: addUnit(props.size)
    }
    if (!props.type) {
        // ponytail: 剥离运行时主题；未传 color 时继承上下文，跟随设计系统文本色
        style.color = props.color || 'inherit'
    }
    isNvue.value && props.lines && (style.lines = props.lines)
    props.lineHeight &&
        (style.lineHeight = normalizeLineHeight(props.lineHeight))
    !isNvue.value && props.block && (style.display = 'block')
    return deepMerge(style, addStyle(props.customStyle))
})

function clickHandler(e: any) {
    // 如果为手机号模式，拨打电话
    if (props.call && props.mode === 'phone') {
        uni.makePhoneCall({
            phoneNumber: props.text as string
        })
    }
    emit('click', e)
}

function onGetUserInfo(event: any) {
    emit('getuserinfo', event.detail)
}

function onContact(event: any) {
    emit('contact', event.detail)
}

function onGetPhoneNumber(event: any) {
    emit('getphonenumber', event.detail)
}

function onError(event: any) {
    emit('error', event.detail)
}

function onLaunchApp(event: any) {
    emit('launchapp', event.detail)
}

function onOpenSetting(event: any) {
    emit('opensetting', event.detail)
}

defineExpose({ value, wrapStyle, valueStyle, clickHandler, formatName })
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

// 按钮重置（原 dd-shared 全局工具类，收敛到本组件 scoped 内）
.dd-reset-button {
	padding: 0;
	background-color: transparent;
	font-size: inherit;
	line-height: inherit;
	color: inherit;
	&::after {
		border: none;
	}
}

// 多行省略（模板按 lines 动态拼 dd-line-N）
@for $i from 1 through 10 {
	.dd-line-#{$i} {
		/* #ifdef APP-NVUE */
		lines: $i;
		text-overflow: ellipsis;
		overflow: hidden;
		flex: 1;
		/* #endif */
		/* #ifndef APP-NVUE */
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: $i;
		overflow: hidden;
		/* #endif */
	}
}
.dd-text {
    @include dd-flex(row);
    align-items: center;
    flex-wrap: nowrap;

    &__price {
        font-size: $dd-font-size-body;
        color: var(--dd-text-secondary, #{$dd-text-secondary});
    }

    &__value {
        font-size: $dd-font-size-body;
        @include dd-flex;
        color: var(--dd-text-secondary, #{$dd-text-secondary});
        flex-wrap: wrap;
        // flex: 1;
        text-overflow: ellipsis;
        align-items: center;

        &--primary {
            color: var(--dd-primary-400, #{$dd-primary-400});
        }

        &--warning {
            color: var(--dd-warning-400, #{$dd-warning-400});
        }

        &--success {
            color: var(--dd-success-400, #{$dd-success-400});
        }

        &--info {
            color: var(--dd-info-400, #{$dd-info-400});
        }

        &--error {
            color: var(--dd-error-400, #{$dd-error-400});
        }

        &--main {
            color: var(--dd-text-primary, #{$dd-text-primary});
        }

        &--content {
            color: var(--dd-text-secondary, #{$dd-text-secondary});
        }

        &--tips {
            color: var(--dd-text-tertiary, #{$dd-text-tertiary});
        }

        &--light {
            color: var(--dd-text-tertiary, #{$dd-text-tertiary});
        }
    }
}
</style>
