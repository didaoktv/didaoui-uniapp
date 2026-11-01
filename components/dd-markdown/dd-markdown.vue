<template>
  <view class="dd-markdown" :class="theme">
    <dd-parse
      :content="parsedContent"
      :previewImg="previewImg"
      :copyLink="copyLink"
      :domain="domain"
      @load="emitLoad"
      @ready="emitReady"
      @imgtap="emitImgtap"
      @linktap="emitLinktap"
      @play="emitPlay"
      @error="emitError"
    ></dd-parse>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
// @ts-ignore marked.esm.mjs 无类型声明
import { marked } from './marked.esm.mjs'

interface Props {
  // markdown内容
  content?: string
  // 是否启用图片预览
  previewImg?: boolean
  // 是否允许外部链接被点击时自动打开
  copyLink?: boolean | string
  // 主域名，用于 dd-parse 处理相对链接
  domain?: string
  // 是否显示代码块行号
  showLineNumber?: boolean
  // 主题样式 'light' | 'dark'
  theme?: string
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  previewImg: true,
  copyLink: true,
  domain: '',
  showLineNumber: false,
  theme: 'light',
})

const emit = defineEmits<{
  (e: 'load', event: any): void
  (e: 'ready', event: any): void
  (e: 'imgtap', event: any): void
  (e: 'linktap', event: any): void
  (e: 'play', event: any): void
  (e: 'error', event: any): void
}>()

const parsedContent = ref('')

watch(
  () => props.content,
  (newVal: string) => {
    parseMarkdown(newVal)
  },
  { immediate: true }
)

// 解析markdown内容
function parseMarkdown(content: string) {
  if (!content) {
    parsedContent.value = ''
    return
  }

  // 使用marked解析markdown
  let parsed = marked(content)

  // 处理代码块
  parsed = handleCodeBlock(parsed)

  // 应用主题样式
  parsed = applyTheme(parsed)

  parsedContent.value = parsed
}

// 处理代码块
function handleCodeBlock(html: string) {
  // 添加代码块样式和行号
  return html.replace(/<pre><code([^>]*)>([^<]+)<\/code><\/pre>/g, (match, lang, code) => {
    const language = lang.match(/class="language-([^"]+)"/)
    const langClass = language ? `language-${language[1]}` : ''

    let result = `<pre class="dd-markdown-code ${langClass}">`

    if (props.showLineNumber) {
      // 添加行号
      const lines = code.split('\n').filter((line: any) => line.trim() !== '')
      result += '<span class="dd-markdown-line-numbers">'
      lines.push('')
      lines.forEach((_: any, index: number) => {
        result += `<span class="dd-markdown-line-number">${index + 1}</span>`
      })
      result += '</span>'
    }

    result += `<code class='code-lang ${langClass}'>${code}</code></pre>`
    return result
  })
}

// 应用主题样式
function applyTheme(html: string) {
  // 可以根据theme属性添加不同的样式类
  return html
}

function emitLoad(event: any) {
  emit('load', event)
}

function emitReady(event: any) {
  emit('ready', event)
}

function emitImgtap(event: any) {
  emit('imgtap', event)
}

function emitLinktap(event: any) {
  emit('linktap', event)
}

function emitPlay(event: any) {
  emit('play', event)
}

function emitError(event: any) {
  emit('error', event)
}

defineExpose({ parsedContent, parseMarkdown, handleCodeBlock, applyTheme })
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';
.dd-markdown {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: $dd-font-size-h4;
  line-height: 1.6;
  color: var(--dd-fg, #{$dd-fg});
  padding: $dd-space-4;
  word-wrap: break-word;
  
  /* 标题样式 */
  :deep(h1) {
    font-size: $dd-font-size-display;
    margin: $dd-space-2 0;
    font-weight: bold;
  }
  
  :deep(h2) {
    font-size: $dd-font-size-h1;
    margin: $dd-space-2 0;
    font-weight: bold;
  }
  
  :deep(h3) {
    font-size: $dd-font-size-h3;
    margin: 14rpx 0;
    font-weight: bold;
  }
  
  :deep(h4) {
    font-size: $dd-font-size-h4;
    margin: 14rpx 0;
    font-weight: bold;
  }
  
  :deep(h5) {
    font-size: 26rpx;
    margin: 12rpx 0;
    font-weight: bold;
  }
  
  :deep(h6) {
    font-size: $dd-font-size-overline;
    margin: 10rpx 0;
    font-weight: bold;
  }
  
  /* 段落样式 */
  :deep(p) {
    margin: $dd-space-4 0;
  }
  
  /* 链接样式 */
  :deep(a) {
    color: var(--dd-link, #{$dd-link});
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  /* 列表样式 */
  :deep(ul,
  :deep ol) {
    margin: $dd-space-4 0;
    padding-left: $dd-space-6;
    
    li {
      margin: $dd-space-2 0;
    }
  }
  
  :deep(ul li) {
    list-style-type: disc;
  }
  
  :deep(ol li) {
    list-style-type: decimal;
  }
  
  /* 引用样式 */
  :deep(blockquote) {
    margin: $dd-space-2 0;
    padding: 0 20rpx;
    border-left: 4px solid var(--dd-border-default, #{$dd-border-default});
    color: var(--dd-text-secondary, #{$dd-text-secondary});
  }
  
  /* 代码样式 */
  :deep(&-code) {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    font-size: $dd-font-size-body;
    background-color: var(--dd-surface-container, #{$dd-surface-container});
    padding: 6rpx 12rpx;
    border-radius: 6rpx;
    display: flex;
  }
  :deep(.code-lang) {
    width: 100%;
    overflow-x: auto;
  }
  
  :deep(pre) {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    font-size: $dd-font-size-body;
    background-color: var(--dd-surface-container, #{$dd-surface-container});
    padding: $dd-space-4;
    overflow: auto;
    border-radius: 12rpx;
    margin: $dd-space-4 0;
    
    :deep(code) {
      background: none;
      padding: 0;
    }
  }
  
  /* 表格样式 */
  :deep(table) {
    border-collapse: collapse;
    margin: $dd-space-4 0;
    width: 100%;
    
    th,
    td {
      padding: 12rpx 26rpx;
      border: 1px solid #dfe2e5;
    }
    
    th {
      font-weight: 600;
    }
    
    tr:nth-child(2n) {
      background-color: #f6f8fa;
    }
  }
  
  /* 图片样式 */
  :deep(img) {
    max-width: 100%;
    box-sizing: content-box;
    background-color: #fff;
    margin: $dd-space-4 0;
  }
  
  /* 分割线样式 */
  :deep(hr) {
    height: 1px;
    padding: 0;
    margin: $dd-space-5 0;
    background-color: var(--dd-rule, #{$dd-rule});
    border: 0;
  }
  // ponytail: .dark 本地类已废弃——CSS 变量随全局 .light/.dark 自动翻转，
  // 保留空块避免消费方 class="dark" 断裂，升级路径：下个大版本直接删
  &.dark {}
}

/* 代码块行号样式 */
:deep(.dd-markdown-line-numbers) {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-right: 20rpx;
  margin-right: 20rpx;
  border-right: 1px solid #ddd;
  user-select: none;
  
  .dd-markdown-line-number {
    color: #999;
    font-size: $dd-font-size-body;
    line-height: 1.6;
  }
}
</style>
