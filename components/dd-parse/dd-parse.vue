<template>
	<view id="dd-parse-root" :class="'dd-parse__root' + (selectable ? ' dd-parse--select' : '')" :style="containerStyle">
		<slot v-if="!nodes[0]" />
		<!-- #ifndef APP-PLUS-NVUE -->
		<node v-else :childs="nodes" :opts="[lazyLoad, loadingImg, errorImg, showImgMenu, selectable]" name="span" />
		<!-- #endif -->
		<!-- #ifdef APP-PLUS-NVUE -->
		<web-view ref="web" src="/static/app-plus/mp-html/local.html" :style="'margin-top:-2px;height:' + height + 'px'" @onPostMessage="_onMessage" />
		<!-- #endif -->
	</view>
</template>

<script setup lang="ts">
/**
 * mp-html v2.5.1
 * @description 富文本组件
 * @tutorial https://github.com/jin-yufeng/mp-html
 * @property {String} container-style 容器的样式
 * @property {String} content 用于渲染的 html 字符串
 * @property {Boolean} copy-link 是否允许外部链接被点击时自动复制
 * @property {String} domain 主域名，用于拼接链接
 * @property {String} error-img 图片出错时的占位图链接
 * @property {Boolean} lazy-load 是否开启图片懒加载
 * @property {string} loading-img 图片加载过程中的占位图链接
 * @property {Boolean} pause-video 是否在播放一个视频时自动暂停其他视频
 * @property {Boolean} preview-img 是否允许图片被点击时自动预览
 * @property {Boolean} scroll-table 是否给每个表格添加一个滚动层使其能单独横向滚动
 * @property {Boolean | String} selectable 是否开启长按复制
 * @property {Boolean} set-title 是否将 title 标签的内容设置到页面标题
 * @property {Boolean} show-img-menu 是否允许图片被长按时显示菜单
 * @property {Object} tag-style 标签的默认样式
 * @property {Boolean | Number} use-anchor 是否使用锚点链接
 * @event {Function} load dom 结构加载完毕时触发
 * @event {Function} ready 所有图片加载完毕时触发
 * @event {Function} imgtap 图片被点击时触发
 * @event {Function} linktap 链接被点击时触发
 * @event {Function} play 音视频播放时触发
 * @event {Function} error 媒体加载出错时触发
 */
// #ifndef APP-PLUS-NVUE
// @ts-ignore node 以无扩展名方式导入 .vue 文件，vue-tsc 无法解析
import node from './node/node'
// #endif
// @ts-ignore parser.js 为 JS 实现且无类型声明，导入方式与原 Options API 一致
import Parser from './parser'
import { getCurrentInstance, nextTick, onMounted, onUnmounted, ref, shallowRef, toRefs, watch } from 'vue'

// 插件注册表（与实例 plugins 同为空数组，原实现两处均未被填充）
const plugins: any[] = []
// #ifdef APP-PLUS-NVUE
// @ts-ignore weex 为 nvue 运行时全局对象，@dcloudio/types 未声明
const dom = weex.requireModule('dom')
// #endif

// node 子组件依赖 $parent.$options.name === 'dd-parse' 定位根实例
defineOptions({ name: 'dd-parse' })

interface Props {
	containerStyle?: string
	content?: string
	copyLink?: boolean | string
	domain?: string
	errorImg?: string
	lazyLoad?: boolean | string
	loadingImg?: string
	pauseVideo?: boolean | string
	previewImg?: boolean | string
	scrollTable?: boolean | string
	selectable?: boolean | string
	setTitle?: boolean | string
	showImgMenu?: boolean | string
	tagStyle?: Record<string, any>
	useAnchor?: boolean | number
}

const props = withDefaults(defineProps<Props>(), {
	containerStyle: '',
	content: '',
	copyLink: true,
	errorImg: '',
	lazyLoad: false,
	loadingImg: '',
	pauseVideo: true,
	previewImg: true,
	setTitle: true,
	showImgMenu: true,
})

const emit = defineEmits<{
	(e: 'load'): void
	(e: 'ready', rect: any): void
	(e: 'imgtap', attrs: any): void
	(e: 'linktap', attrs: any): void
	(e: 'play', info?: any): void
	(e: 'error', err: any): void
}>()

const instance = getCurrentInstance()!
// Parser 与 node 子组件都以组件实例作为上下文读写这些状态
const vm = instance.proxy as any

const nodes = ref<any[]>([])
// #ifdef APP-PLUS-NVUE
const height = ref(3)
// #endif
const web = ref<any>(null)
// imgList/_videos 原实现是非响应式的实例属性（不参与渲染），用 shallowRef 保持原始数组
const imgList = shallowRef<any>([])
// node 子组件通过 $parent 读写
const _videos = shallowRef<any[]>([])
const playbackRate = ref<number | undefined>()
let _in: any = null
let _navigateTo: any = null
let _ready = false

// Parser 还会读写 imgList/plugins/nodes；script setup 的绑定不会出现在实例代理上，
// 这里以实例代理为底补上这三个键（props 仍走代理，与原 Options API 行为一致）
const parserCtx: any = new Proxy(vm, {
	get(target, key) {
		if (key === 'imgList') return imgList.value
		if (key === 'plugins') return plugins
		if (key === 'nodes') return nodes.value
		return target[key]
	}
})

watch(
	() => props.content,
	(content) => {
		setContent(content)
	}
)

onMounted(() => {
	if (props.content && !nodes.value.length) {
		setContent(props.content)
	}
})

onUnmounted(() => {
	_hook('onDetached')
})

/**
 * @description 规范化链接地址
 * @param {any} href
 * @return {String}
 */
function normalizeHref(href: any) {
	return typeof href === 'string' ? href.trim() : ''
}

/**
 * @description 判断是否为外部链接
 * @param {String} href
 * @return {Boolean}
 */
function isExternalLink(href: string) {
	return href.split('?')[0].includes('://')
}

/**
 * @description 打开外部链接
 * @param {String} href
 */
function openExternalLink(href: string) {
	// #ifdef APP-PLUS
	try {
		plus.runtime.openWeb(href)
	} catch (e) { }
	// #endif
	// #ifdef APP-HARMONY
	try {
		plus.runtime.openURL(href)
	} catch (e) { }
	// #endif
}

/**
 * @description 将锚点跳转的范围限定在一个 scroll-view 内
 * @param {Object} page scroll-view 所在页面的示例
 * @param {String} selector scroll-view 的选择器
 * @param {String} scrollTop scroll-view scroll-top 属性绑定的变量名
 */
function anchorIn(page: any, selector: any, scrollTop: any) {
	// #ifndef APP-PLUS-NVUE
	if (page && selector && scrollTop) {
		_in = {
			page,
			selector,
			scrollTop
		}
	}
	// #endif
}

/**
 * @description 锚点跳转
 * @param {String} id 要跳转的锚点 id
 * @param {Number} offset 跳转位置的偏移量
 * @returns {Promise}
 */
function navigateTo(id?: string, offset?: number) {
	return new Promise<void>((resolve, reject) => {
		if (!props.useAnchor) {
			reject(Error('Anchor is disabled'))
			return
		}
		offset = offset || parseInt(props.useAnchor as any) || 0
		// #ifdef APP-PLUS-NVUE
		if (!id) {
			dom.scrollToElement(web.value, {
				offset
			})
			resolve()
		} else {
			_navigateTo = {
				resolve,
				reject,
				offset
			}
			web.value.evalJs('uni.postMessage({data:{action:"getOffset",offset:(document.getElementById(' + id + ')||{}).offsetTop}})')
		}
		// #endif
		// #ifndef APP-PLUS-NVUE
		let deep = ' '
		// #ifdef MP-WEIXIN || MP-QQ || MP-TOUTIAO
		deep = '>>>'
		// #endif
		const selector = uni.createSelectorQuery()
			// #ifndef MP-ALIPAY
			.in(_in ? _in.page : vm)
			// #endif
			.select((_in ? _in.selector : '.dd-parse__root') + (id ? `${deep}#${id}` : '')).boundingClientRect()
		if (_in) {
			// @ts-ignore scrollOffset 的回调在 @dcloudio/types 中声明为必填，运行时可选
			selector.select(_in.selector).scrollOffset()
				.select(_in.selector).boundingClientRect()
		} else {
			// 获取 scroll-view 的位置和滚动距离
			// @ts-ignore 同上
			selector.selectViewport().scrollOffset() // 获取窗口的滚动距离
		}
		selector.exec((res: any) => {
			if (!res[0]) {
				reject(Error('Label not found'))
				return
			}
			const scrollTop = res[1].scrollTop + res[0].top - (res[2] ? res[2].top : 0) + (offset as number)
			if (_in) {
				// scroll-view 跳转
				_in.page[_in.scrollTop] = scrollTop
			} else {
				// 页面跳转
				uni.pageScrollTo({
					scrollTop,
					duration: 300
				})
			}
			resolve()
		})
		// #endif
	})
}

/**
 * @description 获取文本内容
 * @return {String}
 */
function getText(nodeList?: any[]) {
	let text = '';
	(function traversal(nodes: any[]) {
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i]
			if (node.type === 'text') {
				text += node.text.replace(/&amp;/g, '&')
			} else if (node.name === 'br') {
				text += '\n'
			} else {
				// 块级标签前后加换行
				const isBlock = node.name === 'p' || node.name === 'div' || node.name === 'tr' || node.name === 'li' || (node.name[0] === 'h' && node.name[1] > '0' && node.name[1] < '7')
				if (isBlock && text && text[text.length - 1] !== '\n') {
					text += '\n'
				}
				// 递归获取子节点的文本
				if (node.children) {
					traversal(node.children)
				}
				if (isBlock && text[text.length - 1] !== '\n') {
					text += '\n'
				} else if (node.name === 'td' || node.name === 'th') {
					text += '\t'
				}
			}
		}
	})(nodeList || nodes.value)
	return text
}

/**
 * @description 获取内容大小和位置
 * @return {Promise}
 */
function getRect() {
	return new Promise<any>((resolve, reject) => {
		uni.createSelectorQuery()
			// #ifndef MP-ALIPAY
			.in(vm)
			// #endif
			.select('#dd-parse-root').boundingClientRect().exec((res: any) => res[0] ? resolve(res[0]) : reject(Error('Root label not found')))
	})
}

/**
 * @description 暂停播放媒体
 */
function pauseMedia() {
	for (let i = (_videos.value || []).length; i--;) {
		_videos.value[i].pause()
	}
	// #ifdef APP-PLUS
	const command = 'for(var e=document.getElementsByTagName("video"),i=e.length;i--;)e[i].pause()'
	// #ifndef APP-PLUS-NVUE
	let page: any = vm.$parent
	while (!page.$scope) page = page.$parent
	page.$scope.$getAppWebview().evalJS(command)
	// #endif
	// #ifdef APP-PLUS-NVUE
	web.value.evalJs(command)
	// #endif
	// #endif
}

/**
 * @description 设置媒体播放速率
 * @param {Number} rate 播放速率
 */
function setPlaybackRate(rate: number) {
	playbackRate.value = rate
	for (let i = (_videos.value || []).length; i--;) {
		_videos.value[i].playbackRate(rate)
	}
	// #ifdef APP-PLUS
	const command = 'for(var e=document.getElementsByTagName("video"),i=e.length;i--;)e[i].playbackRate=' + rate
	// #ifndef APP-PLUS-NVUE
	let page: any = vm.$parent
	while (!page.$scope) page = page.$parent
	page.$scope.$getAppWebview().evalJS(command)
	// #endif
	// #ifdef APP-PLUS-NVUE
	web.value.evalJs(command)
	// #endif
	// #endif
}

/**
 * @description 设置内容
 * @param {String} content html 内容
 * @param {Boolean} append 是否在尾部追加
 */
function setContent(content: string, append?: boolean) {
	if (!append || !imgList.value) {
		imgList.value = []
	}
	const parsed = new Parser(parserCtx).parse(content)
	// #ifdef APP-PLUS-NVUE
	if (_ready) {
		_set(parsed, append)
	}
	// #endif
	nodes.value = append ? (nodes.value || []).concat(parsed) : parsed

	// #ifndef APP-PLUS-NVUE
	_videos.value = []
	nextTick(() => {
		_hook('onLoad')
		emit('load')
	})

	if (props.lazyLoad || imgList.value._unloadimgs < imgList.value.length / 2) {
		// 设置懒加载，每 350ms 获取高度，不变则认为加载完毕
		let height = 0
		const callback = (rect: any) => {
			if (!rect || !rect.height) rect = {}
			// 350ms 总高度无变化就触发 ready 事件
			if (rect.height === height) {
				emit('ready', rect)
			} else {
				height = rect.height
				setTimeout(() => {
					getRect().then(callback).catch(callback)
				}, 350)
			}
		}
		getRect().then(callback).catch(callback)
	} else {
		// 未设置懒加载，等待所有图片加载完毕
		if (!imgList.value._unloadimgs) {
			getRect().then((rect) => {
				emit('ready', rect)
			}).catch(() => {
				emit('ready', {})
			})
		}
	}
	// #endif
}

/**
 * @description 调用插件钩子函数
 */
function _hook(name: string) {
	for (let i = plugins.length; i--;) {
		if (plugins[i][name]) {
			plugins[i][name]()
		}
	}
}

// #ifdef APP-PLUS-NVUE
/**
 * @description 设置内容
 */
function _set(nodesArg: any[], append?: boolean) {
	web.value.evalJs('setContent(' + JSON.stringify(nodesArg).replace(/%22/g, '') + ',' + JSON.stringify([props.containerStyle.replace(/(?:margin|padding)[^;]+/g, ''), props.errorImg, props.loadingImg, props.pauseVideo, props.scrollTable, props.selectable]) + ',' + append + ')')
}

/**
 * @description 接收到 web-view 消息
 */
function _onMessage(e: any) {
	const message = e.detail.data[0]
	switch (message.action) {
		// web-view 初始化完毕
		case 'onJSBridgeReady':
			_ready = true
			if (nodes.value) {
				_set(nodes.value)
			}
			break
		// 内容 dom 加载完毕
		case 'onLoad':
			height.value = message.height
			_hook('onLoad')
			emit('load')
			break
		// 所有图片加载完毕
		case 'onReady':
			getRect().then((res) => {
				emit('ready', res)
			}).catch(() => {
				emit('ready', {})
			})
			break
		// 总高度发生变化
		case 'onHeightChange':
			height.value = message.height
			break
		// 图片点击
		case 'onImgTap':
			emit('imgtap', message.attrs)
			if (props.previewImg) {
				uni.previewImage({
					current: parseInt(message.attrs.i),
					urls: imgList.value
				})
			}
			break
		// 链接点击
		case 'onLinkTap': {
			const href = normalizeHref(message.attrs.href)
			emit('linktap', message.attrs)
			if (href) {
				// 锚点跳转
				if (href[0] === '#') {
					if (props.useAnchor) {
						dom.scrollToElement(web.value, {
							offset: message.offset
						})
					}
				} else if (isExternalLink(href)) {
					// 打开外链
					if (props.copyLink) {
						openExternalLink(href)
					}
				} else {
					uni.navigateTo({
						url: href,
						fail() {
							uni.switchTab({
								url: href
							})
						}
					})
				}
			}
			break
		}
		case 'onPlay':
			emit('play')
			break
		// 获取到锚点的偏移量
		case 'getOffset':
			if (typeof message.offset === 'number') {
				dom.scrollToElement(web.value, {
					offset: message.offset + _navigateTo.offset
				})
				_navigateTo.resolve()
			} else {
				_navigateTo.reject(Error('Label not found'))
			}
			break
		// 点击
		case 'onClick':
			(emit as any)('tap')
			(emit as any)('click')
			break
		// 出错
		case 'onError':
			emit('error', {
				source: message.source,
				attrs: message.attrs
			})
	}
}
// #endif

// node 子组件经 $parent（即本组件暴露对象）读写状态与 props，方法供外部 $refs 调用
defineExpose({
	// props（node.vue 直接读取 pauseVideo/previewImg/showImgMenu/copyLink/lazyLoad 等）
	...toRefs(props),
	in: anchorIn,
	navigateTo,
	getText,
	getRect,
	pauseMedia,
	setPlaybackRate,
	setContent,
	normalizeHref,
	isExternalLink,
	openExternalLink,
	nodes,
	imgList,
	_videos,
	playbackRate
})
</script>

<style>
/* #ifndef APP-PLUS-NVUE */
/* 根节点样式 */
.dd-parse__root {
	padding: 1px 0;
	overflow-x: auto;
	overflow-y: hidden;
	-webkit-overflow-scrolling: touch;
}

/* 长按复制 */
.dd-parse--select {
	user-select: text;
}

/* #endif */
</style>
