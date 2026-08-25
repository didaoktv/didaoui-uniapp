import config from '../../libs/config/config'

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
        mpTips: '链接已复制，请在浏览器打开',
        lineColor: '',
        text: ''
    }
}
