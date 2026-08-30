<template>
  <!-- 弹层传送适配器：把插槽内容提升到页面根节点，规避 transform / filter / backdrop-filter 祖先
       对 position:fixed 的包含块劫持（如弹层嵌在 dd-popup 面板内时，fixed 会被 popup 的
       常驻 transform 捕获，导致弹窗相对面板而非视口定位、遮罩只盖住面板）。
       库内消费方：dd-dialog / dd-popup / dd-modal / dd-alert / dd-action-sheet / dd-drawer /
       dd-toast / dd-loading(全屏) / dd-overlay / dd-picker / dd-date-picker / dd-dropdown-menu / dd-dropdown-item -->
  <!-- #ifdef H5 -->
  <Teleport to="body">
    <slot></slot>
  </Teleport>
  <!-- #endif -->
  <!-- #ifdef MP-WEIXIN || MP-ALIPAY -->
  <root-portal>
    <slot></slot>
  </root-portal>
  <!-- #endif -->
  <!-- #ifndef H5 || MP-WEIXIN || MP-ALIPAY -->
  <!-- ponytail: 其余平台（App/抖音等）无等价传送能力，原位渲染保持旧行为；
       这些平台上弹层勿嵌在 transform 祖先（如 dd-popup 面板）内 -->
  <slot></slot>
  <!-- #endif -->
</template>
