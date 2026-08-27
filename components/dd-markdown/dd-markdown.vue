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

<script>
import { marked } from './marked.esm.mjs';

export default {
  name: 'dd-markdown',
  // #ifdef VUE3
  emits: ['load', 'ready', 'imgtap', 'linktap', 'play', 'error'],
  // #endif
  props: {
    // markdown内容
    content: {
      type: String,
      default: ''
    },
    // 是否启用图片预览
    previewImg: {
      type: Boolean,
      default: true
    },
    // 是否允许外部链接被点击时自动打开
    copyLink: {
      type: [Boolean, String],
      default: true
    },
    // 主域名，用于 dd-parse 处理相对链接
    domain: {
      type: String,
      default: ''
    },
    // 是否显示代码块行号
    showLineNumber: {
      type: Boolean,
      default: false
    },
    // 主题样式 'light' | 'dark'
    theme: {
      type: String,
      default: 'light'
    }
  },
  data() {
    return {
      parsedContent: ''
    };
  },
  watch: {
    content: {
      handler(newVal) {
        this.parseMarkdown(newVal);
      },
      immediate: true
    }
  },
  methods: {
    // 解析markdown内容
    parseMarkdown(content) {
      if (!content) {
        this.parsedContent = '';
        return;
      }

      // 使用marked解析markdown
      let parsed = marked(content);
      
      // 处理代码块
      parsed = this.handleCodeBlock(parsed);
      
      // 应用主题样式
      parsed = this.applyTheme(parsed);
      
      this.parsedContent = parsed;
    },
    
    // 处理代码块
    handleCodeBlock(html) {
      // 添加代码块样式和行号
      return html.replace(/<pre><code([^>]*)>([^<]+)<\/code><\/pre>/g, (match, lang, code) => {
        const language = lang.match(/class="language-([^"]+)"/);
        const langClass = language ? `language-${language[1]}` : '';
        
        let result = `<pre class="dd-markdown-code ${langClass}">`;
        
        if (this.showLineNumber) {
          // 添加行号
          const lines = code.split('\n').filter(line => line.trim() !== '');
          result += '<span class="dd-markdown-line-numbers">';
          lines.push('');
          lines.forEach((_, index) => {
            result += `<span class="dd-markdown-line-number">${index + 1}</span>`;
          });
          result += '</span>';
        }
        
        result += `<code class='code-lang ${langClass}'>${code}</code></pre>`;
        return result;
      });
    },
    
    // 应用主题样式
    applyTheme(html) {
      // 可以根据theme属性添加不同的样式类
      return html;
    },
    emitLoad(event) {
      this.$emit('load', event)
    },
    emitReady(event) {
      this.$emit('ready', event)
    },
    emitImgtap(event) {
      this.$emit('imgtap', event)
    },
    emitLinktap(event) {
      this.$emit('linktap', event)
    },
    emitPlay(event) {
      this.$emit('play', event)
    },
    emitError(event) {
      this.$emit('error', event)
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../scss/variables';

.dd-markdown {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--dd-fg, #{$dd-fg});
  padding: 16px;
  word-wrap: break-word;
  
  /* 标题样式 */
  :deep(h1) {
    font-size: 32px;
    margin: 8px 0;
    font-weight: bold;
  }
  
  :deep(h2) {
    font-size: 24px;
    margin: 8px 0;
    font-weight: bold;
  }
  
  :deep(h3) {
    font-size: 18px;
    margin: 7px 0;
    font-weight: bold;
  }
  
  :deep(h4) {
    font-size: 16px;
    margin: 7px 0;
    font-weight: bold;
  }
  
  :deep(h5) {
    font-size: 13px;
    margin: 6px 0;
    font-weight: bold;
  }
  
  :deep(h6) {
    font-size: 10px;
    margin: 5px 0;
    font-weight: bold;
  }
  
  /* 段落样式 */
  :deep(p) {
    margin: 16px 0;
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
    margin: 16px 0;
    padding-left: 32px;
    
    li {
      margin: 8px 0;
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
    margin: 8px 0;
    padding: 0 10px;
    border-left: 4px solid var(--dd-border-default, #{$dd-border-default});
    color: var(--dd-text-secondary, #{$dd-text-secondary});
  }
  
  /* 代码样式 */
  :deep(&-code) {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    font-size: 14px;
    background-color: var(--dd-surface-container, #{$dd-surface-container});
    padding: 3px 6px;
    border-radius: 3px;
    display: flex;
  }
  :deep(.code-lang) {
    width: 100%;
    overflow-x: auto;
  }
  
  :deep(pre) {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    font-size: 14px;
    background-color: var(--dd-surface-container, #{$dd-surface-container});
    padding: 16px;
    overflow: auto;
    border-radius: 6px;
    margin: 16px 0;
    
    :deep(code) {
      background: none;
      padding: 0;
    }
  }
  
  /* 表格样式 */
  :deep(table) {
    border-collapse: collapse;
    margin: 16px 0;
    width: 100%;
    
    th,
    td {
      padding: 6px 13px;
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
    margin: 16px 0;
  }
  
  /* 分割线样式 */
  :deep(hr) {
    height: 1px;
    padding: 0;
    margin: 24px 0;
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
  padding-right: 10px;
  margin-right: 10px;
  border-right: 1px solid #ddd;
  user-select: none;
  
  .dd-markdown-line-number {
    color: #999;
    font-size: 14px;
    line-height: 1.6;
  }
}
</style>
