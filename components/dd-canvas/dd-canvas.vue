<template>
    <view
        class="dd-canvas"
        :id="rootId"
        :style="{
            width: useRootHeightAndWidth ? '100%' : actualWidth + unit,
            height: useRootHeightAndWidth ? '100%' : actualHeight + unit
        }"
    >
        <!-- #ifdef MP || H5 -->
        <canvas
            class="dd-canvas__canvas"
            :id="canvasId"
            :canvas-id="canvasId"
            type="2d"
            :disable-scroll="disableScroll"
            :style="{ width: actualWidth + unit, height: actualHeight + unit }"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
        />
        <!-- #endif -->

        <!-- #ifdef APP-PLUS || APP-HARMONY -->
        <!-- #ifndef APP-NVUE -->
        <canvas
            class="dd-canvas__canvas"
            :id="canvasId"
            :canvas-id="canvasId"
            :disable-scroll="disableScroll"
            :style="{ width: actualWidth + unit, height: actualHeight + unit }"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
        />
        <!-- #endif -->
        <!-- #endif -->

        <!-- #ifdef APP-NVUE -->
        <web-view
            class="dd-canvas__canvas"
            ref="web"
            src="/static/app-plus/up-canvas/local.html"
            :style="{ width: actualWidth + unit, height: actualHeight + unit }"
            @onPostMessage="onWebViewMessage"
        />
        <!-- #endif -->
    </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
// #ifdef APP-NVUE
// @ts-ignore NVUE 画布桥接模块由宿主工程提供（仅条件编译进 APP-NVUE 包）
import { createWebViewCanvasBridge, createWebViewCanvasContext } from '../../libs/util/app-nvue-webview-canvas.js';
// #endif

interface Props {
    canvasId?: string;
    width?: string | number;
    height?: string | number;
    unit?: string;
    useRootHeightAndWidth?: boolean;
    bgColor?: string;
    disableScroll?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    canvasId: () => `dd-canvas${Math.floor(Math.random() * 1000000)}`,
    width: 300,
    height: 300,
    unit: 'px',
    useRootHeightAndWidth: false,
    bgColor: '#ffffff',
    disableScroll: false
});

const emit = defineEmits<{
    (e: 'ready', val: { width: number; height: number }): void;
    (e: 'touchstart', val: any): void;
    (e: 'touchmove', val: any): void;
    (e: 'touchend', val: any): void;
}>();

const instance = getCurrentInstance();
const proxy = instance?.proxy;

const rootId = ref(`dd-canvas-root-${Math.floor(Math.random() * 1000000)}`);
const ctx = ref<any>(null);
const fontSize = ref(12);
const fontFamily = ref('sans-serif');
const fontWeight = ref('normal');
const dpr = ref(1);
// APP-NVUE 下的 web-view 画布桥接载体
const web = ref<any>(null);

// 以下为命令式画布状态，与 Options API 时期一致：不走响应式，避免高频重绘的代理开销
let _canvasNode: any = null;
let _selectorResult: any = null;
let _canvasElement: any = null;
const _imageCache: Record<string, any> = Object.create(null);
const _imageDataCache: Record<string, any> = Object.create(null);
let _isNvue = false;
let _harmonyMeasureUnavailable = false;
let _initPromise: any = null;
let _webViewBridge: any = null;
let _webViewContext: any = null;
let _webViewInitSignature: any = null;
let _webViewSessionId: any = null;

function parseSize(value: any): number {
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value !== 'string') {
        return 0;
    }
    if (value.endsWith('rpx') || value.endsWith('upx')) {
        return uni.upx2px(parseFloat(value));
    }
    if (value.endsWith('px')) {
        return parseFloat(value) || 0;
    }
    return parseFloat(value) || 0;
}

const widthLocal = ref(parseSize(props.width));
const heightLocal = ref(parseSize(props.height));

const actualWidth = computed(() => {
    return props.useRootHeightAndWidth ? widthLocal.value : parseSize(props.width);
});

const actualHeight = computed(() => {
    return props.useRootHeightAndWidth ? heightLocal.value : parseSize(props.height);
});

watch(() => props.width, () => {
    refresh();
});

watch(() => props.height, () => {
    refresh();
});

watch(() => props.bgColor, () => {
    clearCanvas();
});

onMounted(() => {
    nextTick(() => {
        initCanvas();
    });
});

onUnmounted(() => {
    if (_webViewBridge) {
        _webViewBridge.destroy();
    }
    _webViewBridge = null;
    _webViewContext = null;
    ctx.value = null;
});

function onTouchStart(event: any) {
    emit('touchstart', event);
}

function onTouchMove(event: any) {
    emit('touchmove', event);
}

function onTouchEnd(event: any) {
    emit('touchend', event);
}

function onWebViewMessage(event: any) {
    if (_webViewBridge) {
        _webViewBridge.handleMessage(event);
    }
}

function onWebViewTouch(message: any) {
    const eventType = message.eventType;
    if (!['touchstart', 'touchmove', 'touchend'].includes(eventType)) return;
    (emit as any)(eventType, {
        type: eventType,
        detail: {
            x: message.x,
            y: message.y
        },
        touches: message.touches || [],
        changedTouches: message.changedTouches || [],
        canvasWidth: message.canvasWidth,
        canvasHeight: message.canvasHeight
    });
}

function getCanvasNode(id = props.canvasId, isCanvas = true): Promise<any> {
    return new Promise((resolve) => {
        try {
            uni.createSelectorQuery()
                .in(proxy)
                .select(`#${id}`)
                .fields(
                    {
                        node: isCanvas,
                        size: true
                    },
                    (res: any) => {
                        // #ifdef APP-PLUS || APP-HARMONY
                        resolve(res || {
                            width: actualWidth.value,
                            height: actualHeight.value
                        });
                        return;
                        // #endif

                        resolve(res || false);
                    }
                )
                .exec();
        } catch (error) {
            console.error('获取画布节点失败:', error);
            resolve(false);
        }
    });
}

function getCanvasElement() {
    return _canvasElement || null;
}

function getRawContext() {
    return ctx.value;
}

function getCanvasContext(): any {
    // #ifdef APP-NVUE
    return _webViewContext;
    // #endif

    // #ifdef APP-PLUS || APP-HARMONY
    return uni.createCanvasContext(props.canvasId, proxy);
    // #endif

    // #ifdef MP || H5
    return _canvasElement && typeof _canvasElement.getContext === 'function'
        ? _canvasElement.getContext('2d')
        : null;
    // #endif
}

async function setNewSize() {
    const rootNode = await getCanvasNode(rootId.value, false);
    if (!rootNode) {
        return;
    }
    if (rootNode.width) {
        widthLocal.value = rootNode.width;
    }
    if (rootNode.height) {
        heightLocal.value = rootNode.height;
    }
}

async function initCanvas(force = false) {
    if (_initPromise) {
        return _initPromise;
    }

    const initPromise = _initializeCanvas(force);
    _initPromise = initPromise;

    try {
        return await initPromise;
    } finally {
        if (_initPromise === initPromise) {
            _initPromise = null;
        }
    }
}

async function _initializeCanvas(force = false) {
    try {
        if (props.useRootHeightAndWidth) {
            await setNewSize();
        }
        // #ifdef APP-NVUE
        if (typeof createWebViewCanvasBridge === 'function') {
            return await _initializeWebViewCanvas(force);
        }
        // #endif

        if (ctx.value && !force) {
            emit('ready', {
                width: actualWidth.value,
                height: actualHeight.value
            });
            return true;
        }

        _canvasNode = await getCanvasNode(props.canvasId);
        if (!_canvasNode) {
            return false;
        }

        _selectorResult = _canvasNode;
        _canvasElement = _isNvue
            ? _canvasNode
            : (_canvasNode.node || null);
        const systemInfo: any = uni.getSystemInfoSync() || {};
        const pixelRatio = Number(systemInfo.pixelRatio) || 1;
        // 微信开发者工具的模拟器预览通常按高密度屏幕缩放，至少使用 2 倍 backing store。
        dpr.value = systemInfo.platform === 'devtools'
            ? Math.max(pixelRatio, 2)
            : pixelRatio;

        // #ifdef MP
        if (_canvasElement) {
            _canvasElement.width = Math.ceil(actualWidth.value * dpr.value);
            _canvasElement.height = Math.ceil(actualHeight.value * dpr.value);
        }
        // #endif

        ctx.value = getCanvasContext();
        if (!ctx.value) {
            return false;
        }

        // #ifdef MP
        if (typeof ctx.value.setTransform === 'function') {
            ctx.value.setTransform(dpr.value, 0, 0, dpr.value, 0, 0);
        } else if (typeof ctx.value.scale === 'function') {
            ctx.value.scale(dpr.value, dpr.value);
        }
        // #endif

        applyFont();
        clearCanvas();
        emit('ready', {
            width: actualWidth.value,
            height: actualHeight.value
        });
        return true;
    } catch (error) {
        console.error('初始化Canvas失败:', error);
        return false;
    }
}

async function _initializeWebViewCanvas(force = false) {
    _isNvue = true;
    const systemInfo: any = uni.getSystemInfoSync() || {};
    dpr.value = Math.max(1, Number(systemInfo.pixelRatio) || 1);

    if (!_webViewBridge) {
        _webViewBridge = createWebViewCanvasBridge({
            getWebView: () => web.value,
            onTouch: (message: any) => onWebViewTouch(message),
            onReady: (message: any) => {
                if (
                    _webViewSessionId &&
                    message.sessionId &&
                    _webViewSessionId !== message.sessionId
                ) {
                    _webViewInitSignature = null;
                }
                _webViewSessionId = message.sessionId || null;
            },
            onError: (error: any) => console.error('Canvas WebView错误:', error)
        });
        _webViewContext = createWebViewCanvasContext({
            bridge: _webViewBridge,
            resolveImage: (source: any) => resolveNvueImageSource(source),
            measureText: (text: any, state: any) => {
                const matched = String(state.font || '').match(/(\d+(?:\.\d+)?)px/);
                const fontSizeValue = matched ? Number(matched[1]) : fontSize.value;
                return { width: estimateTextWidth(text, fontSizeValue) };
            }
        });
        ctx.value = _webViewContext;
    }

    await _webViewBridge.ready();
    const signature = [
        actualWidth.value,
        actualHeight.value,
        dpr.value,
        props.disableScroll ? 1 : 0
    ].join(':');
    if (force || _webViewInitSignature !== signature) {
        await _webViewBridge.request('init', {
            width: actualWidth.value,
            height: actualHeight.value,
            dpr: dpr.value,
            disableScroll: props.disableScroll
        });
        _webViewInitSignature = signature;
        applyFont();
        await clearCanvas();
    }

    emit('ready', {
        width: actualWidth.value,
        height: actualHeight.value
    });
    return true;
}

function refresh() {
    return initCanvas(true);
}

function getWidth() {
    return actualWidth.value;
}

function getHeight() {
    return actualHeight.value;
}

function clearCanvas() {
    if (!ctx.value) return;
    clearRect(0, 0, actualWidth.value, actualHeight.value);
    if (props.bgColor && props.bgColor !== 'transparent') {
        beginPath();
        rect(0, 0, actualWidth.value, actualHeight.value);
        setFillStyle(props.bgColor);
        fill();
    }
    return draw();
}

function callContext(method: string, ...args: any[]) {
    if (ctx.value && typeof ctx.value[method] === 'function') {
        return ctx.value[method](...args);
    }
    return undefined;
}

function rect(x: number, y: number, width: number, height: number) {
    return callContext('rect', x, y, width, height);
}

function clearRect(x: number, y: number, width: number, height: number) {
    return callContext('clearRect', x, y, width, height);
}

function fillRect(x: number, y: number, width: number, height: number) {
    return callContext('fillRect', x, y, width, height);
}

function strokeRect(x: number, y: number, width: number, height: number) {
    return callContext('strokeRect', x, y, width, height);
}

function fill() {
    return callContext('fill');
}

function stroke() {
    return callContext('stroke');
}

function beginPath() {
    return callContext('beginPath');
}

function closePath() {
    return callContext('closePath');
}

function moveTo(x: number, y: number) {
    return callContext('moveTo', x, y);
}

function lineTo(x: number, y: number) {
    return callContext('lineTo', x, y);
}

function arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise = false) {
    return callContext('arc', x, y, radius, startAngle, endAngle, anticlockwise);
}

function arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
    return callContext('arcTo', x1, y1, x2, y2, radius);
}

function bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) {
    return callContext('bezierCurveTo', cp1x, cp1y, cp2x, cp2y, x, y);
}

function quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
    return callContext('quadraticCurveTo', cpx, cpy, x, y);
}

function ellipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    anticlockwise = false
) {
    return callContext(
        'ellipse',
        x,
        y,
        radiusX,
        radiusY,
        rotation,
        startAngle,
        endAngle,
        anticlockwise
    );
}

function clip() {
    return callContext('clip');
}

function save() {
    return callContext('save');
}

function restore() {
    return callContext('restore');
}

function translate(x: number, y: number) {
    return callContext('translate', x, y);
}

function rotate(angle: number) {
    return callContext('rotate', angle);
}

function scale(x: number, y: number) {
    return callContext('scale', x, y);
}

function setTransform(a: number, b: number, c: number, d: number, e: number, f: number) {
    return callContext('setTransform', a, b, c, d, e, f);
}

function transform(a: number, b: number, c: number, d: number, e: number, f: number) {
    return callContext('transform', a, b, c, d, e, f);
}

function resetTransform() {
    return callContext('resetTransform');
}

function setFillStyle(color: any) {
    if (!ctx.value) return;
    if (typeof ctx.value.setFillStyle === 'function') {
        ctx.value.setFillStyle(color);
    } else {
        ctx.value.fillStyle = color;
    }
}

function setStrokeStyle(color: any) {
    if (!ctx.value) return;
    if (typeof ctx.value.setStrokeStyle === 'function') {
        ctx.value.setStrokeStyle(color);
    } else {
        ctx.value.strokeStyle = color;
    }
}

function setLineWidth(width: number) {
    if (!ctx.value) return;
    if (typeof ctx.value.setLineWidth === 'function') {
        ctx.value.setLineWidth(width);
    } else {
        ctx.value.lineWidth = width;
    }
}

function setLineCap(lineCap: any = 'round') {
    if (!ctx.value) return;
    if (typeof ctx.value.setLineCap === 'function') {
        ctx.value.setLineCap(lineCap);
    } else {
        ctx.value.lineCap = lineCap;
    }
}

function setLineJoin(lineJoin: any = 'round') {
    if (!ctx.value) return;
    if (typeof ctx.value.setLineJoin === 'function') {
        ctx.value.setLineJoin(lineJoin);
    } else {
        ctx.value.lineJoin = lineJoin;
    }
}

function setMiterLimit(miterLimit: number) {
    if (!ctx.value) return;
    if (typeof ctx.value.setMiterLimit === 'function') {
        ctx.value.setMiterLimit(miterLimit);
    } else {
        ctx.value.miterLimit = miterLimit;
    }
}

function setLineDash(segments: any[] = []) {
    return callContext('setLineDash', segments);
}

function getLineDash(): any[] {
    const result = callContext('getLineDash');
    return Array.isArray(result) ? result : [];
}

function setTextAlign(align: any = 'left') {
    if (!ctx.value) return;
    if (typeof ctx.value.setTextAlign === 'function') {
        ctx.value.setTextAlign(align);
    } else {
        ctx.value.textAlign = align;
    }
}

function setTextBaseline(baseline: any = 'alphabetic') {
    if (!ctx.value) return;
    if (typeof ctx.value.setTextBaseline === 'function') {
        ctx.value.setTextBaseline(baseline);
    } else {
        ctx.value.textBaseline = baseline;
    }
}

function setFontSize(fontSizeValue: any) {
    fontSize.value = Number(fontSizeValue) || fontSize.value;
    if (ctx.value && typeof ctx.value.setFontSize === 'function') {
        ctx.value.setFontSize(fontSize.value);
    }
    applyFont();
}

function setFont(font: string) {
    if (!ctx.value) return;
    if ('font' in ctx.value) {
        ctx.value.font = font;
        return;
    }
    const matched = String(font).match(/(\d+(?:\.\d+)?)px/);
    if (matched) {
        fontSize.value = Number(matched[1]);
    }
    applyFont();
}

function setGlobalAlpha(alpha: number) {
    if (!ctx.value) return;
    if (typeof ctx.value.setGlobalAlpha === 'function') {
        ctx.value.setGlobalAlpha(alpha);
    } else {
        ctx.value.globalAlpha = alpha;
    }
}

function setGlobalCompositeOperation(operation: string) {
    if (!ctx.value) return;
    if (typeof ctx.value.setGlobalCompositeOperation === 'function') {
        ctx.value.setGlobalCompositeOperation(operation);
    } else {
        ctx.value.globalCompositeOperation = operation;
    }
}

function setShadow(offsetX = 0, offsetY = 0, blur = 0, color = 'rgba(0,0,0,0)') {
    if (!ctx.value) return;
    if (typeof ctx.value.setShadow === 'function') {
        ctx.value.setShadow(offsetX, offsetY, blur, color);
        return;
    }
    ctx.value.shadowOffsetX = offsetX;
    ctx.value.shadowOffsetY = offsetY;
    ctx.value.shadowBlur = blur;
    ctx.value.shadowColor = color;
}

function setLineStyle(lineColor: any, lineWidth: number) {
    setLineCap('round');
    setLineJoin('round');
    setStrokeStyle(lineColor);
    setLineWidth(lineWidth);
}

function applyFont() {
    if (!ctx.value) return;
    const font = `${fontWeight.value === 'normal' ? '' : `${fontWeight.value} `}${fontSize.value}px ${fontFamily.value}`.trim();
    if ('font' in ctx.value) {
        ctx.value.font = font;
    } else if (typeof ctx.value.setFont === 'function') {
        ctx.value.setFont(font);
    } else if (typeof ctx.value.setFontSize === 'function') {
        ctx.value.setFontSize(fontSize.value);
    }
}

function fillText(text: any, x: number, y: number) {
    return callContext('fillText', String(text), x, y);
}

function strokeText(text: any, x: number, y: number, maxWidth?: number) {
    if (maxWidth === undefined) {
        return callContext('strokeText', String(text), x, y);
    }
    return callContext('strokeText', String(text), x, y, maxWidth);
}

/**
 * 按字形宽度估算文本宽度
 * @description 当平台无法给出真实测量值时的兜底。必须区分全角/半角：
 *   汉字、假名、全角标点约占一个字号，按半角的 0.6 估算会短 40%，
 *   中文海报因此算出"整段都放得下"而不换行。
 * @param {String} text 待测量文本
 * @param {Number} [fontSize] 字号，默认取组件当前字号
 * @returns {Number} 估算宽度(px)
 * @author jry ijry@qq.com
 */
function estimateTextWidth(text: any, fontSizePx?: any) {
    const size = Number(fontSizePx) || Number(fontSize.value) || 12;
    const FULL_WIDTH = /[ᄀ-ᅟ⺀-〾ぁ-㏿㐀-䶿一-鿿ꀀ-꓏가-힣豈-﫿︰-﹯＀-｠￠-￦]/;
    return Array.from(String(text)).reduce((width: number, char: string) => {
        if (FULL_WIDTH.test(char)) return width + size;
        if (/\s/.test(char)) return width + size * 0.28;
        return width + size * 0.56;
    }, 0);
}

function measureText(text: any) {
    if (ctx.value && typeof ctx.value.measureText === 'function') {
        const metrics = ctx.value.measureText(String(text));
        const width = Number(metrics && metrics.width);
        // 鸿蒙同步测量恒为 0（真实值只走 callback），上下文未就绪时其他
        // 平台也可能返回 0。绝不能把 0 交给调用方——换行逻辑会把它当成
        // "宽度足够"，于是整段文本挤成一行。
        if (width > 0) return metrics;
    }
    return {
        width: estimateTextWidth(text)
    };
}

function measureTextAsync(text: any): Promise<any> {
    if (ctx.value && typeof ctx.value.measureTextAsync === 'function') {
        return ctx.value.measureTextAsync(String(text));
    }

    // #ifdef APP-HARMONY
    // 鸿蒙的 CanvasContext.measureText 同步返回值恒为 0，真实宽度只通过
    // callback(webview.evalJSAsync) 回传，因此必须走回调形式。
    if (ctx.value && typeof ctx.value.measureText === 'function' && !_harmonyMeasureUnavailable) {
        return new Promise((resolve) => {
            let settled = false;
            // evalJSAsync 并非所有鸿蒙版本都提供，回调可能永远不来，
            // 必须兜底避免上层 await 永久挂起。且一旦超时就标记为不可用：
            // 单次换行要二分测量十几次，逐次干等会把导出拖成十几秒。
            const timer = setTimeout(() => {
                if (settled) return;
                settled = true;
                _harmonyMeasureUnavailable = true;
                resolve({ width: estimateTextWidth(text) });
            }, 300);
            const done = (metrics: any) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                const width = Number(metrics && metrics.width);
                resolve({ width: width > 0 ? width : estimateTextWidth(text) });
            };
            try {
                const sync = ctx.value.measureText(String(text), done);
                // 若该平台其实同步返回了有效值，直接采用
                const syncWidth = Number(sync && sync.width);
                if (syncWidth > 0) done(sync);
            } catch (error) {
                done(null);
            }
        });
    }
    // #endif

    return Promise.resolve(measureText(text));
}

function createLinearGradient(x0: number, y0: number, x1: number, y1: number) {
    if (ctx.value && typeof ctx.value.createLinearGradient === 'function') {
        return ctx.value.createLinearGradient(x0, y0, x1, y1);
    }
    return null;
}

function createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) {
    if (ctx.value && typeof ctx.value.createRadialGradient === 'function') {
        return ctx.value.createRadialGradient(x0, y0, r0, x1, y1, r1);
    }
    return null;
}

function createPattern(image: any, repetition: any = 'repeat') {
    if (ctx.value && typeof ctx.value.createPattern === 'function') {
        return ctx.value.createPattern(image, repetition);
    }
    return null;
}

async function resolveNvueImageSource(src: any) {
    if (typeof src !== 'string' || src.indexOf('data:image/') === 0) {
        return src;
    }
    if (_imageDataCache[src]) {
        return _imageDataCache[src];
    }

    const task = (async () => {
        const localPath = await new Promise<any>((resolve, reject) => {
            uni.getImageInfo({
                src,
                success: (res: any) => resolve(res.path || res.tempFilePath),
                fail: reject
            });
        });
        if (!localPath) {
            throw new Error(`Canvas图片未返回本地路径: ${src}`);
        }
        return readNvueFileAsDataURL(localPath);
    })();
    _imageDataCache[src] = task;
    try {
        const dataUrl = await task;
        _imageDataCache[src] = dataUrl;
        return dataUrl;
    } catch (error) {
        delete _imageDataCache[src];
        throw error;
    }
}

function readNvueFileAsDataURL(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
        // #ifdef APP-NVUE
        if (typeof plus === 'undefined' || !plus.io) {
            reject(new Error('HTML5+ FileReader不可用'));
            return;
        }
        plus.io.resolveLocalFileSystemURL(path, (entry: any) => {
            entry.file((file: any) => {
                const reader = new plus.io.FileReader();
                reader.onloadend = (event: any) => resolve(event.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            }, reject);
        }, reject);
        return;
        // #endif

        resolve(path);
    });
}

function loadImage(src: any): Promise<any> {
    // #ifdef APP-NVUE
    return resolveNvueImageSource(src);
    // #endif

    if (_imageCache[src]) {
        return Promise.resolve(_imageCache[src]);
    }
    return new Promise((resolve, reject) => {
        let image: any = null;

        // #ifdef MP
        const canvas = getCanvasElement();
        if (canvas && typeof canvas.createImage === 'function') {
            image = canvas.createImage();
        }
        // #endif

        // #ifdef H5
        image = new Image();
        image.crossOrigin = 'anonymous';
        // #endif

        if (!image) {
            resolve(src);
            return;
        }

        image.onload = () => {
            _imageCache[src] = image;
            resolve(image);
        };
        image.onerror = reject;
        image.src = src;
    });
}

async function drawImage(source: any, ...args: any[]) {
    if (!ctx.value || typeof ctx.value.drawImage !== 'function') {
        return false;
    }
    if (typeof source !== 'string') {
        ctx.value.drawImage(source, ...args);
        return true;
    }
    if (typeof ctx.value.setFillStyle === 'function' && !_isNvue) {
        ctx.value.drawImage(source, ...args);
        return true;
    }
    const image = await loadImage(source);
    ctx.value.drawImage(image, ...args);
    return true;
}

function draw(isLastDraw = false, callback?: any) {
    if (ctx.value && typeof ctx.value.draw === 'function') {
        return ctx.value.draw(isLastDraw, callback);
    }
    if (typeof callback === 'function') {
        setTimeout(callback, 0);
    }
    return undefined;
}

function toTempFilePath(options: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
        const width = options.width || actualWidth.value;
        const height = options.height || actualHeight.value;
        const hasDestWidth = options.destWidth !== undefined && options.destWidth !== null;
        const hasDestHeight = options.destHeight !== undefined && options.destHeight !== null;
        let destWidth = hasDestWidth ? options.destWidth : width;
        let destHeight = hasDestHeight ? options.destHeight : height;

        // MP、H5、APP-PLUS 和 APP-HARMONY 保持逻辑绘制坐标，只提升默认导出像素。
        // #ifdef MP || H5 || APP-PLUS || APP-HARMONY
        if (!hasDestWidth) {
            destWidth = Math.round(width * dpr.value);
        }
        if (!hasDestHeight) {
            destHeight = Math.round(height * dpr.value);
        }
        // #endif

        const defaultFileType = 'png';
        const request = {
            x: options.x || 0,
            y: options.y || 0,
            width,
            height,
            destWidth,
            destHeight,
            fileType: options.fileType === undefined || options.fileType === null
                ? defaultFileType
                : options.fileType,
            quality: options.quality === undefined ? 1 : options.quality
        };
        const success = (res: any) => {
            if (typeof options.success === 'function') options.success(res);
            resolve(res);
        };
        const fail = (err: any) => {
            if (typeof options.fail === 'function') options.fail(err);
            reject(err);
        };
        const complete = (res: any) => {
            if (typeof options.complete === 'function') options.complete(res);
        };

        // #ifdef H5
        const canvas = getCanvasElement() || (ctx.value && ctx.value.canvas);
        if (canvas && typeof canvas.toDataURL === 'function') {
            try {
                let exportCanvas = canvas;
                if (
                    request.x !== 0 ||
                    request.y !== 0 ||
                    request.width !== actualWidth.value ||
                    request.height !== actualHeight.value ||
                    request.destWidth !== request.width ||
                    request.destHeight !== request.height
                ) {
                    exportCanvas = document.createElement('canvas');
                    exportCanvas.width = request.destWidth;
                    exportCanvas.height = request.destHeight;
                    const exportCtx = exportCanvas.getContext('2d') as CanvasRenderingContext2D;
                    exportCtx.drawImage(
                        canvas,
                        request.x * dpr.value,
                        request.y * dpr.value,
                        request.width * dpr.value,
                        request.height * dpr.value,
                        0,
                        0,
                        request.destWidth,
                        request.destHeight
                    );
                }
                const mime = request.fileType === 'jpg' || request.fileType === 'jpeg'
                    ? 'image/jpeg'
                    : 'image/png';
                const res = {
                    tempFilePath: exportCanvas.toDataURL(mime, request.quality)
                };
                success(res);
                complete(res);
                return;
            } catch (error) {
                fail(error);
                complete(error);
                return;
            }
        }
        // #endif

        // #ifdef APP-NVUE
        if (ctx.value && typeof ctx.value.toTempFilePath === 'function') {
            Promise.resolve(ctx.value.toTempFilePath(request)).then(
                (res: any) => {
                    success(res);
                    complete(res);
                },
                (error: any) => {
                    fail(error);
                    complete(error);
                }
            );
            return;
        }
        // #endif

        const canvasNode = getCanvasElement();
        const uniOptions: any = {
            ...request,
            canvasId: props.canvasId,
            success,
            fail,
            complete
        };
        if (canvasNode) {
            uniOptions.canvas = canvasNode;
        }
        uni.canvasToTempFilePath(uniOptions, proxy);
    });
}

async function exportImage(fileType = 'png', quality = 1) {
    const res = await toTempFilePath({
        fileType,
        quality,
        width: actualWidth.value,
        height: actualHeight.value
    });
    return res.tempFilePath || res.apFilePath;
}

function getImageData(options: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
        const success = (res: any) => {
            if (typeof options.success === 'function') options.success(res);
            resolve(res);
        };
        const fail = (err: any) => {
            if (typeof options.fail === 'function') options.fail(err);
            reject(err);
        };
        const complete = (res: any) => {
            if (typeof options.complete === 'function') options.complete(res);
        };
        // #ifdef APP-NVUE
        if (ctx.value && typeof ctx.value.getImageData === 'function') {
            Promise.resolve(ctx.value.getImageData({
                x: options.x || 0,
                y: options.y || 0,
                width: options.width || actualWidth.value,
                height: options.height || actualHeight.value
            })).then((res: any) => {
                success(res);
                complete(res);
            }, (error: any) => {
                fail(error);
                complete(error);
            });
            return;
        }
        // #endif

        const request = {
            canvasId: props.canvasId,
            x: options.x || 0,
            y: options.y || 0,
            width: options.width || actualWidth.value,
            height: options.height || actualHeight.value,
            success,
            fail,
            complete
        };
        uni.canvasGetImageData(request, proxy);
    });
}

function putImageData(options: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
        const success = (res: any) => {
            if (typeof options.success === 'function') options.success(res);
            resolve(res);
        };
        const fail = (err: any) => {
            if (typeof options.fail === 'function') options.fail(err);
            reject(err);
        };
        const complete = (res: any) => {
            if (typeof options.complete === 'function') options.complete(res);
        };
        // #ifdef APP-NVUE
        if (ctx.value && typeof ctx.value.putImageData === 'function') {
            Promise.resolve(ctx.value.putImageData({
                x: options.x || 0,
                y: options.y || 0,
                width: options.width || (options.data && options.data.width) || actualWidth.value,
                height: options.height || (options.data && options.data.height) || actualHeight.value,
                data: options.data
            })).then((res: any) => {
                success(res);
                complete(res);
            }, (error: any) => {
                fail(error);
                complete(error);
            });
            return;
        }
        // #endif

        const request = {
            canvasId: props.canvasId,
            x: options.x || 0,
            y: options.y || 0,
            width: options.width || (options.data && options.data.width) || actualWidth.value,
            height: options.height || (options.data && options.data.height) || actualHeight.value,
            data: options.data,
            success,
            fail,
            complete
        };
        uni.canvasPutImageData(request, proxy);
    });
}

defineExpose({
    rootId,
    ctx,
    widthLocal,
    heightLocal,
    fontSize,
    fontFamily,
    fontWeight,
    dpr,
    parseSize,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onWebViewMessage,
    onWebViewTouch,
    getCanvasNode,
    getCanvasElement,
    getRawContext,
    getCanvasContext,
    setNewSize,
    initCanvas,
    _initializeCanvas,
    _initializeWebViewCanvas,
    refresh,
    getWidth,
    getHeight,
    clearCanvas,
    callContext,
    rect,
    clearRect,
    fillRect,
    strokeRect,
    fill,
    stroke,
    beginPath,
    closePath,
    moveTo,
    lineTo,
    arc,
    arcTo,
    bezierCurveTo,
    quadraticCurveTo,
    ellipse,
    clip,
    save,
    restore,
    translate,
    rotate,
    scale,
    setTransform,
    transform,
    resetTransform,
    setFillStyle,
    setStrokeStyle,
    setLineWidth,
    setLineCap,
    setLineJoin,
    setMiterLimit,
    setLineDash,
    getLineDash,
    setTextAlign,
    setTextBaseline,
    setFontSize,
    setFont,
    setGlobalAlpha,
    setGlobalCompositeOperation,
    setShadow,
    setLineStyle,
    applyFont,
    fillText,
    strokeText,
    estimateTextWidth,
    measureText,
    measureTextAsync,
    createLinearGradient,
    createRadialGradient,
    createPattern,
    resolveNvueImageSource,
    readNvueFileAsDataURL,
    loadImage,
    drawImage,
    draw,
    toTempFilePath,
    exportImage,
    getImageData,
    putImageData
});
</script>

<style lang="scss" scoped>
    @import '../../scss/variables';
    @import '../../scss/mixins';
    .dd-canvas {
        position: relative;
        overflow: hidden;
    }

    .dd-canvas__canvas {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>
