// z-index 唯一真源档位表（ADR 0013）：组件只准选档或档内 +1 派生，禁止魔数。
// uniapp 在 H5 中各 API 的 z-index 平台事实（页面层必须低于它们）：
//   actionsheet: 999 / modal: 999 / toast: 999 / navigate: 998 / tabbar: 998
//   → 提示类（modal/toast/actionsheet）经 scss/theme.scss 的 H5 补丁统一抬到 2050
//     （高于本表全部档位），否则会压在库内弹层 overlay 2000+ 之下（如购物车面板开启时 confirm 被盖）。

export default {
    base: 1,        // 普通层内叠放
    sticky: 100,    // 页面内吸顶/吸底/导航族/浮钮（H5 须低于平台弹层 998）
    overlay: 2000,  // 遮罩
    popup: 2001,    // 弹层面板（overlay+1）
    dialogMask: 2010, // 对话框遮罩
    dialog: 2011,     // 对话框面板（dialogMask+1）
    noNetwork: 2020,  // 断网提示
    cropper: 2025,    // 全屏裁剪工作界面（非提示类，须低于 loading/toast）
    loading: 2030,    // 全屏加载
    toast: 2040,      // 提示（最高）
}
