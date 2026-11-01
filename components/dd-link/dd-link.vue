<template>
	<text
	    class="dd-link"
	    @tap.stop="openLink"
	    :style="[linkStyle, addStyle(customStyle)]"
	>{{text}}</text>
</template>

<script setup lang="ts">
	import { computed, nextTick } from 'vue'
	import { addStyle, addUnit, getPx, toast } from '../../libs/function/index.js';
	/**
	 * link 超链接
	 * @description 该组件为超链接组件，在不同平台有不同表现形式：在APP平台会通过plus环境打开内置浏览器，在小程序中把链接复制到粘贴板，同时提示信息，在H5中通过window.open打开链接。
	 * @property {String}			color		文字颜色 （默认 color['primary'] ）
	 * @property {String ｜ Number}	fontSize	字体大小，单位px （默认 15 ）
	 * @property {Boolean}			underLine	是否显示下划线 （默认 false ）
	 * @property {String}			href		跳转的链接，要带上http(s)
	 * @property {String}			mpTips		各个小程序平台把链接复制到粘贴板后的提示语（默认“链接已复制，请在浏览器打开”）
	 * @property {String}			lineColor	下划线颜色，默认同color参数颜色
	 * @property {String}			text		超链接的问题，不使用slot形式传入，是因为nvue下无法修改颜色
	 * @property {Object}			customStyle	定义需要用到的外部样式
	 *
	 * @example <dd-link href="https://didaoktv.com">蜀道难，难于上青天</dd-link>
	 */
	interface Props {
		// 文字颜色
		color?: string
		// 字体大小，单位px
		fontSize?: string | number
		// 是否显示下划线
		underLine?: boolean
		// 要跳转的链接
		href?: string
		// 小程序中复制到粘贴板的提示语
		mpTips?: string
		// 下划线颜色
		lineColor?: string
		// 超链接的问题，不使用slot形式传入，是因为nvue下无法修改颜色
		text?: string
		// 定义需要用到的外部样式
		customStyle?: Record<string, any> | string
	}

	const props = withDefaults(defineProps<Props>(), {
		color: '#3c9cff',
		fontSize: 15,
		underLine: false,
		href: '',
		mpTips: '链接已复制，请在浏览器打开',
		lineColor: '',
		text: '',
		customStyle: () => ({}),
	})

	const emit = defineEmits<{ (e: 'click'): void }>()

	const linkStyle = computed(() => {
		const style = {
			color: props.color,
			fontSize: addUnit(props.fontSize),
			// line-height设置为比字体大小多2px
			lineHeight: addUnit(getPx(props.fontSize) + 2),
			textDecoration: props.underLine ? 'underline' : 'none'
		}
		// if (props.underLine) {
		// 	style.borderBottomColor = props.lineColor || props.color
		// 	style.borderBottomWidth = '1px'
		// }
		return style
	})

	function openLink() {
		// #ifdef APP-PLUS
		plus.runtime.openURL(props.href)
		// #endif
		// #ifdef H5
		window.open(props.href)
		// #endif
		// #ifdef MP
		uni.setClipboardData({
			data: props.href,
			success: () => {
				uni.hideToast();
				nextTick(() => {
					toast(props.mpTips);
				})
			}
		});
		// #endif
		emit('click')
	}

	defineExpose({ openLink, linkStyle })
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';
	$dd-link-line-height:1 !default;

	.dd-link {
		/* #ifndef APP-NVUE */
		line-height: $dd-link-line-height;
		/* #endif */
		@include dd-flex;
		flex-wrap: wrap;
		flex: 1;
	}
</style>
