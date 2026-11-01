<template>
	<!-- dd-popup 用 v-model+position；show prop 经 popupShow 透传，收起时仅抛 close 由父级置 false -->
	<dd-popup
	    v-model="popupShow"
	    :overlay="overlay"
	    :close-on-click-overlay="closeOnClickOverlay"
	    position="bottom"
	    :safe-area-inset-bottom="safeAreaInsetBottom"
	    @close="popupClose"
	>
	<view class="dd-keyboard">
			<slot />
			<view
			    class="dd-keyboard__tooltip"
			    v-if="tooltip"
			>
				<view
			    hover-class="dd-keyboard-hover"
			    :hover-stay-time="100"
			>
				<text
				    class="dd-keyboard__tooltip__item dd-keyboard__tooltip__cancel"
				    v-if="showCancel"
				    @tap="onCancel"
				>{{showCancel && cancelText}}</text>
			</view>
			<view>
				<text
				    v-if="showTips"
				    class="dd-keyboard__tooltip__item dd-keyboard__tooltip__tips"
				>{{tips ? tips : mode == 'number' ? '数字键盘' : '身份证键盘'}}</text>
			</view>
			<view
			    hover-class="dd-keyboard-hover"
			    :hover-stay-time="100"
			>
				<text
				    v-if="showConfirm"
				    @tap="onConfirm"
				    class="dd-keyboard__tooltip__item dd-keyboard__tooltip__submit"
				>{{showConfirm && confirmText}}</text>
			</view>
			</view>
			<!-- 车牌号输入已独立为 dd-car-keyboard（车牌格子+按位锁键键盘一体），此处仅保留 number/card 数字键盘 -->
			<dd-number-keyboard
			    :random="random"
			    @backspace="backspace"
			    @change="change"
			    :mode="mode"
			    :dotDisabled="dotDisabled"
			></dd-number-keyboard>
	</view>
	</dd-popup>
</template>

<script setup lang="ts">
	import { computed } from 'vue'
	import DdPopup from '../dd-popup/dd-popup.vue'
	import DdNumberKeyboard from '../dd-number-keyboard/dd-number-keyboard.vue'

	/**
	 * keyboard 键盘
	 * @description 自定义的键盘面板，内含了数字键盘，身份证号键盘2种模式，都有可以打乱按键顺序的选项。车牌号输入请使用 dd-car-keyboard。
	 * @property {String}			mode				键盘类型：number-数字键盘，card-身份证键盘 （默认 'number' ）
	 * @property {Boolean}			dotDisabled			是否显示"."按键，只在mode=number时有效 （默认 false ）
	 * @property {Boolean}			tooltip				是否显示键盘顶部工具条 （默认 true ）
	 * @property {Boolean}			showTips			是否显示工具条中间的提示 （默认 true ）
	 * @property {String}			tips				工具条中间的提示文字，见上方基本使用的说明，如不需要，请传""空字符
	 * @property {Boolean}			showCancel			是否显示工具条左边的"取消"按钮 （默认 true ）
	 * @property {Boolean}			showConfirm			是否显示工具条右边的"完成"按钮（ 默认 true ）
	 * @property {Boolean}			random				是否打乱键盘按键的顺序 （默认 false ）
	 * @property {Boolean}			safeAreaInsetBottom	是否开启底部安全区适配 （默认 true ）
	 * @property {Boolean}			closeOnClickOverlay	是否允许点击遮罩收起键盘 （默认 true ）
	 * @property {Boolean}			show				控制键盘的弹出与收起（默认 false ）
	 * @property {Boolean}			overlay				是否显示遮罩 （默认 true ）
	 * @property {String}			cancelText			取消按钮的文字 （默认 '取消' ）
	 * @property {String}			confirmText			确认按钮的文字 （默认 '确认' ）
	 * @property {Object}			customStyle			自定义样式，对象形式
	 * @event {Function} change 按键被点击(不包含退格键被点击)
	 * @event {Function} cancel 键盘顶部工具条左边的"取消"按钮被点击
	 * @event {Function} confirm 键盘顶部工具条右边的"完成"按钮被点击
	 * @event {Function} backspace 键盘退格键被点击
	 * @example <dd-keyboard mode="number" v-model="show"></dd-keyboard>
	 */
	interface Props {
		// 键盘的类型，number-数字键盘，card-身份证键盘，car-车牌号键盘
		mode?: string
		// 是否显示键盘的"."符号
		dotDisabled?: boolean
		// 是否显示顶部工具条
		tooltip?: boolean
		// 是否显示工具条中间的提示
		showTips?: boolean
		// 工具条中间的提示文字
		tips?: string
		// 是否显示工具条左边的"取消"按钮
		showCancel?: boolean
		// 是否显示工具条右边的"完成"按钮
		showConfirm?: boolean
		// 是否打乱键盘按键的顺序
		random?: boolean
		// 是否开启底部安全区适配，开启的话，会在iPhoneX机型底部添加一定的内边距
		safeAreaInsetBottom?: boolean
		// 是否允许通过点击遮罩关闭键盘
		closeOnClickOverlay?: boolean
		// 控制键盘的弹出与收起
		show?: boolean
		// 是否显示遮罩，某些时候数字键盘时，用户希望看到自己的数值，所以可能不想要遮罩
		overlay?: boolean
		// 取消按钮的文字
		cancelText?: string
		// 确认按钮的文字
		confirmText?: string
	}

	const props = withDefaults(defineProps<Props>(), {
		mode: 'number',
		dotDisabled: false,
		tooltip: true,
		showTips: true,
		tips: '',
		showCancel: true,
		showConfirm: true,
		random: false,
		safeAreaInsetBottom: true,
		closeOnClickOverlay: true,
		show: false,
		overlay: true,
		cancelText: '取消',
		confirmText: '确定',
	})

	const emit = defineEmits<{
		(e: 'change', val: any): void;
		(e: 'close'): void;
		(e: 'confirm'): void;
		(e: 'cancel'): void;
		(e: 'backspace'): void;
	}>()

	// ponytail: 剥离运行时主题；面板底色由 dd-popup（$dd-bg-elevated）承担
	const popupShow = computed({
		get() {
			return props.show;
		},
		set(val) {
			if (!val) emit('close');
		}
	})

	function change(e: any) {
		emit('change', e);
	}

	// 键盘关闭
	function popupClose() {
		emit('close');
	}

	// 输入完成
	function onConfirm() {
		emit('confirm');
	}

	// 取消输入
	function onCancel() {
		emit('cancel');
	}

	// 退格键
	function backspace() {
		emit('backspace');
	}

	defineExpose({ popupShow, change, popupClose, onConfirm, onCancel, backspace })
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';

	.dd-keyboard {
		// 工具条按钮点击反馈（text 不支持 hover-class，由外层 view 承担）
		.dd-keyboard-hover {
			opacity: 0.7;
		}

		&__tooltip {
			@include dd-flex;
			justify-content: space-between;
			background-color: var(--dd-bg-elevated, #{$dd-bg-elevated});
			padding: 28rpx $dd-space-3;

			&__item {
				color: var(--dd-text-primary, #{$dd-text-primary});
				flex: 1;
				text-align: center;
				font-size: 30rpx;
			}

			&__submit {
				text-align: right;
				color: var(--dd-primary-400, #{$dd-primary-400});
			}

			&__cancel {
				text-align: left;
				color: var(--dd-text-tertiary, #{$dd-text-tertiary});
			}

			&__tips {
				color: var(--dd-text-tertiary, #{$dd-text-tertiary});
			}
		}
	}
</style>
