<template>
    <view class="dd-qrcode"
          :id="rootId"
          :style="{
              width: useRootHeightAndWidth ? '100%' : 'auto',
              height: useRootHeightAndWidth ? '100%' : 'auto',
        }"
          @longpress="longpress">
        <view
            class="dd-qrcode__content"
            :style="{ width: sizeLocal + unit, height: sizeLocal + unit }"
            @click="preview">
            <!-- #ifdef APP-NVUE -->
            <dd-canvas
                ref="qrcodeCanvas"
                class="dd-qrcode__canvas"
                :canvas-id="cid"
                :width="sizeLocal"
                :height="sizeLocal"
                :unit="unit"
                bg-color="transparent"
                :style="{ width: sizeLocal + unit, height: sizeLocal + unit }" />
            <!-- #endif -->
            <!-- #ifndef APP-NVUE -->
            <dd-canvas
                ref="qrcodeCanvas"
                class="dd-qrcode__canvas"
                :canvas-id="cid"
                :width="sizeLocal"
                :height="sizeLocal"
                :unit="unit"
                bg-color="transparent"
                :style="{ width: sizeLocal + unit, height: sizeLocal + unit }" />
            <!-- #endif -->
            <view v-if="showLoading && loading" class="dd-qrcode__loading"
                  :style="{ width: sizeLocal + unit, height: sizeLocal + unit }">
                <dd-loading type="spinner" :text="loadingText" />
            </view>
        </view>

    </view>
</template>

<script setup lang="ts">
import { getCurrentInstance, nextTick, onMounted, ref, watch } from 'vue'
// @ts-ignore qrcode.js 无类型声明
import QRCode from './qrcode.js'

interface Props {
    cid?: string
    size?: number
    unit?: string
    show?: boolean
    val?: string
    background?: string
    foreground?: string
    pdground?: string
    icon?: string
    iconSize?: number
    lv?: number
    quietZone?: number
    onval?: boolean
    loadMake?: boolean
    usingComponents?: boolean
    showLoading?: boolean
    loadingText?: string
    allowPreview?: boolean
    // 是否使用根节点宽高
    useRootHeightAndWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    cid: () => {
        return `dd-qrcode-canvas${Math.floor(Math.random() * 1000000)}`
    },
    size: 200,
    unit: 'px',
    show: true,
    val: '',
    background: '#ffffff',
    foreground: '#000000',
    pdground: '#000000',
    icon: '',
    iconSize: 40,
    lv: 3,
    quietZone: 0,
    onval: true,
    loadMake: true,
    usingComponents: true,
    showLoading: true,
    loadingText: '生成中',
    allowPreview: false,
    useRootHeightAndWidth: () => false,
})

const emit = defineEmits<{
    (e: 'preview', payload: { url: string }, event: any): void
    (e: 'result', res: any): void
    (e: 'longpressCallback', path: any): void
}>()

const instance = getCurrentInstance()
const qrcodeCanvas = ref<any>(null)

const loading = ref(false)
const result = ref('')
const popupShow = ref(false)
const list = [
    {
        name: '保存二维码',
    },
]
const rootId = `rootId${Number(Math.random() * 100).toFixed(0)}`
const canvasObj = ref({})
const sizeLocal = ref(props.size)
const ctx = ref<any>(null)
const isNvue = ref(false)
const canvasHost = ref<any>(null)

let _qrcode: any = null

onMounted(async () => {
    // 如果使用根节点的宽高 则 重新设置 size
    if (props.useRootHeightAndWidth) {
        await setNewSize()
    }
    // #ifdef APP-NVUE
    isNvue.value = true
    // #endif
    await initCanvas()

    if (props.loadMake) {
        if (!_empty(props.val)) {
            setTimeout(() => {
                setTimeout(() => {
                    _makeCode().catch(error => {
                        console.error('二维码生成失败', error)
                    })
                })
            }, 0)
        }
    }
})

async function _makeCode() {
    if (_empty(props.val)) {
        uni.showToast({
            title: '二维码内容不能为空',
            icon: 'none',
            duration: 2000,
        })
        return ''
    }
    if (!ctx.value) {
        await initCanvas(true)
    }
    if (!ctx.value) throw new Error('无法获取二维码画布实例')
    return new Promise((resolve, reject) => {
        loading.value = true
        try {
            _qrcode = new QRCode({
                vuectx: { drawImage }, // 上下文环境
                canvasId: props.cid, // canvas-id
                ctx: ctx.value,
                canvasHost: canvasHost.value,
                isNvue: isNvue.value,
                usingComponents: props.usingComponents, // 是否是自定义组件
                showLoading: false, // 是否显示loading
                loadingText: props.loadingText, // loading文字
                text: props.val, // 生成内容
                size: sizeLocal.value, // 二维码大小
                width: sizeLocal.value,
                height: sizeLocal.value,
                background: props.background, // 背景色
                foreground: props.foreground, // 前景色
                pdground: props.pdground, // 定位角点颜色
                quietZone: props.quietZone, // 静区宽度
                correctLevel: props.lv, // 容错级别
                image: props.icon, // 二维码图标
                imageSize: props.iconSize, // 二维码图标大小
                cbResult: function (res: any) {
                    // 生成二维码的回调
                    if (typeof res === 'string') {
                        _result(res)
                        resolve(res)
                    } else {
                        loading.value = false
                        reject(res instanceof Error ? res : new Error(`二维码生成失败: ${JSON.stringify(res)}`))
                    }
                },
            })
        } catch (error) {
            loading.value = false
            reject(error)
        }
    })
}

function _clearCode() {
    _result('')
    if (_qrcode) _qrcode.clear()
}

function _saveCode() {
    if (result.value != '') {
        uni.saveImageToPhotosAlbum({
            filePath: result.value,
            success: function () {
                uni.showToast({
                    title: '二维码保存成功',
                    icon: 'success',
                    duration: 2000,
                })
            },
        })
    } else {
        toTempFilePath({
            success: (res: any) => {
                result.value = res.tempFilePath
                uni.saveImageToPhotosAlbum({
                    filePath: result.value,
                    success: function () {
                        uni.showToast({
                            title: '二维码保存成功',
                            icon: 'success',
                            duration: 2000,
                        })
                    },
                })
            },
            fail: (err: any) => {},
        })
    }
}

function preview(e: any) {
    // 预览图片
    // console.log(this.result)
    if (props.allowPreview) {
        uni.previewImage({
            urls: [result.value],
            longPressActions: {
                itemList: ['保存二维码图片'],
                success: function (data: any) {
                    // console.log('选中了第' + (data.tapIndex + 1) + '个按钮,第' + (data.index + 1) + '张图片');
                    switch (data.tapIndex) {
                        case 0:
                            // ponytail: 原实现此处引用了未定义的 that（必然 ReferenceError），按原意直接保存
                            _saveCode()
                            break
                    }
                },
                fail: function (err: any) {
                    console.log(err.errMsg)
                },
            },
        })
    }
    emit('preview', { url: result.value }, e)
}

async function toTempFilePath({ success, fail }: any = {}) {
    try {
        if (!canvasHost.value) {
            await initCanvas(true)
        }
        if (!canvasHost.value) {
            throw new Error('无法获取二维码画布实例')
        }
        const res = await canvasHost.value.toTempFilePath({
            width: sizeLocal.value,
            height: sizeLocal.value,
        })
        if (success) success(res)
        return res
    } catch (error) {
        if (fail) {
            fail(error)
            return false
        }
        throw error
    }
}

async function longpress() {
    toTempFilePath({
        success: (res: any) => {
            emit('longpressCallback', res.tempFilePath)
        },
        fail: (err: any) => {},
    })
}

/**
 * 使用根节点宽高 设置新的size
 * @return {Promise<void>}
 */
async function setNewSize() {
    const rootNode: any = await getRootNode()
    if (!rootNode) return
    const { width, height } = rootNode
    // 将最短的设置为二维码 的size
    if (width > height) {
        sizeLocal.value = height
    } else {
        sizeLocal.value = width
    }
}

async function getRootNode() {
    return new Promise((resolve, reject) => {
        try {
            const query: any = uni.createSelectorQuery().in(instance?.proxy as any).select(`#${rootId}`)
            query
                .fields({
                    size: true,
                })
                .exec((res: any) => {
                    resolve(res[0] || false)
                })
        } catch (e) {
            console.error('获取二维码根节点失败', e)
            resolve(false)
        }
    })
}

async function initCanvas(force = false) {
    await nextTick()
    const canvasRef = qrcodeCanvas.value
    if (!canvasRef) return false
    const initialized = await canvasRef.initCanvas(force)
    if (!initialized) {
        canvasHost.value = null
        ctx.value = null
        return false
    }
    canvasHost.value = canvasRef
    ctx.value = canvasRef.getRawContext()
    return !!ctx.value
}

async function refreshCanvas(force = false) {
    await nextTick()
    return initCanvas(force)
}

function getUPCanvasContext() {
    return canvasHost.value ? canvasHost.value.getRawContext() : null
}

async function drawImage(url: any, x: any, y: any, w: any, h: any) {
    try {
        if (!canvasHost.value) {
            const initialized = await initCanvas(true)
            if (!initialized) {
                throw new Error('无法初始化二维码画布')
            }
        }
        if (!canvasHost.value || !ctx.value) {
            throw new Error('无法获取二维码画布实例')
        }
        await canvasHost.value.drawImage(url, x, y, w, h)
    } catch (error) {
        console.error('drawImage绘制出错', error)
        throw error
    }
}

function _queueMakeCode(delay = 0) {
    if (_empty(props.val)) return
    setTimeout(() => {
        _makeCode().catch(error => {
            console.error('二维码生成失败', error)
        })
    }, delay)
}

function selectClick(index: number) {
    switch (index) {
        case 0:
            alert('保存二维码')
            _saveCode()
            break
    }
}

function _result(res: any) {
    loading.value = false
    result.value = res
    emit('result', res)
}

function _empty(v: any) {
    let tp = typeof v,
        rt = false
    if (tp == 'number' && String(v) == '') {
        rt = true
    } else if (tp == 'undefined') {
        rt = true
    } else if (tp == 'object') {
        if (JSON.stringify(v) == '{}' || JSON.stringify(v) == '[]' || v == null) rt = true
    } else if (tp == 'string') {
        if (v == '' || v == 'undefined' || v == 'null' || v == '{}' || v == '[]') rt = true
    } else if (tp == 'function') {
        rt = false
    }
    return rt
}

watch(
    () => props.size,
    function (n, o) {
        if (n != o && !_empty(n)) {
            sizeLocal.value = n
            if (props.onval) {
                _queueMakeCode(100)
            }
        }
    }
)
watch(
    () => props.val,
    function (n, o) {
        if (props.onval) {
            if (n != o && !_empty(n)) {
                _queueMakeCode()
            }
        }
    }
)
watch(
    () => props.icon,
    function (n, o) {
        if (n === o) return
        _queueMakeCode(100)
    }
)
watch(
    () => props.background,
    function () {
        _queueMakeCode()
    }
)
watch(
    () => props.foreground,
    function () {
        _queueMakeCode()
    }
)
watch(
    () => props.iconSize,
    function () {
        _queueMakeCode()
    }
)
watch(
    () => props.quietZone,
    function () {
        _queueMakeCode()
    }
)
watch(
    () => props.lv,
    function () {
        _queueMakeCode()
    }
)

defineExpose({
    loading,
    result,
    popupShow,
    list,
    rootId,
    canvasObj,
    sizeLocal,
    ctx,
    isNvue,
    canvasHost,
    _makeCode,
    _clearCode,
    _saveCode,
    preview,
    toTempFilePath,
    longpress,
    setNewSize,
    getRootNode,
    initCanvas,
    refreshCanvas,
    getUPCanvasContext,
    drawImage,
    _queueMakeCode,
    selectClick,
    _result,
    _empty,
})
</script>
<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';
.dd-qrcode {
    &__loading {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f7f7f7;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }

    /* #ifdef MP-TOUTIAO */
    /**字节小程序在编译时会出现一个 [hidde]:{ display: none !important; } 这个样式
     * 会导致canvas 隐藏掉 没有找到具体原因先这样处理
     */
    &__canvas {
        display: block !important;
    }
    /* #endif */

    &__content {
        position: relative;
    }
}
</style>
