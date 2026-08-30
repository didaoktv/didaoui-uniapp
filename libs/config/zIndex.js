// uniapp在H5中各API的z-index值如下：
/**
 * actionsheet: 999
 * modal: 999
 * navigate: 998
 * tabbar: 998
 * toast: 999
 */

export default {
    toast: 10090,
    noNetwork: 10080,
    // popup包含popup，actionsheet，keyboard，picker的值
    popup: 10075,
    mask: 10070,
    // dialog 独立于 popup 体系：弹窗需压在 popup 面板(popup+1)之上，又不遮住 noNetwork/toast
    dialogMask: 10077,
    dialog: 10078,
    navbar: 980,
    topTips: 975,
    sticky: 970,
    indexListSticky: 965
}
