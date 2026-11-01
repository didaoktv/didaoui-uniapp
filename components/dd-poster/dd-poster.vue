<template>
	<view class="dd-poster">
		<!-- canvas用于绘制海报 -->
		<view v-if="showCanvas" class="dd-poster__renderer" :style="{ zIndex: zcBase }">
			<dd-canvas
				ref="posterCanvas"
				class="dd-poster__hidden-canvas"
				:canvas-id="canvasId"
				:width="canvasWidth"
				:height="canvasHeight"
				bg-color="transparent"
				:style="{ zIndex: zcBase, width: canvasWidth + 'px', height: canvasHeight + 'px' }">
			</dd-canvas>
		</view>
		<!-- 隐藏的二维码组件，用于生成二维码图片 -->
		<view class="dd-poster__renderer" :style="{ zIndex: zcBase }">
			<dd-qrcode
				ref="qrCode"
				:val="qrCodeValue"
				:size="qrCodeSize"
				:margin="0"
				:loadMake="false"
				:onval="false"
				background="#ffffff"
				foreground="#000000"
				:class="['dd-poster__hidden-qrcode', qrCodeShow ? '' : 'dd-poster__hidden-qrcode--hidden']"
				:style="{ zIndex: zcBase }"
			/>
		</view>
	</view>
</template>

<script setup lang="ts">
/**
 * Poster 海报组件
 * @description 用于生成海报的组件，支持文本、图片、二维码等元素
 *
 * @property {Object} json 海报配置JSON数据
 * @property {Object} json.css 海报容器样式
 * @property {Array}  json.views 海报元素列表
 * @property {String} json.views.type 元素类型(text/image/qrcode/view)
 * @property {String} json.views.text 文本内容(仅text类型)
 * @property {String} json.views.src 图片地址(仅image/qrcode类型)
 * @property {Object} json.views.css 元素样式
 * 
 * @example <dd-poster :json="posterJson"></dd-poster>
 */

import { rpx2px } from '../../libs/function/index.js';
// z-index 统一取 libs/config/zIndex.js（离屏隐藏容器归 base 档，Options API 经 data 暴露给模板）
import zIndexConfig from '../../libs/config/zIndex.js';
import { nextTick, ref } from 'vue'

interface Props {
	json?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
	json: () => ({})
})

// 离屏隐藏容器层级（base 档）
const zcBase = zIndexConfig.base
const canvasId = 'dd-poster-canvas-' + Date.now()
const showCanvas = ref(false)
const canvasWidth = ref(0)
const canvasHeight = ref(0)
// 二维码相关数据
const qrCodeValue = ref('')
const qrCodeSize = ref(200)
const qrCodeShow = ref(false)
// 存储多个二维码的数据
const qrCodeMap = new Map<string, string>()

const posterCanvas = ref<any>(null)
const qrCode = ref<any>(null)

// 根据传入的css生成文本样式
function getTextStyle(css: any) {
	const style: any = {};
	if (css.color) style.color = css.color;
	if (css.fontSize) style.fontSize = css.fontSize;
	if (css.fontWeight) style.fontWeight = css.fontWeight;
	if (css.lineHeight) style.lineHeight = css.lineHeight;
	if (css.textAlign) style.textAlign = css.textAlign;
	return style;
}

/**
 * 导出海报图片
 * @description 根据json配置生成海报并导出为临时图片路径
 * @returns {Promise<Object>} 返回包含图片信息的对象
 * @author jry ijry@qq.com
 */
async function exportImage() {
	let timeoutId: any = null;
	try {
		const timeoutPromise = new Promise<any>((resolve, reject) => {
			timeoutId = setTimeout(() => reject(new Error('导出图片超时')), 20000);
		});
		const exportPromise = (async () => {
			// 获取海报尺寸信息
			const posterSize = props.json.css || {};
			const width = convertRpxToPx(posterSize.width || '750rpx');
			const height = convertRpxToPx(posterSize.height || '1114rpx');

			canvasWidth.value = width;
			canvasHeight.value = height;
			showCanvas.value = true;
			await nextTick();

			const posterCanvasInstance = await getPosterCanvas();
			const ctx = posterCanvasInstance;
			if (posterSize.background) {
				if (posterSize.background.includes('linear-gradient') || posterSize.background.includes('radial-gradient')) {
					drawGradientBackground(ctx, posterSize, 0, 0, width, height);
				} else {
					ctx.setFillStyle(posterSize.background);
					ctx.fillRect(0, 0, width, height);
				}
			}

			for (const item of props.json.views || []) {
				await drawItem(ctx, item, width, height);
			}

			await flushPosterCanvas(posterCanvasInstance);
			const res = await posterCanvasInstance.toTempFilePath({ width, height });
			const path = res && (res.tempFilePath || res.apFilePath);
			if (!path) {
				throw new Error('导出图片未返回文件路径');
			}
			return {
				width,
				height,
				path,
				blob: dataURLToBlob(path)
			};
		})();
		return await Promise.race([exportPromise, timeoutPromise]);
	} finally {
		if (timeoutId) clearTimeout(timeoutId);
		showCanvas.value = false;
	}
}

function flushPosterCanvas(posterCanvasInstance: any) {
	return new Promise<void>((resolve, reject) => {
		let settled = false;
		const finish = (error?: any) => {
			if (settled) return;
			settled = true;
			if (error) reject(error);
			else resolve();
		};
		try {
			const result = posterCanvasInstance.draw(false, () => finish());
			if (result && typeof result.then === 'function') {
				result.then(() => finish(), finish);
			}
		} catch (error) {
			finish(error);
		}
	});
}

async function getPosterCanvas() {
	await nextTick();
	const instance = posterCanvas.value;
	if (!instance) {
		throw new Error('无法获取海报画布实例');
	}
	const initialized = await instance.initCanvas();
	if (!initialized || !instance.getRawContext()) {
		throw new Error('无法初始化海报画布');
	}
	return instance;
}

/**
 * 绘制单个元素
 * @description 根据元素类型绘制文本、图片、矩形或二维码到canvas
 * @param {Object} ctx canvas上下文
 * @param {Object} item 元素配置信息
 * @param {Number} canvasWidth canvas宽度
 * @param {Number} canvasHeight canvas高度
 * @returns {Promise} 绘制完成的Promise
 * @author jry ijry@qq.com
 */
async function drawItem(ctx: any, item: any, canvasWidth: number, canvasHeight: number) {
	const css = item.css || {};
	const left = convertRpxToPx(css.left || '0rpx');
	const top = convertRpxToPx(css.top || '0rpx');
	const width = convertRpxToPx(css.width || '0rpx');
	const height = convertRpxToPx(css.height || '0rpx');
	
	switch (item.type) {
		case 'view':
			// 绘制矩形背景
			if (css.background) {
				// 支持渐变背景色
				if (css.background.includes('linear-gradient') || css.background.includes('radial-gradient')) {
					drawGradientBackground(ctx, css, left, top, width, height);
				} else {
					ctx.setFillStyle(css.background);
					// 处理圆角
					if (css.radius) {
						const radius = convertRpxToPx(css.radius);
						drawRoundRect(ctx, left, top, width, height, radius, css.background);
					} else {
						ctx.fillRect(left, top, width, height);
					}
				}
			}
			break;
			
		case 'text':
			// 设置文本样式
			ctx.setFillStyle(css.color || '#000000');
			if (css.fontSize) {
				const fontSize = convertRpxToPx(css.fontSize);
				ctx.setFontSize(fontSize);
			}
			if (css.fontWeight) {
				ctx.setLineWidth(css.fontWeight === 'bold' ? 2 : 1);
			}
			
			// 处理文本换行
			if (css.lineClamp) {
				await drawTextWithLineClamp(ctx, item.text, left, top, width, css);
			} else {
				// 修复：文本垂直居中对齐问题
				const textBaseLine = css.fontSize ? convertRpxToPx(css.fontSize) / 2 : 10;
				ctx.fillText(item.text, left, top + textBaseLine);
			}
			break;
			
		case 'image':
			// 绘制图片
			return new Promise<void>((resolve, reject) => {
				uni.getImageInfo({
					src: item.src,
					success: async (res) => {
						let clipped = false;
						try {
							if (css.radius) {
								const radius = convertRpxToPx(css.radius);
								clipRoundRect(ctx, left, top, width, height, radius);
								clipped = true;
							}
							await ctx.drawImage(res.path, left, top, width, height);
							resolve();
						} catch (error: any) {
							reject(new Error(`海报图片绘制失败: ${error && error.message ? error.message : error}`));
						} finally {
							if (clipped) ctx.restore();
						}
					},
					fail: (e: any) => {
						reject(new Error(`海报图片加载失败: ${e && e.errMsg ? e.errMsg : e}`));
					}
				});
			});
			
		case 'qrcode':
			// 绘制二维码
			if (item.text) {
				// 使用 dd-qrcode 生成二维码图片
				const qrCodeImageUrl = await generateQRCode(item.text, width, height);
				const drawn = await ctx.drawImage(qrCodeImageUrl, left, top, width, height);
				if (drawn === false) {
					throw new Error('二维码图片无法绘制到海报画布');
				}
			} else {
				// 绘制二维码占位符
				ctx.setFillStyle('#f5f5f5');
				ctx.fillRect(left, top, width, height);
				ctx.setFillStyle('#999');
				ctx.setFontSize(12);
				ctx.setTextAlign('center');
				ctx.fillText('QR', left + width/2, top + height/2);
				ctx.setTextAlign('left');
			}
			break;
	}
}

/**
 * 绘制圆角矩形
 * @description 绘制指定位置和尺寸的圆角矩形
 * @param {Object} ctx canvas上下文
 * @param {Number} x x坐标
 * @param {Number} y y坐标
 * @param {Number} width 宽度
 * @param {Number} height 高度
 * @param {Number} radius 圆角半径
 * @param {String} fillColor 填充颜色
 * @author jry ijry@qq.com
 */
function drawRoundRect(ctx: any, x: number, y: number, width: number, height: number, radius: number, fillColor?: any) {
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
	if (fillColor) {
		ctx.setFillStyle(fillColor);
		ctx.fill();
	}
	ctx.restore();
}

/**
 * 裁剪圆角矩形区域
 * @description 在canvas上创建圆角矩形裁剪区域
 * @param {Object} ctx canvas上下文
 * @param {Number} x x坐标
 * @param {Number} y y坐标
 * @param {Number} width 宽度
 * @param {Number} height 高度
 * @param {Number} radius 圆角半径
 * @author jry ijry@qq.com
 */
function clipRoundRect(ctx: any, x: number, y: number, width: number, height: number, radius: number) {
	ctx.save();
	ctx.beginPath();
	ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5);
	ctx.lineTo(x + width - radius, y);
	ctx.arc(x + width - radius, y + radius, radius, Math.PI * 1.5, Math.PI * 2);
	ctx.lineTo(x + width, y + height - radius);
	ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI * 0.5);
	ctx.lineTo(x + radius, y + height);
	ctx.arc(x + radius, y + height - radius, radius, Math.PI * 0.5, Math.PI);
	ctx.closePath();
	ctx.clip();
}

/**
 * 绘制带行数限制的文本
 * @description 绘制可控制最大行数的文本，超出部分显示省略号
 * @param {Object} ctx canvas上下文
 * @param {String} text 文本内容
 * @param {Number} x x坐标
 * @param {Number} y y坐标
 * @param {Number} maxWidth 最大宽度
 * @param {Object} css 样式配置
 * @author jry ijry@qq.com
 */
async function drawTextWithLineClamp(ctx: any, text: any, x: number, y: number, maxWidth: number, css: any) {
	const lineClamp = Math.max(1, parseInt(css.lineClamp, 10) || 1);
	const lineHeight = css.lineHeight ? convertRpxToPx(css.lineHeight) : 20;
	const characters = Array.from(String(text || ''));
	const lines: string[] = [];
	const ellipsis = '...';
	const measurementCache = new Map<string, number>();
	const fontSize = css.fontSize ? convertRpxToPx(css.fontSize) : 20;
	// 兜底估算：全角字符约占一个字号，半角约 0.56。测量失败时若按半角估算，
	// 中文会短算 40% 而不换行，所以必须区分宽度。
	const estimateWidth = (value: string) => Array.from(String(value)).reduce((width: number, char: string) => {
		if (/[ᄀ-ᅟ⺀-〾぀-㏿㐀-䶿一-鿿ꀀ-꓏가-힣豈-﫿︰-﹯＀-｠￠-￦]/.test(char)) {
			return width + fontSize;
		}
		if (/\s/.test(char)) return width + fontSize * 0.28;
		return width + fontSize * 0.56;
	}, 0);
	const measureTextWidth = async (value: string) => {
		if (measurementCache.has(value)) {
			return measurementCache.get(value)!;
		}
		let metrics: any;
		if (ctx && typeof ctx.measureTextAsync === 'function') {
			metrics = await ctx.measureTextAsync(value);
		} else {
			metrics = ctx.measureText(value);
		}
		let measuredWidth = Number(metrics && metrics.width) || 0;
		// 测量不可用时(鸿蒙同步 measureText 恒返回 0)必须改用估算：
		// 把 0 当作真实宽度会让下面的 <= maxWidth 恒成立，整段文本挤成一行。
		if (!(measuredWidth > 0) && value) {
			measuredWidth = estimateWidth(value);
		}
		measurementCache.set(value, measuredWidth);
		return measuredWidth;
	};
	const findTextFitLength = async (values: string[], suffix = '') => {
		let low = 0;
		let high = values.length;
		while (low < high) {
			const middle = Math.ceil((low + high) / 2);
			const candidate = values.slice(0, middle).join('') + suffix;
			if (await measureTextWidth(candidate) <= maxWidth) {
				low = middle;
			} else {
				high = middle - 1;
			}
		}
		return low;
	};

	let offset = 0;
	while (offset < characters.length && lines.length < lineClamp) {
		const remaining = characters.slice(offset);
		const remainingText = remaining.join('');
		if (await measureTextWidth(remainingText) <= maxWidth) {
			lines.push(remainingText);
			break;
		}

		const isLastLine = lines.length === lineClamp - 1;
		if (isLastLine) {
			let suffix = ellipsis;
			while (suffix && await measureTextWidth(suffix) > maxWidth) {
				suffix = suffix.slice(0, -1);
			}
			const fitLength = await findTextFitLength(remaining, suffix);
			lines.push(remaining.slice(0, fitLength).join('') + suffix);
			break;
		}

		const fitLength = Math.max(1, await findTextFitLength(remaining));
		lines.push(remaining.slice(0, fitLength).join(''));
		offset += fitLength;
	}

	const textBaseLine = css.fontSize ? convertRpxToPx(css.fontSize) / 2 : 10;
	for (let i = 0; i < lines.length; i++) {
		ctx.fillText(lines[i], x, y + (i * lineHeight) + textBaseLine);
	}
}

/**
 * 生成二维码图片
 * @description 根据文本内容生成二维码图片URL
 * @param {String} text 二维码内容
 * @param {Number} width 二维码宽度
 * @param {Number} height 二维码高度
 * @returns {Promise<String>} 二维码图片URL
 * @author jry ijry@qq.com
 */
async function generateQRCode(text: string, width: number, height: number) {
	const qrCodeKey = `${text}_${width}_${height}`;
	if (qrCodeMap.has(qrCodeKey)) {
		return qrCodeMap.get(qrCodeKey)!;
	}

	qrCodeValue.value = text;
	qrCodeSize.value = Math.max(width, height);
	qrCodeShow.value = true;

	try {
		await nextTick();
		const qrCodeInstance = qrCode.value;
		if (!qrCodeInstance) {
			throw new Error('无法获取二维码组件实例');
		}
		if (typeof qrCodeInstance.refreshCanvas === 'function') {
			await qrCodeInstance.refreshCanvas();
		}
		const generatedPath = await qrCodeInstance._makeCode();
		let tempFilePath = typeof generatedPath === 'string' ? generatedPath : '';
		if (!tempFilePath) {
			const res = await qrCodeInstance.toTempFilePath();
			tempFilePath = res && (res.tempFilePath || res.apFilePath);
		}
		if (!tempFilePath) {
			throw new Error('二维码组件未返回图片路径');
		}
		qrCodeMap.set(qrCodeKey, tempFilePath);
		return tempFilePath;
	} catch (error: any) {
		throw new Error(`二维码生成失败: ${error && error.message ? error.message : error}`);
	} finally {
		qrCodeShow.value = false;
	}
}

/**
 * 将rpx单位转换为px
 * @description 根据屏幕密度将rpx单位转换为px单位
 * @param {String|Number} rpxValue rpx值
 * @returns {Number} 转换后的px值
 * @author jry ijry@qq.com
 */
function convertRpxToPx(rpxValue: string | number) {
	if (typeof rpxValue === 'number') return rpxValue;

	// 使用rpx2px方法
	if (typeof rpxValue === 'string' && rpxValue.endsWith('rpx')) {
		const value = parseFloat(rpxValue);
		return value * getRpxRatio();
	}

	return parseFloat(rpxValue) || 0;
}

/**
 * 获取 rpx -> px 的统一换算比例
 * @description uni.upx2px 对每个值单独判断设备宽度：当 windowWidth 超过
 *   rpxCalcMaxDeviceWidth(默认960)时，只有恰好等于 750 的值使用真实设备宽度，
 *   其余值回退到 rpxCalcBaseDeviceWidth(默认375)。海报需要所有尺寸共用同一
 *   比例，逐值换算会让宽高用上不同基准而破坏宽高比：鸿蒙 windowWidth 上报为
 *   物理像素1084，750rpx算得1084、1114rpx算得557，海报因此变成横向。
 *   这里只取一次比例，且刻意用非 750 的值探测，避开上面的特例分支，
 *   使超宽设备统一走 baseWidth，避免画布被放大到数十MB。
 * @returns {Number} 每 1rpx 对应的 px 值
 * @author jry ijry@qq.com
 */
function getRpxRatio() {
	const PROBE = 1000; // 不能用 750，750 是 upx2px 的特例值
	const ratio = rpx2px(PROBE) / PROBE;
	return ratio > 0 ? ratio : 1;
}

/**
 * 绘制渐变背景
 * @description 绘制线性渐变或径向渐变背景
 * @param {Object} ctx canvas上下文
 * @param {Object} css 样式配置
 * @param {Number} left 左边距
 * @param {Number} top 上边距
 * @param {Number} width 宽度
 * @param {Number} height 高度
 * @author jry ijry@qq.com
 */
function drawGradientBackground(ctx: any, css: any, left: number, top: number, width: number, height: number) {
	const background = css.background;
	let gradient: any = null;
	
	// 处理线性渐变
	if (background.includes('linear-gradient')) {
		// 解析线性渐变角度和颜色
		const angleMatch = background.match(/linear-gradient\((\d+)deg/);
		const angle = angleMatch ? parseInt(angleMatch[1]) : 135;
		
		// 根据角度计算渐变起点和终点
		let startX = left, startY = top, endX = left + width, endY = top + height;
		
		// 简化的角度处理（支持常见角度）
		if (angle === 0) {
			startX = left;
			startY = top + height;
			endX = left;
			endY = top;
		} else if (angle === 90) {
			startX = left;
			startY = top;
			endX = left + width;
			endY = top;
		} else if (angle === 180) {
			startX = left;
			startY = top;
			endX = left;
			endY = top + height;
		} else if (angle === 270) {
			startX = left + width;
			startY = top;
			endX = left;
			endY = top;
		}
		
		gradient = ctx.createLinearGradient(startX, startY, endX, endY);
		
		// 解析颜色值
		const colorMatches = background.match(/#[0-9a-fA-F]+|rgba?\([^)]+\)/g);
		if (colorMatches && colorMatches.length >= 2) {
			// 添加渐变色点
			colorMatches.forEach((color: string, index: number) => {
				const stop = index / (colorMatches.length - 1);
				gradient.addColorStop(stop, color);
			});
		}
	} 
	// 处理径向渐变
	else if (background.includes('radial-gradient')) {
		// 径向渐变从中心开始
		const centerX = left + width / 2;
		const centerY = top + height / 2;
		const radius = Math.min(width, height) / 2;
		
		gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
		
		// 解析颜色值
		const colorMatches = background.match(/#[0-9a-fA-F]+|rgba?\([^)]+\)/g);
		if (colorMatches && colorMatches.length >= 2) {
			// 添加渐变色点
			colorMatches.forEach((color: string, index: number) => {
				const stop = index / (colorMatches.length - 1);
				gradient.addColorStop(stop, color);
			});
		}
	}
	
	if (gradient) {
		ctx.setFillStyle(gradient);
		// 处理圆角
		if (css.radius) {
			const radius = convertRpxToPx(css.radius);
			drawRoundRect(ctx, left, top, width, height, radius, gradient);
		} else {
			ctx.fillRect(left, top, width, height);
		}
	}
}

/**
 * 将dataURL转换为Blob
 * @description H5环境下将base64格式的dataURL转换为Blob对象
 * @param {String} dataURL base64格式的图片数据
 * @returns {Blob} Blob对象
 * @author jry ijry@qq.com
 */
function dataURLToBlob(dataURL: any) {
	// 检查是否为H5环境且是base64数据
	// #ifdef H5
	if (dataURL && dataURL.startsWith('data:image')) {
		const parts = dataURL.split(';base64,');
		const contentType = parts[0].split(':')[1];
		const raw = window.atob(parts[1]);
		const rawLength = raw.length;
		const uInt8Array = new Uint8Array(rawLength);
		
		for (let i = 0; i < rawLength; ++i) {
			uInt8Array[i] = raw.charCodeAt(i);
		}
		
		return new Blob([uInt8Array], { type: contentType });
	}
	// #endif
	
	return null;
}

defineExpose({
	exportImage,
	flushPosterCanvas,
	getPosterCanvas,
	drawItem,
	drawRoundRect,
	clipRoundRect,
	drawTextWithLineClamp,
	generateQRCode,
	convertRpxToPx,
	getRpxRatio,
	drawGradientBackground,
	dataURLToBlob,
	getTextStyle
})
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';
.dd-poster {
	position: relative;
	
	&__canvas {
		position: relative;
		overflow: hidden;
	}
	
	/* #ifdef APP-NVUE */
	&__renderer {
		position: fixed;
		top: -1px;
		left: -1px;
		width: 1px;
		height: 1px;
		overflow: hidden;
		opacity: 0.01;
		pointer-events: none;
	}
	/* #endif */

	/* #ifndef APP-NVUE */
	&__renderer {
		position: fixed;
		top: -10000px;
		left: -10000px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	&__hidden-canvas {
		position: fixed;
		top: -10000px;
		left: -10000px;
	}

	&__hidden-qrcode {
		position: fixed;
		top: -10000px;
		left: -10000px;

		&--hidden {
			display: none;
		}
	}
	/* #endif */
}
</style>
