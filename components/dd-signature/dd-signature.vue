<template>
	<view class="dd-signature">
		<view class="dd-signature__canvas-wrap" :style="{background: resolvedBgColor}">
			<dd-canvas 
				ref="signatureCanvas"
				:canvas-id="canvasId"
				:width="canvasWidth"
				:height="canvasHeight"
				:bg-color="resolvedBgColor"
				@touchstart="touchStart" 
				@touchmove="touchMove" 
				@touchend="touchEnd"
				:disable-scroll="true"
				class="dd-signature__canvas"
				:style="{
					width: canvasWidth + 'px',
					height: canvasHeight + 'px',
				}">
			</dd-canvas>
		</view>
		
		<view v-if="showToolbar" class="dd-signature__toolbar">
			<view class="dd-signature__toolbar-icons">
				<view class="dd-signature__toolbar-icon" @click="undo">
					<dd-icon name="arrow-left" size="22" :color="pathStack.length === 0 ? iconDisabledColor : iconDefaultColor"></dd-icon>
				</view>
				<view class="dd-signature__toolbar-icon" @click="clear">
					<dd-icon name="delete" size="25" :color="iconDefaultColor"></dd-icon>
				</view>
				<view class="dd-signature__toolbar-icon" @click="toggleBrushSettings">
					<dd-icon name="brush-o" size="25" :color="iconDefaultColor"></dd-icon>
				</view>
				<view class="dd-signature__toolbar-icon" @click="toggleColorSettings">
					<dd-icon name="flower-o" size="24" :color="iconDefaultColor"></dd-icon>
				</view>
				<view class="dd-signature__toolbar-icon" @click="exportSignature">
					<dd-icon name="checked" size="25" :color="isEmpty ? iconDisabledColor : iconDefaultColor"></dd-icon>
				</view>
			</view>
			
			<!-- 笔画设置 -->
			<view v-if="showBrushSettings" class="dd-signature__brush-settings">
				<view class="dd-signature__progress">
					<text class="dd-signature__progress-label">笔画大小:</text>
					<dd-slider
						v-model="lineWidth"
						:min="1"
						:max="20"
						:step="1"
					></dd-slider>
				</view>
			</view>
			
			<!-- 颜色设置 -->
			<view v-if="showColorSettings" class="dd-signature__color-settings">
				<view class="dd-signature__color-picker">
                    <text class="dd-signature__color-label">笔画颜色:</text>
					<view class="dd-signature__colors">
						<view 
							v-for="(color, index) in presetColors" 
							:key="index"
							class="dd-signature__color-item"
							:class="{'dd-signature__color-item--active': lineColor === color}"
							:style="{ backgroundColor: color }"
							@click="selectColor(color)"
						></view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

interface Props {
	// 画布宽度
	width?: string | number
	// 画布高度
	height?: string | number
	// 背景颜色
	bgColor?: string
	// 默认笔画颜色
	color?: string
	// 默认笔画粗细
	thickness?: string | number
	// 是否显示工具栏
	showToolbar?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	width: 300,
	height: 200,
	bgColor: '#ffffff',
	color: '#000000',
	thickness: 3,
	showToolbar: true,
})

const emit = defineEmits<{
	(e: 'clear'): void
	(e: 'confirm', path: string): void
	(e: 'error', error: unknown): void
}>()

const canvasId = 'dd-signature-' + Math.random().toString(36).substr(2, 9)
const canvasWidth = ref(300)
const canvasHeight = ref(200)
const lineColor = ref('')
const lineWidth = ref(3)
const isDrawing = ref(false)
const pathStack = ref<any[]>([]) // 存储绘制路径用于回退
const currentPath = ref<any[]>([]) // 当前绘制路径
const isEmpty = ref(true)
const presetColors = [
	'#000000', // 黑色
	'#ff0000', // 红色
	'#00ff00', // 绿色
	'#0000ff', // 蓝色
	'#ffff00', // 黄色
	'#00ffff', // 青色
	'#ff00ff', // 紫色
	'#ffffff'  // 白色
]
const showBrushSettings = ref(false)
const showColorSettings = ref(false)
const lastPoint = ref<any>(null) // 保存上一个点的坐标
const canvasInstance = ref<any>(null) // 缓存canvas实例
const signatureCanvas = ref<any>(null)

// ponytail: 剥离运行时主题；签名画布默认保持白底（导出图片需白底）
const resolvedBgColor = computed(() => props.bgColor)
const iconDefaultColor = computed(() => '#999999')
const iconDisabledColor = computed(() => '#5c5c5c')

onMounted(() => {
	// 初始化时获取canvas实例
	nextTick(() => {
		getCanvasInstance()
		clearCanvas()
	})
})

watch(
	() => props.width,
	(newVal: any) => {
		canvasWidth.value = Number(newVal)
	},
	{ immediate: true }
)
watch(
	() => props.height,
	(newVal: any) => {
		canvasHeight.value = Number(newVal)
	},
	{ immediate: true }
)
watch(
	() => props.color,
	(newVal: any) => {
		lineColor.value = resolveStrokeColor(newVal)
	},
	{ immediate: true }
)
watch(
	() => props.thickness,
	(newVal: any) => {
		lineWidth.value = Number(newVal)
	},
	{ immediate: true }
)

function resolveStrokeColor(color: any) {
	return color
}

// 获取签名画布实例
function getCanvasInstance() {
	if (canvasInstance.value) {
		return canvasInstance.value
	}

	const canvasRef = signatureCanvas.value
	if (canvasRef) {
		canvasInstance.value = canvasRef
		return canvasRef
	}
	return null
}

function touchStart(e: any) {
	if (!canvasInstance.value || !canvasInstance.value.ctx) {
		getCanvasInstance()
	}

	if (!canvasInstance.value || !canvasInstance.value.ctx) return

	isDrawing.value = true
	isEmpty.value = false
	currentPath.value = []

	const { x, y } = getCanvasPoint(e)

	// 设置线条样式
	canvasInstance.value.setLineStyle(lineColor.value, lineWidth.value)

	// 开始路径
	canvasInstance.value.beginPath()
	canvasInstance.value.moveTo(x, y)

	// 记录起始点
	currentPath.value.push({
		x,
		y,
		type: 'start',
		color: lineColor.value,
		width: lineWidth.value
	})

	// 保存上一个点
	lastPoint.value = { x, y }

	// 阻止默认事件以提高性能
	e.preventDefault()
}

function touchMove(e: any) {
	if (!isDrawing.value || !canvasInstance.value || !canvasInstance.value.ctx) return

	// 阻止默认事件以提高性能
	e.preventDefault()

	const { x, y } = getCanvasPoint(e)

	// 从上一个点画线到当前点
	canvasInstance.value.lineTo(x, y)
	canvasInstance.value.stroke() // 实时绘制当前线段
	currentPath.value.push({
		x,
		y,
		type: 'move'
	})
	canvasInstance.value.draw(false)

	// 更新上一个点
	lastPoint.value = { x, y }
}

function touchEnd(e: any) {
	if (!isDrawing.value || !canvasInstance.value || !canvasInstance.value.ctx) return

	isDrawing.value = false
	canvasInstance.value.closePath()
	lastPoint.value = null

	// 将当前路径加入栈中用于回退
	if (currentPath.value.length > 0) {
		pathStack.value.push([...currentPath.value])
	}

	// 最后统一执行一次绘制
	canvasInstance.value.draw(true)
}

// 同步获取canvas坐标点（兼容处理）
function getCanvasPoint(e: any) {
	let touch
	// #ifdef MP-WEIXIN
	touch = e.touches && e.touches[0] ? e.touches[0] : e.mp.touches[0]
	// #endif
	// #ifndef MP-WEIXIN
	touch = e.touches[0]
	// #endif

	// 计算相对于canvas的坐标
	// 由于无法直接获取canvas位置，这里简化处理
	// 实际应用中可能需要通过uni.createSelectorQuery获取canvas位置
	return {
		x: touch.x,
		y: touch.y
	}
}

// 选择颜色
function selectColor(color: string) {
	lineColor.value = color
}

// 回退操作
function undo() {
	if (pathStack.value.length === 0) return

	// 弹出最后一个路径
	pathStack.value.pop()

	// 重新绘制
	redraw()
}

// 重新绘制所有路径
function redraw() {
	if (!canvasInstance.value) {
		getCanvasInstance()
	}

	if (!canvasInstance.value) return

	// 先清空画布
	canvasInstance.value.clearCanvas()

	if (pathStack.value.length === 0) {
		isEmpty.value = true
		return
	}

	isEmpty.value = false

	// 逐个绘制路径
	pathStack.value.forEach((path: any) => {
		if (path.length === 0) return

		canvasInstance.value.beginPath()

		let lastPoint = null
		path.forEach((point: any, index: number) => {
			if (index === 0 && point.type === 'start') {
				// 设置线条样式
				canvasInstance.value.setLineStyle(point.color, point.width)
				canvasInstance.value.moveTo(point.x, point.y)
				lastPoint = { x: point.x, y: point.y }
			} else if (point.type === 'move') {
				canvasInstance.value.lineTo(point.x, point.y)
				lastPoint = { x: point.x, y: point.y }
			}
		})
		canvasInstance.value.stroke()
		canvasInstance.value.draw(true)
	})
}

// 清空画布内容
function clearCanvas() {
	if (!canvasInstance.value) {
		getCanvasInstance()
	}

	if (!canvasInstance.value) return

	canvasInstance.value.clearCanvas()
}

// 对外暴露的清空方法（供工具栏与ref调用）
function clear() {
	pathStack.value = []
	currentPath.value = []
	lastPoint.value = null
	isDrawing.value = false
	isEmpty.value = true
	clearCanvas()
	emit('clear')
}

// 导出签名图片
async function exportSignature() {
	if (isEmpty.value) {
		console.warn('签名为空，无法导出')
		return
	}

	if (!canvasInstance.value) {
		getCanvasInstance()
	}

	if (!canvasInstance.value) {
		console.error('无法获取画布实例')
		return
	}

	try {
		// 先重绘整个签名内容
		redraw()

		// 导出图片
		const imagePath = await canvasInstance.value.exportImage('png', 1)
		emit('confirm', imagePath)
	} catch (error) {
		console.error('导出签名图片失败:', error)
		emit('error', error)
	}
}

// 切换笔画设置显示
function toggleBrushSettings() {
	showBrushSettings.value = !showBrushSettings.value
	if (showBrushSettings.value) {
		showColorSettings.value = false
	}
}

// 切换颜色设置显示
function toggleColorSettings() {
	showColorSettings.value = !showColorSettings.value
	if (showColorSettings.value) {
		showBrushSettings.value = false
	}
}

defineExpose({
	canvasId,
	canvasWidth,
	canvasHeight,
	lineColor,
	lineWidth,
	isDrawing,
	pathStack,
	currentPath,
	isEmpty,
	presetColors,
	showBrushSettings,
	showColorSettings,
	lastPoint,
	resolveStrokeColor,
	getCanvasInstance,
	touchStart,
	touchMove,
	touchEnd,
	getCanvasPoint,
	selectColor,
	undo,
	redraw,
	clearCanvas,
	clear,
	exportSignature,
	toggleBrushSettings,
	toggleColorSettings,
})
</script>

<style lang="scss" scoped>
	@import '../../scss/variables';
	@import '../../scss/mixins';
	.dd-signature {
		display: flex;
		flex-direction: column;
		
		&__canvas-wrap {
			border: 1px solid var(--dd-border-default, #{$dd-border-default});
			border-radius: $dd-radius-md;
			overflow: hidden;
		}
		
		&__canvas {
			width: 100%;
			height: 100%;
		}
		
		&__toolbar {
			margin-top: 10rpx;
            background-color: var(--dd-bg-elevated, #{$dd-bg-elevated});
		}
		
		&__toolbar-icons {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 1px 0;
			// border: 1px solid #e0e0e0;
			border-radius: $dd-radius-md;
		}
		
		&__toolbar-icon {
			padding: 10rpx;
		}
		
		&__brush-settings,
		&__color-settings {
			margin-top: 30rpx;
			padding: 1px;
			// border: 1px solid #e0e0e0;
			border-radius: $dd-radius-md;
		}
		
		&__progress {
			&-label {
				display: block;
				margin-bottom: 20rpx;
				font-size: $dd-font-size-body;
				color: var(--dd-text-tertiary, #{$dd-text-tertiary});
			}
		}
		
		&__color-picker {
			margin-bottom: 20rpx;
		}
		
		&__color-label {
			display: block;
			margin-bottom: 20rpx;
			font-size: $dd-font-size-body;
			color: var(--dd-text-tertiary, #{$dd-text-tertiary});
		}
		
		&__colors {
			display: flex;
            flex-direction: row;
			flex-wrap: wrap;
			gap: 20rpx;
		}
		
		&__color-item {
			width: 60rpx;
			height: 60rpx;
			border-radius: 50%;
			border: 2px solid var(--dd-border-default, #{$dd-border-default});
			cursor: pointer;
			
			&--active {
				border-color: var(--dd-primary-400, #{$dd-primary-400});
				transform: scale(1.1);
			}
		}
		
		&__actions {
			display: flex;
            flex-direction: row;
			gap: 20rpx;
			justify-content: center;
		}
	}
</style>
