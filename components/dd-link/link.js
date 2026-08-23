import config from '../../libs/config/config'
import { t } from '../../libs/i18n'

const {
    color
} = config
export default {
    // link超链接组件props参数
    link: {
        color: color['primary'],
        fontSize: 15,
        underLine: false,
        href: '',
        mpTips: t("dd.link.copyed"),
        lineColor: '',
        text: ''
    }
}
