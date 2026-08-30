<template>
	<view class="dd-car-keyboard" :class="customClass" :style="customStyle">
		<!-- 车牌格子：7 位普通 + 第 8 位新能源（绿框） -->
		<view class="dd-car-keyboard__boxes">
			<view
				v-for="(char, index) in cells"
				:key="index"
				class="dd-car-keyboard__box"
				:class="[
					active === index && 'dd-car-keyboard__box--active',
					index === 7 && 'dd-car-keyboard__box--energy'
				]"
				@tap="onBoxTap(index)"
			>
				<view
					v-if="active === index"
					class="dd-car-keyboard__box-line"
				></view>
				<view
					v-if="index === 7"
					class="dd-car-keyboard__badge"
				>
					<text class="dd-car-keyboard__badge-text">新能源</text>
				</view>
				<text class="dd-car-keyboard__box-text">{{ char }}</text>
			</view>
		</view>

		<!-- 键盘弹层：0 位省份键盘，其余位字母数字键盘（按位锁键） -->
		<view
			v-if="active >= 0"
			class="dd-car-keyboard__panel"
			@touchmove.stop.prevent="noop"
		>
			<view class="dd-car-keyboard__close" @tap="closeKeyboard">
				<text class="dd-car-keyboard__close-text">关闭</text>
			</view>
			<view
				v-for="(row, rowIndex) in keyRows"
				:key="rowIndex"
				class="dd-car-keyboard__row"
			>
				<view
					v-for="item in row"
					:key="item.label"
					class="dd-car-keyboard__key"
					:class="[item.locked && 'dd-car-keyboard__key--lock']"
					hover-class="dd-car-keyboard__key--hover"
					:hover-stay-time="100"
					@tap="onKeyTap(item)"
				>
					<text class="dd-car-keyboard__key-text">{{ item.label }}</text>
				</view>
				<view
					v-if="rowIndex === 3"
					class="dd-car-keyboard__key dd-car-keyboard__key--del"
					hover-class="dd-car-keyboard__key--hover"
					:hover-stay-time="100"
					@tap="onBackspaceTap"
				>
					<dd-icon size="22" name="backspace"></dd-icon>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import DdIcon from '../dd-icon/dd-icon.vue'
import { MAX_LEN, getKeyRows, nextPos, type KeyItem } from './carPlate'

/**
 * dd-car-keyboard 车牌号输入键盘
 * 车牌格子 + 弹出键盘一体：0 位省份简称，其余位字母数字，按位锁键，末位为新能源（绿牌）位
 * @property {String} modelValue 车牌号（v-model）
 * @event {Function} update:modelValue 输入变化
 * @event {Function} focus 键盘弹出
 * @event {Function} blur 键盘收起
 * @example <dd-car-keyboard v-model="plateNo" />
 */

interface Props {
	modelValue?: string
	customClass?: string
	customStyle?: string
}
const props = withDefaults(defineProps<Props>(), {
	modelValue: '',
	customClass: '',
	customStyle: ''
})

const emit = defineEmits<{
	(e: 'update:modelValue', val: string): void
	(e: 'focus', val: string): void
	(e: 'blur', val: string): void
}>()

// 空位用空格占位（与退格逻辑配合：清当前位后停留在该位）
const cells = ref<string[]>(Array(MAX_LEN).fill(' '))
const active = ref(-1)

// 键位布局/按位锁键纯逻辑见 ./carPlate
const keyRows = computed(() => getKeyRows(active.value))

// 外部 v-model 同步到格子（支持清空与部分更新）
watch(
	() => props.modelValue,
	(val) => {
		const list = (val || '').split('')
		cells.value = Array.from({ length: MAX_LEN }, (_, i) => list[i] ?? ' ')
	},
	{ immediate: true }
)

const keyboardVisible = computed(() => active.value >= 0)
watch(keyboardVisible, (visible) => {
	if (visible) emit('focus', props.modelValue)
	else emit('blur', props.modelValue)
})

function noop() {}

function onBoxTap(index: number) {
	active.value = index
}

function onKeyTap(item: KeyItem) {
	if (item.locked || active.value < 0) return
	cells.value[active.value] = item.label
	active.value = nextPos(active.value)
	emitValue()
}

function closeKeyboard() {
	active.value = -1
}

function onBackspaceTap() {
	if (active.value < 0) return
	if (cells.value[active.value] === ' ' && active.value > 0) {
		active.value--
	}
	cells.value[active.value] = ' '
	emitValue()
}

function emitValue() {
	emit('update:modelValue', cells.value.join('').trim())
}
</script>

<style lang="scss" scoped>
/* 头部固定引入；只消费 $dd-* token，样式值写 var(--dd-x, $dd-x) 兜底形式 */
@import '../../scss/variables';
@import '../../scss/dd-shared';

$dd-car-keyboard-gap: 8rpx !default;
$dd-car-keyboard-box-height: 76rpx !default;
$dd-car-keyboard-box-border: 1px solid var(--dd-border-default, #{$dd-border-default}) !default;
$dd-car-keyboard-key-height: 76rpx !default;
$dd-car-keyboard-panel-padding: 0 var(--dd-space-2, #{$dd-space-2}) var(--dd-space-2, #{$dd-space-2}) !default;

.dd-car-keyboard {
	&__boxes {
		@include flex;
		gap: $dd-car-keyboard-gap;
	}

	&__box {
		@include flex;
		position: relative;
		justify-content: center;
		align-items: center;
		flex: 1;
		height: $dd-car-keyboard-box-height;
		border: $dd-car-keyboard-box-border;
		border-radius: var(--dd-radius-md, #{$dd-radius-md});

		&--active {
			border-color: var(--dd-primary-400, #{$dd-primary-400});
		}

		&--energy {
			border-color: var(--dd-success-500, #{$dd-success-500});
		}
	}

	&__box-line {
		position: absolute;
		bottom: 6rpx;
		left: 15%;
		width: 70%;
		height: 4rpx;
		background-color: var(--dd-primary-400, #{$dd-primary-400});
	}

	&__box-text {
		font-size: 17px;
		color: var(--dd-text-primary, #{$dd-text-primary});
	}

	&__badge {
		@include flex;
		justify-content: center;
		position: absolute;
		top: -14rpx;
		left: 50%;
		transform: translateX(-50%);
		padding: 0 6rpx;
		background-color: var(--dd-success-500, #{$dd-success-500});
		border-radius: var(--dd-radius-sm, #{$dd-radius-sm});
	}

	&__badge-text {
		font-size: 10px;
		color: var(--dd-success-contrast, #{$dd-success-contrast});
	}

	&__panel {
		position: fixed;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 10075; // ponytail: 取 libs/config/zIndex.js popup 值，模板内不能用表达式故字面量
		background-color: var(--dd-bg-section, #{$dd-bg-section});
		padding: $dd-car-keyboard-panel-padding;
	}

	&__close {
		@include flex;
		justify-content: flex-end;
		padding: var(--dd-space-2, #{$dd-space-2}) 0;
	}

	&__close-text {
		padding: 0 var(--dd-space-2, #{$dd-space-2});
		font-size: 13.5px;
		color: var(--dd-text-secondary, #{$dd-text-secondary});
	}

	&__row {
		@include flex;
		margin-top: var(--dd-space-2, #{$dd-space-2});
		gap: $dd-car-keyboard-gap;
	}

	&__key {
		@include flex;
		justify-content: center;
		align-items: center;
		flex: 1;
		height: $dd-car-keyboard-key-height;
		background-color: var(--dd-surface-container-high, #{$dd-surface-container-high});
		border-radius: var(--dd-radius-md, #{$dd-radius-md});

		&--lock {
			opacity: 0.35;
		}

		&--hover {
			background-color: var(--dd-surface-hover, #{$dd-surface-hover});
		}

		&--del {
			flex: 2;
			color: var(--dd-text-primary, #{$dd-text-primary}); // 图标 color=inherit，由此处控制
		}
	}

	&__key-text {
		font-size: 16px;
		color: var(--dd-text-primary, #{$dd-text-primary});
	}
}
</style>
