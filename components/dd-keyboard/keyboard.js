import { t } from '../../libs/i18n'
export default {
    // 键盘组件
    keyboard: {
        mode: 'number',
        dotDisabled: false,
        tooltip: true,
        showTips: true,
        tips: '',
        showCancel: true,
        showConfirm: true,
        random: false,
        safeAreaInsetBottom: true,
        closeOnClickOverlay: true,
        show: false,
        overlay: true,
        zIndex: 10075,
        cancelText: t("dd.common.cancel"),
        confirmText: t("dd.common.confirm"),
        autoChange: false
    }
}
