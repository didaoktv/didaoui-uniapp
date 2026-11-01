<template>
	<view class="dd-cropper">
		<dd-canvas ref="avatarCanvas" :canvas-id="'avatar-canvas-' + instanceId" class="dd-cropper__avatar-canvas" :width="windowWidth || 0" :height="windowHeight || 0" :style="{ top: styleTop, height: cvsStyleHeight, zIndex: zc }" bg-color="transparent"></dd-canvas>
		<dd-canvas ref="operCanvas" :canvas-id="'oper-canvas-' + instanceId" class="dd-cropper__oper-canvas" :width="windowWidth || 0" :height="windowHeight || 0" :style="{ top: styleTop, height: cvsStyleHeight, zIndex: zcOper }" bg-color="transparent" @touchstart="start" @touchmove="move" @touchend="end"></dd-canvas>
		<dd-canvas ref="prvCanvas" :canvas-id="'prv-canvas-' + instanceId" class="dd-cropper__preview-canvas" :width="windowWidth || 0" :height="windowHeight || 0" bg-color="transparent" @touchstart="hideImg" :style="{ height: cvsStyleHeight, top: prvTop, zIndex: zcPrv }"></dd-canvas>
		<view class="dd-cropper__oper-wrapper" :style="{ display: styleDisplay, zIndex: zcBar }">
			<view class="dd-cropper__oper">
				<view class="dd-cropper__btn-wrapper" v-if="showOper">
					<view @click="select" hover-class="dd-cropper__btn-hover" :style="{ width: btnWidth }">
						<text>重选</text>
					</view>
					<view @click="close" hover-class="dd-cropper__btn-hover" :style="{ width: btnWidth }">
						<text>关闭</text>
					</view>
					<view @click="rotate" hover-class="dd-cropper__btn-hover" :style="{ width: btnWidth, display: btnDsp }">
						<text>旋转</text>
					</view>
					<view @click="preview" hover-class="dd-cropper__btn-hover" :style="{ width: btnWidth }">
						<text>预览</text>
					</view>
					<view @click="confirm" hover-class="dd-cropper__btn-hover" :style="{ width: btnWidth }">
						<text>确定</text>
					</view>
				</view>
				<view class="dd-cropper__clear-wrapper" v-else>
					<slider class="dd-cropper__slider" @change="colorChange" block-size="25" value="0" min="-100" max="100" activeColor="red" backgroundColor="green" block-color="grey" show-value></slider>
					<view @click="prvUpload" hover-class="dd-cropper__btn-hover" :style="{ width: btnWidth }">
						<text>确定</text>
					</view>
				</view>
			</view>
		</view>
		<view @click="chooseImage(0, {})" v-if="styleDisplay == 'none'">
			<slot></slot>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { nextTick, onMounted, ref } from 'vue'
	import zIndexConfig from '../../libs/config/zIndex.js'

	// 画布系组件（dd-canvas / dd-signature / dd-qrcode 同族）命令式 canvas 状态挂在 setup 作用域的
	// 普通变量上、不走响应式，避免触摸高频重绘的代理开销。

	// 底部操作条高度（px），与样式 .oper-wrapper 的 height 保持一致
	const tabHeight = 50;

	// z-index 统一取 libs/config/zIndex.js（cropper 档 + 显式偏移；经 ref 暴露给模板）。
	// ×2 原语义：预览层须盖过工作画布与操作条。
	const Z_CROPPER = zIndexConfig.cropper
	const Z_CROPPER_OPER = Z_CROPPER + 1
	const Z_CROPPER_PRV = Z_CROPPER * 2
	const Z_CROPPER_BAR = Z_CROPPER + 9

	interface Props {
		// 最小缩放倍数
		minScale?: number | string;
		// 最大缩放倍数
		maxScale?: number | string;
		// 是否允许双指缩放
		canScale?: boolean;
		// 是否允许旋转（inner 模式下不可用）
		canRotate?: boolean;
		lockWidth?: string;
		lockHeight?: string;
		// 拉伸模式：x / y / long / short / longSel / shortSel
		stretch?: string;
		// 锁定模式：x / y / long / short / longSel / shortSel
		lock?: string;
		// 页面无底部 tabbar 时保持 true
		noTab?: boolean;
		// 内部模式：隐藏旋转按钮、按钮加宽
		inner?: boolean;
		// 导出图片质量（0-1），仅对压缩格式生效
		quality?: number | string;
		// 实例标识，confirm 事件原样回传
		index?: number | string;
		// 是否允许拖拽四角控制点调整裁剪框大小
		canChangeSize?: boolean;
		// 裁剪区域宽度，如 '300rpx'
		areaWidth?: string;
		// 裁剪区域高度，如 '300rpx'
		areaHeight?: string;
		// 导出图片宽度，如 '260rpx'
		exportWidth?: string;
		// 导出图片高度，如 '260rpx'
		exportHeight?: string;
		// 画布填充色，默认透明，可传 'black'、'#ffffff' 等
		fillColor?: string;
	}

	const props = withDefaults(defineProps<Props>(), {
		minScale: 0.3,
		maxScale: 4,
		canScale: true,
		canRotate: true,
		lockWidth: '',
		lockHeight: '',
		stretch: '',
		lock: '',
		noTab: true,
		inner: false,
		quality: 0.9,
		index: '',
		canChangeSize: false,
		areaWidth: '300rpx',
		areaHeight: '300rpx',
		exportWidth: '260rpx',
		exportHeight: '260rpx',
		fillColor: 'transparent'
	});

	const emit = defineEmits<{
		(e: 'avtinit'): void;
		(e: 'confirm', val: { avatar: any; path: any; index: any; data: any }): void;
		(e: 'cancel'): void;
	}>();

	// 实例ID用于区分不同实例的 canvas-id
	const instanceId = ref(Date.now() + '-' + Math.random().toString(36).substring(2, 11));
	const cvsStyleHeight = ref('0px');
	const styleDisplay = ref('none');
	const styleTop = ref('-10000px');
	const prvTop = ref('-10000px');
	const selStyle = ref<any>({});
	const showOper = ref(true);
	// confirm 回载荷（avatar 字段）
	const imgSrc = ref<any>({
		imgSrc: ''
	});
	const btnWidth = ref('19%');
	const btnDsp = ref('flex');
	// 导出图片宽度（px，经 rpx 换算）
	const expWidth = ref<any>('');
	// 导出图片高度（px，经 rpx 换算）
	const expHeight = ref<any>('');
	// 是否允许调整裁剪框大小
	const letChangeSize = ref(false);
	// 底部安全区大小
	const safeAreaInsetsBottom = ref(0);
	// z-index 档位（libs/config/zIndex.js cropper 档派生，见 script 头部常量）
	const zc = ref(Z_CROPPER);
	const zcOper = ref(Z_CROPPER_OPER);
	const zcPrv = ref(Z_CROPPER_PRV);
	const zcBar = ref(Z_CROPPER_BAR);

	// 画布组件实例（原 $refs）
	const avatarCanvas = ref<any>(null);
	const operCanvas = ref<any>(null);
	const prvCanvas = ref<any>(null);

	// 以下状态与 Options API 时期一致：挂在实例上、不走响应式
	let ctxCanvas: any = null;
	let ctxCanvasOper: any = null;
	let ctxCanvasPrv: any = null;
	let qlty: any = 0.9;
	let letRotate: any = 1;
	let letScale: any = 1;
	let isin: any = 0;
	let indx: any = undefined;
	let mnScale: any = 0.3;
	let mxScale: any = 4;
	let noBar: any = 1;
	let stc: any = '';
	let lck: any = '';
	let moreHeight = 0;
	let platform: any = undefined;
	let pixelRatio: any = undefined;
	let windowWidth = 0;
	let windowHeight = 0;
	let drawTop = 0;
	let pxRatio = 0;
	let imgPath: any = undefined;
	let imgWidth = 0;
	let imgHeight = 0;
	let path: any = undefined;
	let hasSel: any = false;
	let fixWidth = 0;
	let fixHeight = 0;
	let lckWidth = 0;
	let lckHeight = 0;
	let scaleWidth = 0;
	let scaleHeight = 0;
	let scaleSize = 1;
	let rotateDeg = 0;
	let posWidth = 0;
	let posHeight = 0;
	let useWidth = 0;
	let useHeight = 0;
	let drawTm = 0;
	let prvTm = 0;
	let _drawToken = 0;
	let fSelecting = false;
	let fUploading = false;
	let fPrvUploading = false;
	let fPreviewing = false;
	let fRotateing = false;
	let prvImg = '';
	let prvImgData: any = null;
	let prvImgTmp: any = null;
	let target: any = null;
	let prvX = 0;
	let prvY = 0;
	let prvWidth = 0;
	let prvHeight = 0;
	let rtn: any = undefined;
	let resizeHandle: any = null;
	let touch0: any = null;
	let touch1: any = null;
	let fgDistance = 0;

	// created（保持 Options API 时期的初始化时序：setup 阶段即执行）
	qlty = parseInt(props.quality as any) || 0.9;
	letRotate = (props.canRotate === false || props.inner === true) ? 0 : 1;
	letScale = props.canScale === false ? 0 : 1;
	letChangeSize.value = props.canChangeSize;
	isin = props.inner === true ? 1 : 0;
	indx = props.index || undefined;
	mnScale = props.minScale || 0.3;
	mxScale = props.maxScale || 4;
	noBar = props.noTab === true ? 1 : 0;
	stc = props.stretch;
	lck = props.lock;
	if (isin) {
		btnWidth.value = '24%';
		btnDsp.value = 'none';
	} else {
		btnWidth.value = '19%';
		btnDsp.value = 'flex';
	}

	if (noBar) {
		moreHeight = 0;
		windowResize();
	} else {
		uni.showTabBar({
			complete: (res: any) => {
				moreHeight = (res.errMsg === 'showTabBar:ok') ? 50 : 0;
				windowResize();
			}
		});
	}

	onMounted(() => {
		initCanvasRefs(true);
	});

	async function initCanvasRefs(force = false) {
		await nextTick();
		const avatarCanvasRef = avatarCanvas.value;
		const operCanvasRef = operCanvas.value;
		const prvCanvasRef = prvCanvas.value;
		if (!avatarCanvasRef || !operCanvasRef || !prvCanvasRef) return false;
		await Promise.all([
			avatarCanvasRef.initCanvas(force),
			operCanvasRef.initCanvas(force),
			prvCanvasRef.initCanvas(force)
		]);
		ctxCanvas = avatarCanvasRef;
		ctxCanvasOper = operCanvasRef;
		ctxCanvasPrv = prvCanvasRef;
		return true;
	}

	function windowResize() {
		const sysInfo: any = uni.getSystemInfoSync();
		platform = sysInfo.platform;
		pixelRatio = sysInfo.pixelRatio;
		windowWidth = sysInfo.windowWidth;
		safeAreaInsetsBottom.value = sysInfo.safeAreaInsets.bottom;
		// #ifdef H5
		drawTop = sysInfo.windowTop;
		windowHeight = sysInfo.windowHeight + sysInfo.windowBottom;
		cvsStyleHeight.value = windowHeight - tabHeight + 'px';
		// #endif
		// #ifdef APP-PLUS
		if (platform === 'android') {
			windowHeight = sysInfo.screenHeight + sysInfo.statusBarHeight;
			cvsStyleHeight.value = windowHeight - tabHeight + 'px';
		} else {
			windowHeight = sysInfo.windowHeight + moreHeight;
			cvsStyleHeight.value = windowHeight - tabHeight - safeAreaInsetsBottom.value + 6 + 'px';
		}
		// #endif
		// #ifdef MP
		windowHeight = sysInfo.windowHeight + moreHeight;
		cvsStyleHeight.value = windowHeight - tabHeight - safeAreaInsetsBottom.value - 2 + 'px';
		// #endif
		pxRatio = windowWidth / 750;

		expWidth.value && (expWidth.value = expWidth.value.indexOf('rpx') >= 0 ? parseInt(expWidth.value) * pxRatio : parseInt(expWidth.value));
		expHeight.value && (expHeight.value = expHeight.value.indexOf('rpx') >= 0 ? parseInt(expHeight.value) * pxRatio : parseInt(expHeight.value));

		if (styleDisplay.value === 'flex') {
			drawInit(true);
		}
		hideImg();
	}

	function select() {
		if (fSelecting) return;
		fSelecting = true;
		setTimeout(() => { fSelecting = false; }, 500);
		uni.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success: (r: any) => {
				uni.showLoading({ mask: true });
				imgPath = r.tempFilePaths[0];
				const selectedPath = imgPath;
				uni.getImageInfo({
					src: selectedPath,
					success: (res: any) => {
						imgWidth = res.width;
						imgHeight = res.height;
						path = selectedPath;
						if (!hasSel) {
							const style = selStyle.value || {};
							if (props.areaWidth && props.areaHeight) {
								let areaWidth = props.areaWidth.indexOf('rpx') >= 0 ? parseInt(props.areaWidth) * pxRatio : parseInt(props.areaWidth),
									areaHeight = props.areaHeight.indexOf('rpx') >= 0 ? parseInt(props.areaHeight) * pxRatio : parseInt(props.areaHeight);
								style.width = areaWidth + 'px';
								style.height = areaHeight + 'px';
								style.top = (windowHeight - areaHeight - tabHeight) / 2 + 'px';
								style.left = (windowWidth - areaWidth) / 2 + 'px';
							} else {
								uni.showModal({
									title: "裁剪框的宽或高没有设置",
									showCancel: false
								})
								return;
							}
							selStyle.value = style;
						}

						if (noBar) {
							drawInit(true);
						} else {
							uni.hideTabBar({
								complete: () => {
									drawInit(true);
								}
							});
						}
					},
					fail: () => {
						uni.showToast({
							title: "读取图片失败",
							duration: 2000,
						})
					},
					complete() {
						uni.hideLoading();
					}
				});
			},
			fail: () => {
				emit('cancel')
			}
		})
	}

	async function confirm() {
		if (fUploading) return;
		fUploading = true;
		setTimeout(() => { fUploading = false; }, 1000)

		const style = selStyle.value,
			x = parseInt(style.left),
			y = parseInt(style.top),
			width = parseInt(style.width),
			height = parseInt(style.height);
		let expW = expWidth.value || width;
		let expH = expHeight.value || height;

		// #ifdef H5
		expW = width;
		expH = height;
		// #endif

		uni.showLoading({ mask: true });
		styleDisplay.value = 'none';
		styleTop.value = '-10000px';
		hasSel = false;
		hideImg();
		await initCanvasRefs();
		ctxCanvas.toTempFilePath({
			x: x,
			y: y,
			width: width,
			height: height,
			destWidth: expW,
			destHeight: expH,
			fileType: 'png',
			quality: qlty,
			success: (res: any) => {
				const tempPath = res.tempFilePath;
				// #ifdef H5
				btop(tempPath).then(async (url: any) => {
					if (expWidth.value && expHeight.value) {
						const canvasRef = ctxCanvas;
						expW = expWidth.value,
							expH = expHeight.value;

						// 立即模式画布：清掉裁剪大图再画导出小图，防止透明像素透出底图
						canvasRef.clearRect(0, 0, windowWidth, windowHeight);
						await canvasRef.drawImage(url, 0, 0, expW, expH);
						canvasRef.draw(false, () => {
							canvasRef.toTempFilePath({
								x: 0,
								y: 0,
								width: expW,
								height: expH,
								destWidth: expW,
								destHeight: expH,
								fileType: 'png',
								quality: qlty,
								success: (out: any) => {
									const outPath = out.tempFilePath;
									btop(outPath).then((finalPath: any) => {
										emit("confirm", { avatar: imgSrc.value, path: finalPath, index: indx, data: rtn });
									});
								},
								fail: () => {
									uni.showToast({
										title: "导出图片失败",
										duration: 2000,
									})
								}
							});
						});
					} else {
						emit("confirm", { avatar: imgSrc.value, path: url, index: indx, data: rtn });
					}
				})
				// #endif
				// #ifndef H5
				emit("confirm", { avatar: imgSrc.value, path: tempPath, index: indx, data: rtn });
				// #endif
			},
			fail: () => {
				uni.showToast({
					title: "导出图片失败",
					duration: 2000,
				})
			},
			complete: () => {
				uni.hideLoading();
				noBar || uni.showTabBar();
			}
		});
	}

	// 预览模式下点击"确认"：将预览画布的裁剪结果导出
	async function prvUpload() {
		if (fPrvUploading) return;
		fPrvUploading = true;
		setTimeout(() => { fPrvUploading = false; }, 1000)

		const curX = prvX,
			curY = prvY,
			curWidth = prvWidth,
			curHeight = prvHeight;
		let expW = expWidth.value || curWidth;
		let expH = expHeight.value || curHeight;

		// #ifdef H5
		expW = curWidth;
		expH = curHeight;
		// #endif

		uni.showLoading({ mask: true });

		styleDisplay.value = 'none';
		styleTop.value = '-10000px';
		hasSel = false;
		hideImg();
		await initCanvasRefs();
		ctxCanvasPrv.toTempFilePath({
			x: curX,
			y: curY,
			width: curWidth,
			height: curHeight,
			destWidth: expW,
			destHeight: expH,
			fileType: 'png',
			quality: qlty,
			success: (res: any) => {
				const tempPath = res.tempFilePath;
				// #ifdef H5
				btop(tempPath).then(async (url: any) => {
					if (expWidth.value && expHeight.value) {
						const canvasRef = ctxCanvas;
						expW = expWidth.value,
							expH = expHeight.value;

						// 立即模式画布：清掉裁剪大图再画导出小图，防止透明像素透出底图
						canvasRef.clearRect(0, 0, windowWidth, windowHeight);
						await canvasRef.drawImage(url, 0, 0, expW, expH);
						canvasRef.draw(false, () => {
							canvasRef.toTempFilePath({
								x: 0,
								y: 0,
								width: expW,
								height: expH,
								destWidth: expW,
								destHeight: expH,
								fileType: 'png',
								quality: qlty,
								success: (out: any) => {
									const outPath = out.tempFilePath;
									btop(outPath).then((finalPath: any) => {
										emit("confirm", { avatar: imgSrc.value, path: finalPath, index: indx, data: rtn });
									});
								},
								fail: () => {
									uni.showToast({
										title: "导出图片失败",
										duration: 2000,
									})
								}
							});
						});
					} else {
						emit("confirm", { avatar: imgSrc.value, path: url, index: indx, data: rtn });
					}
				})
				// #endif
				// #ifndef H5
				emit("confirm", { avatar: imgSrc.value, path: tempPath, index: indx, data: rtn });
				// #endif
			},
			fail: () => {
				uni.showToast({
					title: "导出图片失败",
					duration: 2000,
				})
			},
			complete: () => {
				uni.hideLoading();
				noBar || uni.showTabBar();
			}
		});
	}

	async function drawInit(ini = false) {
		await initCanvasRefs();
		const allWidth = windowWidth,
			allHeight = windowHeight,
			imgW = imgWidth,
			imgH = imgHeight,
			imgRadio = imgW / imgH;
		let useW = allWidth - 40,
			useH = allHeight - tabHeight - 80;
		const selW = parseInt(selStyle.value.width),
			selH = parseInt(selStyle.value.height);

		fixWidth = 0;
		fixHeight = 0;
		lckWidth = 0;
		lckHeight = 0;
		switch (stc) {
			case 'x': fixWidth = 1; break;
			case 'y': fixHeight = 1; break;
			case 'long': if (imgRadio > 1) fixWidth = 1; else fixHeight = 1; break;
			case 'short': if (imgRadio > 1) fixHeight = 1; else fixWidth = 1; break;
			case 'longSel': if (selW > selH) fixWidth = 1; else fixHeight = 1; break;
			case 'shortSel': if (selW > selH) fixHeight = 1; else fixWidth = 1; break;
		}
		// lck 锁定裁剪框的宽/高调整方向：
		// 'x' 锁宽 / 'y' 锁高 / 'long'/'short' 按图片长短边 / 'longSel'/'shortSel' 按选择框长短边
		switch (lck) {
			case 'x': lckWidth = 1; break;
			case 'y': lckHeight = 1; break;
			case 'long': if (imgRadio > 1) lckWidth = 1; else lckHeight = 1; break;
			case 'short': if (imgRadio > 1) lckHeight = 1; else lckWidth = 1; break;
			case 'longSel': if (selW > selH) lckWidth = 1; else lckHeight = 1; break;
			case 'shortSel': if (selW > selH) lckHeight = 1; else lckWidth = 1; break;
		}
		if (fixWidth) {
			useW = selW;
			useH = useW / imgRadio;
		} else if (fixHeight) {
			useH = selH;
			useW = useH * imgRadio;
		} else if (imgRadio < 1) {
			if (imgH < useH) {
				useW = imgW;
				useH = imgH;
			} else {
				useH = useH;
				useW = useH * imgRadio;
			}
		} else {
			if (imgW < useW) {
				useW = imgW;
				useH = imgH;
			} else {
				useW = useW;
				useH = useW / imgRadio;
			}
		}
		if (isin) {
			scaleWidth = 0;
			scaleHeight = 0;
			if (useW < selW) {
				useW = selW;
				useH = useW / imgRadio;
				lckHeight = 0;
			}
			if (useH < selH) {
				useH = selH;
				useW = useH * imgRadio;
				lckWidth = 0;
			}
		}

		scaleSize = 1;
		rotateDeg = 0;
		posWidth = (allWidth - useW) / 2;
		posHeight = (allHeight - useH - tabHeight) / 2;
		useWidth = useW;
		useHeight = useH;

		const style = selStyle.value,
			left = parseInt(style.left),
			top = parseInt(style.top),
			width = parseInt(style.width),
			height = parseInt(style.height),
			canvasRef = ctxCanvas,
			canvasOperRef = ctxCanvasOper;

		// H5/小程序 type=2d 为立即模式画布，重绘遮罩前须清掉上一帧，否则拖控制点时遮罩残留
		canvasOperRef.clearRect(0, 0, windowWidth, windowHeight);

		canvasOperRef.setLineWidth(3);
		canvasOperRef.setStrokeStyle('grey');
		canvasOperRef.setGlobalAlpha(0.4);
		canvasOperRef.setFillStyle('black');
		canvasOperRef.strokeRect(left, top, width, height);
		canvasOperRef.fillRect(0, 0, windowWidth, top);
		canvasOperRef.fillRect(0, top, left, height);
		canvasOperRef.fillRect(0, top + height, windowWidth, windowHeight - height - top - tabHeight);
		canvasOperRef.fillRect(left + width, top, windowWidth - width - left, height);
		canvasOperRef.setStrokeStyle('red');
		canvasOperRef.moveTo(left + 20, top); canvasOperRef.lineTo(left, top); canvasOperRef.lineTo(left, top + 20);
		canvasOperRef.moveTo(left + width - 20, top); canvasOperRef.lineTo(left + width, top); canvasOperRef.lineTo(left + width, top + 20);
		canvasOperRef.moveTo(left + 20, top + height); canvasOperRef.lineTo(left, top + height); canvasOperRef.lineTo(left, top + height - 20);
		canvasOperRef.moveTo(left + width - 20, top + height); canvasOperRef.lineTo(left + width, top + height); canvasOperRef.lineTo(left + width, top + height - 20);

		// 四角控制点（canChangeSize 时可拖拽调整裁剪框）
		const controlPointSize = 10;
		canvasOperRef.setFillStyle('white');
		canvasOperRef.setStrokeStyle('grey');
		canvasOperRef.setLineWidth(1);
		canvasOperRef.fillRect(left - controlPointSize / 2, top - controlPointSize / 2, controlPointSize, controlPointSize);
		canvasOperRef.strokeRect(left - controlPointSize / 2, top - controlPointSize / 2, controlPointSize, controlPointSize);
		canvasOperRef.fillRect(left + width - controlPointSize / 2, top - controlPointSize / 2, controlPointSize, controlPointSize);
		canvasOperRef.strokeRect(left + width - controlPointSize / 2, top - controlPointSize / 2, controlPointSize, controlPointSize);
		canvasOperRef.fillRect(left - controlPointSize / 2, top + height - controlPointSize / 2, controlPointSize, controlPointSize);
		canvasOperRef.strokeRect(left - controlPointSize / 2, top + height - controlPointSize / 2, controlPointSize, controlPointSize);
		canvasOperRef.fillRect(left + width - controlPointSize / 2, top + height - controlPointSize / 2, controlPointSize, controlPointSize);
		canvasOperRef.strokeRect(left + width - controlPointSize / 2, top + height - controlPointSize / 2, controlPointSize, controlPointSize);

		canvasOperRef.stroke();

		canvasOperRef.draw(false, () => {
			if (ini) {
				styleDisplay.value = 'flex';
				// #ifdef H5
				styleTop.value = drawTop + 'px';
				// #endif
				// #ifndef H5
				styleTop.value = '0';
				// #endif
				if (props.fillColor && props.fillColor !== 'transparent') {
					canvasRef.setFillStyle(props.fillColor);
				}
				drawImage();
			}
		});

		emit("avtinit");
	}

	async function drawImage() {
		await initCanvasRefs();
		const tm_now = Date.now();
		if (tm_now - drawTm < 20) return;
		drawTm = tm_now;
		const canvasRef = ctxCanvas;
		// 图片对象先取回（dd-canvas 内部有缓存，二次绘制走同步路径）；
		// 加载期间若新帧已触发（token 失配）则丢弃本帧，避免旧帧续体把图片画回旧位置
		_drawToken = (_drawToken || 0) + 1;
		const token = _drawToken;
		const image = await canvasRef.loadImage(imgPath).catch(() => null);
		if (!image || token !== _drawToken) return;
		// H5/小程序 type=2d 为立即模式画布，ctx.draw() 在 dd-canvas 内是 no-op，
		// 上一帧像素不会自动清空——拖动残影的根因，每帧必须先 clearRect
		canvasRef.clearRect(0, 0, windowWidth, windowHeight);
		if (props.fillColor && props.fillColor !== 'transparent') {
			canvasRef.fillRect(0, 0, windowWidth, windowHeight - tabHeight);
		}
		canvasRef.save();
		canvasRef.translate(posWidth + useWidth / 2, posHeight + useHeight / 2);
		canvasRef.scale(scaleSize, scaleSize);
		canvasRef.rotate(rotateDeg * Math.PI / 180);
		canvasRef.drawImage(image, -useWidth / 2, -useHeight / 2, useWidth, useHeight);
		canvasRef.restore();
		canvasRef.draw(false);
	}

	function hideImg() {
		prvImg = '';
		prvTop.value = '-10000px';
		showOper.value = true;
		prvImgData = null;
		target = null;
	}

	function close() {
		styleDisplay.value = 'none';
		styleTop.value = '-10000px';
		hasSel = false;
		hideImg();
		noBar || uni.showTabBar();
		emit('cancel');
	}

	async function preview() {
		if (fPreviewing) return;
		fPreviewing = true;
		setTimeout(() => { fPreviewing = false; }, 1000);
		const style = selStyle.value,
			x = parseInt(style.left),
			y = parseInt(style.top),
			width = parseInt(style.width),
			height = parseInt(style.height);

		uni.showLoading({ mask: true });
		await initCanvasRefs();
		ctxCanvas.toTempFilePath({
			x: x,
			y: y,
			width: width,
			height: height,
			fileType: 'png',
			quality: qlty,
			success: async (res: any) => {
				prvImgTmp = res.tempFilePath;

				const canvasPrvRef = ctxCanvasPrv;
				let pX = windowWidth,
					pY = parseInt(cvsStyleHeight.value),
					pW = parseInt(selStyle.value.width),
					pH = parseInt(selStyle.value.height),
					useW = pX - 40,
					useH = pY - 80,
					radio = useW / pW,
					rHeight = pH * radio;
				// 立即模式画布：清掉上一次预览的残影再画新帧
				canvasPrvRef.clearRect(0, 0, windowWidth, windowHeight);
				if (rHeight < useH) {
					pW = useW;
					pH = rHeight;
				} else {
					radio = useH / pH;
					pW *= radio;
					pH = useH;
				}
				if (props.fillColor && props.fillColor !== 'transparent') {
					canvasPrvRef.setFillStyle(props.fillColor);
					canvasPrvRef.fillRect(0, 0, pX, pY);
					canvasPrvRef.fillRect(x, y, width, height);
				}
				prvX = pX = (pX - pW) / 2;
				prvY = pY = (pY - pH) / 2;
				prvWidth = pW;
				prvHeight = pH;
				await canvasPrvRef.drawImage(prvImgTmp, pX, pY, pW, pH);
				canvasPrvRef.draw(false, () => {
					// #ifdef H5
					btop(prvImgTmp).then(() => {
						showOper.value = false;
						prvTop.value = drawTop + 'px';
					})
					// #endif
					// #ifndef H5
					if (platform != 'android') {
						showOper.value = false;
					}
					prvTop.value = '0';
					// #endif
				});
			},
			fail: () => {
				uni.showToast({
					title: "生成预览失败",
					duration: 2000,
				})
			},
			complete: () => {
				uni.hideLoading();
			}
		});
	}

	function chooseImage(index: any = undefined, params: any = undefined, data: any = undefined) {
		if (params) {
			let areaWidth = params.areaWidth || props.areaWidth,
				areaHeight = params.areaHeight || props.areaHeight,
				expW = params.exportWidth || props.exportWidth,
				expH = params.exportHeight || props.exportHeight,
				quality = params.quality,
				canRotate = params.canRotate,
				canScale = params.canScale,
				canChangeSize = params.canChangeSize,
				minScale = params.minScale,
				maxScale = params.maxScale,
				stretch = params.stretch,
				inner = params.inner,
				lock = params.lock;

			expW && (expWidth.value = expW.indexOf('rpx') >= 0 ? parseInt(expW) * pxRatio : parseInt(expW));
			expH && (expHeight.value = expH.indexOf('rpx') >= 0 ? parseInt(expH) * pxRatio : parseInt(expH));
			isin = inner === true ? 1 : 0;
			letRotate = (canRotate === false || isin) ? 0 : 1;
			letScale = canScale === false ? 0 : 1;
			letChangeSize.value = canChangeSize || false;
			qlty = parseInt(quality) || 0.9;
			mnScale = minScale || 0.3;
			mxScale = maxScale || 4;
			stc = stretch;
			lck = lock;
			if (isin) {
				btnWidth.value = '24%';
				btnDsp.value = 'none';
			} else {
				btnWidth.value = '19%';
				btnDsp.value = 'flex';
			}

			if (areaWidth && areaHeight) {
				areaWidth = areaWidth.indexOf('rpx') >= 0 ? parseInt(areaWidth) * pxRatio : parseInt(areaWidth);
				areaHeight = areaHeight.indexOf('rpx') >= 0 ? parseInt(areaHeight) * pxRatio : parseInt(areaHeight);
				selStyle.value.width = areaWidth + 'px';
				selStyle.value.height = areaHeight + 'px';
				selStyle.value.top = (windowHeight - areaHeight - tabHeight) / 2 + 'px';
				selStyle.value.left = (windowWidth - areaWidth) / 2 + 'px';
				hasSel = true;
			}
		}
		rtn = data;
		indx = index;
		select();
	}

	function rotate() {
		// #ifdef APP-PLUS
		if (platform === 'android') {
			if (fRotateing) return;
			fRotateing = true;
			setTimeout(() => { fRotateing = false; }, 500);
		}
		// #endif

		rotateDeg += 90 - rotateDeg % 90;
		drawImage();
	}

	function start(e: any) {
		const touches = e.touches,
			t0 = touches[0],
			t1 = touches[1];

		touch0 = t0;
		touch1 = t1;

		if (t1) {
			const x = t1.x - t0.x,
				y = t1.y - t0.y;
			fgDistance = Math.sqrt(x * x + y * y);
		} else if (letChangeSize.value) {
			// 单指落在四角控制点附近时进入裁剪框调整模式
			const controlPointSize = 20;
			const x = t0.x;
			const y = t0.y;
			const style = selStyle.value;
			const left = parseInt(style.left);
			const top = parseInt(style.top);
			const width = parseInt(style.width);
			const height = parseInt(style.height);

			if (Math.abs(x - left) < controlPointSize && Math.abs(y - top) < controlPointSize) {
				resizeHandle = 'top-left';
			} else if (Math.abs(x - (left + width)) < controlPointSize && Math.abs(y - top) < controlPointSize) {
				resizeHandle = 'top-right';
			} else if (Math.abs(x - left) < controlPointSize && Math.abs(y - (top + height)) < controlPointSize) {
				resizeHandle = 'bottom-left';
			} else if (Math.abs(x - (left + width)) < controlPointSize && Math.abs(y - (top + height)) < controlPointSize) {
				resizeHandle = 'bottom-right';
			} else {
				resizeHandle = null;
			}
		} else {
			resizeHandle = null;
		}
	}

	function move(e: any) {
		const touches = e.touches,
			t0 = touches[0],
			t1 = touches[1];

		if (t1) {
			let x = t1.x - t0.x,
				y = t1.y - t0.y;
			const nextDistance = Math.sqrt(x * x + y * y),
				deltaScale = 0.005 * (nextDistance - fgDistance),
				beScaleSize = scaleSize + deltaScale;

			do {
				if (!letScale) break;
				if (beScaleSize < mnScale) break;
				if (beScaleSize > mxScale) break;
				if (isin) {
					const imgW = useWidth * beScaleSize,
						imgH = useHeight * beScaleSize,
						rx0 = posWidth + useWidth / 2,
						ry0 = posHeight + useHeight / 2,
						l = rx0 - imgW / 2, t = ry0 - imgH / 2,
						r = l + imgW, b = t + imgH,
						left = parseInt(selStyle.value.left),
						top = parseInt(selStyle.value.top),
						width = parseInt(selStyle.value.width),
						height = parseInt(selStyle.value.height);
					if (left < l || left + width > r || top < t || top + height > b) break;
					scaleWidth = (useWidth - imgW) / 2;
					scaleHeight = (useHeight - imgH) / 2;
				}

				scaleSize = beScaleSize;
			} while (0);
			fgDistance = nextDistance;

			if (t1.x !== t0.x && letRotate) {
				x = (touch1.y - touch0.y) / (touch1.x - touch0.x);
				y = (t1.y - t0.y) / (t1.x - t0.x);
				rotateDeg += Math.atan((y - x) / (1 + x * y)) * 180 / Math.PI;
				touch0 = t0;
				touch1 = t1;
			}

			drawImage();
		} else if (touch0) {
			if (resizeHandle && letChangeSize.value) {
				// 拖拽控制点调整裁剪框
				const style = { ...selStyle.value };
				const left = parseInt(style.left);
				const top = parseInt(style.top);
				const width = parseInt(style.width);
				const height = parseInt(style.height);
				const minWidth = 50;
				const minHeight = 50;

				switch (resizeHandle) {
					case 'top-left':
						style.left = t0.x + 'px';
						style.top = t0.y + 'px';
						style.width = (left + width - t0.x) + 'px';
						style.height = (top + height - t0.y) + 'px';
						break;
					case 'top-right':
						style.top = t0.y + 'px';
						style.width = (t0.x - left) + 'px';
						style.height = (top + height - t0.y) + 'px';
						break;
					case 'bottom-left':
						style.left = t0.x + 'px';
						style.width = (left + width - t0.x) + 'px';
						style.height = (t0.y - top) + 'px';
						break;
					case 'bottom-right':
						style.width = (t0.x - left) + 'px';
						style.height = (t0.y - top) + 'px';
						break;
				}

				// 约束裁剪框：最小尺寸、屏幕边界，inner 模式下再限制在图片内
				let nl = parseInt(style.left);
				let nt = parseInt(style.top);
				let nw = parseInt(style.width);
				let nh = parseInt(style.height);

				if (nl < 0) nl = 0;
				if (nt < 0) nt = 0;
				if (nl + nw > windowWidth) nw = windowWidth - nl;
				if (nt + nh > windowHeight - tabHeight) nh = windowHeight - tabHeight - nt;

				if (isin) {
					const imgW = useWidth * scaleSize;
					const imgH = useHeight * scaleSize;
					const rx0 = posWidth + useWidth / 2;
					const ry0 = posHeight + useHeight / 2;
					const imgL = rx0 - imgW / 2;
					const imgT = ry0 - imgH / 2;
					const imgR = imgL + imgW;
					const imgB = imgT + imgH;
					if (nl < imgL) nl = imgL;
					if (nt < imgT) nt = imgT;
					if (nl + nw > imgR) nw = imgR - nl;
					if (nt + nh > imgB) nh = imgB - nt;
				}

				if (nw >= minWidth && nh >= minHeight) {
					style.left = nl + 'px';
					style.top = nt + 'px';
					style.width = nw + 'px';
					style.height = nh + 'px';
					selStyle.value = style;
					drawInit();
				}
			} else {
				// 单指拖动图片
				let x = t0.x - touch0.x,
					y = t0.y - touch0.y,
					beX = posWidth + x,
					beY = posHeight + y;
				if (isin) {
					const imgW = useWidth * scaleSize,
						imgH = useHeight * scaleSize,
						rx0 = beX + useWidth / 2,
						ry0 = beY + useHeight / 2,
						l = rx0 - imgW / 2, t = ry0 - imgH / 2,
						r = l + imgW, b = t + imgH,
						left = parseInt(selStyle.value.left),
						top = parseInt(selStyle.value.top),
						width = parseInt(selStyle.value.width),
						height = parseInt(selStyle.value.height);
					if (!lckWidth && Math.abs(x) < 100) {
						if (left >= l && left + width <= r) {
							posWidth = beX;
						} else if (left < l) {
							posWidth = left - scaleWidth;
						} else if (left + width > r) {
							posWidth = left - (imgW - width) - scaleWidth;
						}
					}
					if (!lckHeight && Math.abs(y) < 100) {
						if (top >= t && top + height <= b) {
							posHeight = beY;
						} else if (top < t) {
							posHeight = top - scaleHeight;
						} else if (top + height > b) {
							posHeight = top - (imgH - height) - scaleHeight;
						}
					}
				} else {
					if (Math.abs(x) < 100 && !lckWidth) posWidth = beX;
					if (Math.abs(y) < 100 && !lckHeight) posHeight = beY;
				}

				touch0 = t0;
				drawImage();
			}
		}
	}

	function end(e: any) {
		const touches = e.touches,
			t0 = touches && touches[0];
		if (t0) {
			touch0 = t0;
		} else {
			touch0 = null;
			touch1 = null;
			resizeHandle = null;
		}
	}

	async function getImgData(): Promise<any> {
		await initCanvasRefs();
		return new Promise((resolve, reject) => {
			let x = prvX,
				y = prvY,
				width = prvWidth,
				height = prvHeight;
			// #ifdef APP-PLUS||H5
			x *= pixelRatio;
			y *= pixelRatio;
			width *= pixelRatio;
			height *= pixelRatio;
			// #endif
			ctxCanvasPrv.getImageData({
				x: x,
				y: y,
				width: width,
				height: height,
				success(res: any) {
					resolve(res.data);
				},
				fail(err: any) {
					reject(err);
				}
			});
		});
	}

	// 预览模式饱和度滑杆：HSL 调整后 putImageData 回写预览画布
	async function colorChange(e: any) {
		const tm_now = Date.now();
		if (tm_now - prvTm < 100) return;
		prvTm = tm_now;

		uni.showLoading({ mask: true });

		if (!prvImgData) {
			if (!(prvImgData = await getImgData().catch(() => {
				uni.showToast({
					title: "读取图片失败",
					duration: 2000,
				})
			}))) return;
			target = new Uint8ClampedArray(prvImgData.length);
		}

		const data = prvImgData;
		let tar = target,
			i = e.detail.value,
			r: any, g: any, b: any, a: any, h: any, s: any, l: any, d: any, p: any, q: any, min: any, max: any, hK: any, tR: any, tG: any, tB: any;

		if (i === 0) {
			tar = data;
		} else {
			i = (i + 100) / 200;
			if (i < 0.005) i = 0;
			if (i > 0.995) i = 1;
			for (let n = data.length - 1; n >= 0; n -= 4) {
				r = data[n - 3] / 255;
				g = data[n - 2] / 255;
				b = data[n - 1] / 255;
				max = Math.max(r, g, b);
				min = Math.min(r, g, b);
				d = max - min;
				if (max === min) {
					h = 0;
				} else if (max === r && g >= b) {
					h = 60 * ((g - b) / d);
				} else if (max === r && g < b) {
					h = 60 * ((g - b) / d) + 360;
				} else if (max === g) {
					h = 60 * ((b - r) / d) + 120;
				} else if (max === b) {
					h = 60 * ((r - g) / d) + 240;
				}
				l = (max + min) / 2;
				if (l === 0 || max === min) {
					s = 0;
				} else if (0 < l && l <= 0.5) {
					s = d / (2 * l);
				} else if (l > 0.5) {
					s = d / (2 - 2 * l);
				}
				data[n] && (a = data[n]);

				if (i < 0.5) {
					s = s * i / 0.5;
				} else if (i > 0.5) {
					s = 2 * s + 2 * i - (s * i / 0.5) - 1;
				}

				if (s === 0) {
					r = g = b = Math.round(l * 255);
				} else {
					if (l < 0.5) {
						q = l * (1 + s);
					} else if (l >= 0.5) {
						q = l + s - (l * s);
					}
					p = 2 * l - q;
					hK = h / 360;
					tR = hK + 1 / 3;
					tG = hK;
					tB = hK - 1 / 3;
					const correctRGB = (t: any) => {
						if (t < 0) {
							return t + 1.0;
						}
						if (t > 1) {
							return t - 1.0;
						}
						return t;
					};
					const createRGB = (t: any) => {
						if (t < (1 / 6)) {
							return p + ((q - p) * 6 * t);
						} else if (t >= (1 / 6) && t < (1 / 2)) {
							return q;
						} else if (t >= (1 / 2) && t < (2 / 3)) {
							return p + ((q - p) * 6 * ((2 / 3) - t));
						}
						return p;
					};
					r = tR = Math.round(createRGB(correctRGB(tR)) * 255);
					g = tG = Math.round(createRGB(correctRGB(tG)) * 255);
					b = tB = Math.round(createRGB(correctRGB(tB)) * 255);
				}
				a && (tar[n] = a);
				tar[n - 3] = r;
				tar[n - 2] = g;
				tar[n - 1] = b;
			}
		}
		let pX = prvX,
			pY = prvY,
			pW = prvWidth,
			pH = prvHeight;

		if (props.fillColor && props.fillColor !== 'transparent') {
			ctxCanvasPrv.setFillStyle(props.fillColor);
			ctxCanvasPrv.fillRect(pX, pY, pW, pH);
		}
		ctxCanvasPrv.draw(true);

		// #ifdef APP-PLUS||H5
		pX *= pixelRatio;
		pY *= pixelRatio;
		pW *= pixelRatio;
		pH *= pixelRatio;
		// #endif
		ctxCanvasPrv.putImageData({
			x: pX,
			y: pY,
			width: pW,
			height: pH,
			data: tar,
			fail() {
				uni.showToast({
					title: "导出图片失败",
					duration: 2000
				})
			},
			complete() {
				uni.hideLoading();
			}
		});
	}

	// H5 专用：base64 转 blob URL，规避部分浏览器 canvas 跨域限制
	function btop(base64: string): any {
		// #ifdef H5
		return new Promise(function (resolve) {
			const arr = base64.split(','),
				mime = arr[0].match(/:(.*?);/)![1],
				bstr = atob(arr[1]),
				u8arr = new Uint8Array(bstr.length);
			let n = bstr.length;
			while (n--) {
				u8arr[n] = bstr.charCodeAt(n);
			}
			return resolve((window.URL || (window as any).webkitURL).createObjectURL(new Blob([u8arr], { type: mime })));
		});
		// #endif
	}

	defineExpose({
		instanceId,
		cvsStyleHeight,
		styleDisplay,
		styleTop,
		prvTop,
		selStyle,
		showOper,
		imgSrc,
		btnWidth,
		btnDsp,
		expWidth,
		expHeight,
		letChangeSize,
		safeAreaInsetsBottom,
		zc,
		zcOper,
		zcPrv,
		zcBar,
		initCanvasRefs,
		windowResize,
		select,
		confirm,
		prvUpload,
		drawInit,
		drawImage,
		hideImg,
		close,
		preview,
		chooseImage,
		rotate,
		start,
		move,
		end,
		getImgData,
		colorChange,
		btop
	});
</script>

<style lang="scss" scoped>
	@import '../../scss/variables';
	@import '../../scss/mixins';
	.dd-cropper {
		.dd-cropper__avatar-canvas {
			display: flex;
			position: fixed !important;
			background: $dd-color-black;
			left: 0;
			/* z-index 由模板注入（libs/config/zIndex.js cropper 档） */
			width: 100%;
		}

		.dd-cropper__oper-canvas {
			display: flex;
			position: fixed !important;
			left: 0;
			width: 100%;
		}

		.dd-cropper__preview-canvas {
			display: flex;
			position: fixed !important;
			background: $dd-color-black;
			left: 0;
			width: 100%;
		}

		.dd-cropper__oper-wrapper {
			height: 100rpx;
			position: fixed !important;
			box-sizing: border-box;
			border: 1px solid $dd-neutral-50;
			background: $dd-color-white;
			width: 100%;
			left: 0;
			bottom: 0;
			flex-direction: row;
		}

		.dd-cropper__oper {
			display: flex;
			flex-direction: column;
			justify-content: center;
			padding: 10rpx 20rpx;
			width: 100%;
			height: 100%;
			box-sizing: border-box;
			align-self: center;
		}

		.dd-cropper__btn-wrapper {
			display: flex;
			flex-direction: row;
			/* #ifndef H5 */
			flex-grow: 1;
			/* #endif */
			/* #ifdef H5 */
			height: 100rpx;
			/* #endif */
			justify-content: space-between;
		}

		.dd-cropper__btn-wrapper view {
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: $dd-font-size-h4;
			color: $dd-neutral-700;
			border: 1px solid $dd-neutral-50;
			border-radius: 6%;
		}

		.dd-cropper__btn-hover {
			background: $dd-neutral-50;
			border-radius: 6%;
		}

		.dd-cropper__clear-wrapper {
			display: flex;
			flex-direction: row;
			flex-grow: 1;
		}

		.dd-cropper__clear-wrapper view {
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: $dd-font-size-h4;
			color: $dd-neutral-700;
			border: 1px solid $dd-neutral-50;
			border-radius: 6%;
		}

		.dd-cropper__slider {
			flex-grow: 1;
		}
	}
</style>
