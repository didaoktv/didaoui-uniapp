<template>
	<view
		class="dd-keyboard"
		@touchmove.stop.prevent="noop"
	>
		<view
			class="dd-keyboard__button-wrapper"
			v-for="(item, index) in numList"
			:key="index"
		>
			<view
				class="dd-keyboard__button-wrapper__button"
				:class="[btnBgGray(index) && 'dd-keyboard__button-wrapper__button--gray']"
				:style="[itemStyle(index)]"
				@tap="keyboardClick(item)"
				hover-class="dd-keyboard-hover"
				:hover-stay-time="200"
			>
				<text class="dd-keyboard__button-wrapper__button__text">{{ item }}</text>
			</view>
		</view>
		<view
			class="dd-keyboard__button-wrapper"
		>
			<view
				class="dd-keyboard__button-wrapper__button dd-keyboard__button-wrapper__button--gray"
				hover-class="dd-keyboard-hover"
				:hover-stay-time="200"
				@touchstart.stop="backspaceTouchStart"
				@touchend="clearTimer"
				@touchcancel="clearTimer"
				@tap="backspaceTap"
			>
				<dd-icon
				name="backspace"
				size="28"
			></dd-icon>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { computed, ref } from 'vue'
	import DdIcon from '../dd-icon/dd-icon.vue'
	import { randomArray } from '../../libs/function/index.js';
	/**
	 * keyboard 键盘组件
	 * @description
	 * @tutorial
	 * @property {String}	mode		键盘的类型，number-数字键盘，card-身份证键盘
	 * @property {Boolean}	dotDisabled	是否显示键盘的"."符号
	 * @property {Boolean}	random		是否打乱键盘按键的顺序
	 * @event {Function} change		点击键盘触发
	 * @event {Function} backspace	点击退格键触发
	 * @example
	 */
	interface Props {
		// 键盘的类型，number-数字键盘，card-身份证键盘
		mode?: string
		// 是否显示键盘的"."符号
		dotDisabled?: boolean
		// 是否打乱键盘按键的顺序
		random?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		mode: 'number',
		dotDisabled: false,
		random: false,
	})

	const emit = defineEmits<{
		(e: 'backspace'): void;
		(e: 'change', val: any): void;
	}>()

	const backspace = ref('backspace') // 退格键内容
	const dot = ref('.') // 点
	let timer: any = null // 长按多次删除的事件监听
	const isTouch = ref(false) // 本次退格是否来自触摸（防 tap 重复删除）
	const cardX = ref('X') // 身份证的X符号

	// 空操作：模板 @touchmove.stop.prevent="noop"
	const noop = (e: any) => { e && typeof e.stopPropagation === 'function' && e.stopPropagation() }

	// 键盘需要显示的内容
	const numList = computed(() => {
		if (props.dotDisabled && props.mode == 'number') {
			if (!props.random) {
				return [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
			} else {
				return randomArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
			}
		} else if (!props.dotDisabled && props.mode == 'number') {
			if (!props.random) {
				return [1, 2, 3, 4, 5, 6, 7, 8, 9, dot.value, 0];
			} else {
				return randomArray([1, 2, 3, 4, 5, 6, 7, 8, 9, dot.value, 0]);
			}
		} else if (props.mode == 'card') {
			if (!props.random) {
				return [1, 2, 3, 4, 5, 6, 7, 8, 9, cardX.value, 0];
			} else {
				return randomArray([1, 2, 3, 4, 5, 6, 7, 8, 9, cardX.value, 0]);
			}
		}
	})

	// 按键的样式，在非乱序&&数字键盘&&不显示点按钮时，index为9时，"0"键占位两个空间（flex 拉伸为 2 倍宽）
	const itemStyle = computed(() => {
		return (index: number) => {
			let style: Record<string, any> = {};
			if (props.mode == 'number' && props.dotDisabled && index == 9) style.flex = '2 1 30%';
			return style;
		};
	})

	// 是否让按键显示灰色，只在非乱序&&数字键盘&&且允许点按键的时候（"."键 / 身份证"X"键）
	const btnBgGray = computed(() => {
		return (index: number) => {
			if (!props.random && index == 9 && (props.mode != 'number' || (props.mode == 'number' && !props
					.dotDisabled))) return true;
			else return false;
		};
	})

	// 点击退格键（触摸路径：touchstart 立删 + 长按连删；鼠标路径：tap 单删，isTouch 防移动端触摸后 tap 二次删除）
	function backspaceTouchStart() {
		isTouch.value = true
		emit('backspace');
		clearInterval(timer); //再次清空定时器，防止重复注册定时器
		timer = null;
		timer = setInterval(() => {
			emit('backspace');
		}, 250);
	}

	function backspaceTap() {
		if (isTouch.value) {
			isTouch.value = false;
			return;
		}
		emit('backspace');
	}

	function clearTimer() {
		clearInterval(timer);
		timer = null;
	}

	// 获取键盘显示的内容
	function keyboardClick(val: any) {
		// 允许键盘显示点模式和触发非点按键时，将内容转为数字类型
		if (!props.dotDisabled && val != dot.value && val != cardX.value) val = Number(val);
		emit('change', val);
	}

	defineExpose({ numList, itemStyle, btnBgGray, backspace, dot, isTouch, cardX, backspaceTouchStart, backspaceTap, clearTimer, keyboardClick })
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';
	$dd-number-keyboard-background-color: var(--dd-bg-section, #{$dd-bg-section}) !default;
	$dd-number-keyboard-padding:$dd-space-2 10rpx $dd-space-2 10rpx !default;
	$dd-number-keyboard-gap:6rpx !default;
	$dd-number-keyboard-button-border-radius:$dd-radius-sm !default;
	$dd-number-keyboard-button-height: 90rpx!default;
	$dd-number-keyboard-button-background-color:var(--dd-surface-container-high, #{$dd-surface-container-high}) !default;
	$dd-number-keyboard-button-box-shadow:0 2px 0px var(--dd-bg, #{$dd-bg}) !default;
	$dd-number-keyboard-text-font-size:$dd-font-size-h2 !default;
	$dd-number-keyboard-text-font-weight:500 !default;
	$dd-number-keyboard-text-color:var(--dd-text-primary, #{$dd-text-primary}) !default;
	$dd-number-keyboard-gray-background-color:var(--dd-surface-container-highest, #{$dd-surface-container-highest}) !default;
	$dd-number-keyboard-dd-keyboard-hover-background-color: var(--dd-surface-hover, #{$dd-surface-hover}) !default;

	.dd-keyboard {
		@include dd-flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: $dd-number-keyboard-gap;
		background-color: $dd-number-keyboard-background-color;
		padding: $dd-number-keyboard-padding;

		// ponytail: 弹性三等分替代固定 222rpx 宽——容器宽度不足 702rpx 时固定宽会挤成 2 列
		&__button-wrapper {
			flex: 1 1 30%;
			box-shadow: $dd-number-keyboard-button-box-shadow;
			border-radius: $dd-number-keyboard-button-border-radius;

			&__button {
				width: 100%;
				height: $dd-number-keyboard-button-height;
				background-color: $dd-number-keyboard-button-background-color;
				@include dd-flex;
				justify-content: center;
				align-items: center;
				border-radius: $dd-number-keyboard-button-border-radius;

				&__text {
					font-size: $dd-number-keyboard-text-font-size;
					font-weight: $dd-number-keyboard-text-font-weight;
					color: $dd-number-keyboard-text-color;
				}

				&--gray {
					background-color: $dd-number-keyboard-gray-background-color;
					color: $dd-number-keyboard-text-color; // 退格图标 color=inherit，由此处控制
				}
			}
		}
	}

	.dd-keyboard-hover {
		background-color: $dd-number-keyboard-dd-keyboard-hover-background-color;
	}
</style>
