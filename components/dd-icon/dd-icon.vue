<template>
  <view
    class="dd-icon"
    :class="[name ? `dd-icon--${name}` : '', { 'dd-icon--dot': dot }]"
    :style="iconStyle"
  ></view>
</template>

<script lang="ts">
// ponytail: ceiling — 此清单必须与下方 SCSS &--<name>:before 规则保持一致；
// 新增/删除图标时两处同步，否则 demo 会渲染出空白方框或漏显
export const iconNames: string[] = [
  'notes', 'records', 'cash-back-record', 'newspaper', 'discount',
  'completed', 'user', 'description', 'arrow-double-left', 'arrow-double-right',
  'list-switching', 'add-square', 'add', 'arrow-down', 'arrow-up',
  'arrow', 'after-sale', 'add-o', 'alipay', 'ascending',
  'apps-o', 'aim', 'award', 'arrow-left', 'award-o',
  'audio', 'bag-o', 'balance-list', 'back-top', 'bag',
  'balance-pay', 'balance-o', 'bar-chart-o', 'bars', 'balance-list-o',
  'birthday-cake-o', 'bookmark', 'bill', 'bell', 'browsing-history-o',
  'browsing-history', 'bookmark-o', 'bulb-o', 'bullhorn-o', 'bill-o',
  'calendar-o', 'brush-o', 'card', 'cart-o', 'cart-circle',
  'cart-circle-o', 'cart', 'cash-on-deliver', 'cash-back-record-o', 'cashier-o',
  'chart-trending-o', 'certificate', 'chat', 'clear', 'chat-o',
  'checked', 'clock', 'clock-o', 'close', 'closed-eye',
  'circle', 'cluster-o', 'column', 'comment-circle-o', 'cluster',
  'comment', 'comment-o', 'comment-circle', 'completed-o', 'credit-pay',
  'coupon', 'debit-pay', 'coupon-o', 'contact-o', 'descending',
  'desktop-o', 'diamond-o', 'description-o', 'delete', 'diamond',
  'delete-o', 'cross', 'edit', 'ellipsis', 'down',
  'discount-o', 'ecard-pay', 'list-switch', 'envelop-o', 'exchange',
  'eye', 'enlarge', 'expand-o', 'eye-o', 'expand',
  'filter-o', 'fire', 'fail', 'failure', 'fire-o',
  'flag-o', 'font', 'font-o', 'gem-o', 'flower-o',
  'gem', 'gift-card', 'friends', 'friends-o', 'gold-coin',
  'gold-coin-o', 'good-job-o', 'gift', 'gift-o', 'gift-card-o',
  'good-job', 'home-o', 'goods-collect', 'graphic', 'goods-collect-o',
  'hot-o', 'info', 'hotel-o', 'info-o', 'hot-sale-o',
  'hot', 'like', 'idcard', 'invitation', 'like-o',
  'hot-sale', 'location-o', 'location', 'label', 'lock',
  'label-o', 'map-marked', 'logistics', 'manager', 'more',
  'live', 'manager-o', 'medal', 'more-o', 'music-o',
  'music', 'new-arrival-o', 'medal-o', 'new-o', 'free-postage',
  'newspaper-o', 'new-arrival', 'minus', 'orders-o', 'new',
  'paid', 'notes-o', 'other-pay', 'pause-circle', 'pause',
  'pause-circle-o', 'peer-pay', 'pending-payment', 'passed', 'plus',
  'phone-circle-o', 'phone-o', 'printer', 'photo-fail', 'phone',
  'photo-o', 'play-circle', 'play', 'phone-circle', 'point-gift-o',
  'point-gift', 'play-circle-o', 'shrink', 'photo', 'qr',
  'qr-invalid', 'question-o', 'revoke', 'replay', 'service',
  'question', 'search', 'refund-o', 'service-o', 'scan',
  'share', 'send-gift-o', 'share-o', 'setting', 'points',
  'photograph', 'shop', 'shop-o', 'shop-collect-o', 'shop-collect',
  'smile', 'shopping-cart-o', 'sign', 'sort', 'star-o',
  'smile-comment-o', 'stop', 'stop-circle-o', 'smile-o', 'star',
  'success', 'stop-circle', 'records-o', 'shopping-cart', 'tosend',
  'todo-list', 'thumb-circle-o', 'thumb-circle', 'umbrella-circle', 'underway',
  'upgrade', 'todo-list-o', 'tv-o', 'underway-o', 'user-o',
  'vip-card-o', 'vip-card', 'send-gift', 'wap-home', 'wap-nav',
  'volume-o', 'video', 'wap-home-o', 'volume', 'warning',
  'weapp-nav', 'wechat-pay', 'warning-o', 'wechat', 'setting-o',
  'warn-o', 'smile-comment', 'user-circle-o', 'video-o',
  'shield-o', 'guide-o', 'cash-o', 'qq', 'wechat-moments',
  'weibo', 'link-o', 'miniprogram-o', 'contact',
]

// 图标中文名，供文档/demo 展示；与 iconNames 一一对应，新增/删除图标时同步
export const iconLabels: Record<string, string> = {
  notes: '笔记', records: '账本', 'cash-back-record': '退款记录', newspaper: '报纸', discount: '折扣',
  completed: '已完成', user: '用户', description: '描述', 'arrow-double-left': '双箭头左', 'arrow-double-right': '双箭头右',
  'list-switching': '列表切换', 'add-square': '方块加号', add: '加号', 'arrow-down': '箭头下', 'arrow-up': '箭头上',
  arrow: '箭头', 'after-sale': '售后', 'add-o': '加号描边', alipay: '支付宝', ascending: '升序',
  'apps-o': '应用描边', aim: '准星', award: '奖章', 'arrow-left': '箭头左', 'award-o': '奖章描边',
  audio: '音频', 'bag-o': '购物袋描边', 'balance-list': '账单明细', 'back-top': '回到顶部', bag: '购物袋',
  'balance-pay': '余额支付', 'balance-o': '余额描边', 'bar-chart-o': '柱状图描边', bars: '菜单', 'balance-list-o': '账单明细描边',
  'birthday-cake-o': '生日蛋糕描边', bookmark: '书签', bill: '账单', bell: '铃铛', 'browsing-history-o': '浏览历史描边',
  'browsing-history': '浏览历史', 'bookmark-o': '书签描边', 'bulb-o': '灯泡描边', 'bullhorn-o': '喇叭描边', 'bill-o': '账单描边',
  'calendar-o': '日历描边', 'brush-o': '笔刷描边', card: '卡券', 'cart-o': '购物车描边', 'cart-circle': '购物车圆圈',
  'cart-circle-o': '购物车圆圈描边', cart: '购物车', 'cash-on-deliver': '货到付款', 'cash-back-record-o': '退款记录描边', 'cashier-o': '收银台描边',
  'chart-trending-o': '趋势图描边', certificate: '证书', chat: '聊天', clear: '清除', 'chat-o': '聊天描边',
  checked: '已选', clock: '时钟', 'clock-o': '时钟描边', close: '关闭', 'closed-eye': '闭眼',
  circle: '圆圈', 'cluster-o': '集群描边', column: '竖向排列', 'comment-circle-o': '评论圆圈描边', cluster: '集群',
  comment: '评论', 'comment-o': '评论描边', 'comment-circle': '评论圆圈', 'completed-o': '已完成描边', 'credit-pay': '信用卡',
  coupon: '优惠券', 'debit-pay': '储蓄卡', 'coupon-o': '优惠券描边', 'contact-o': '联系人描边', descending: '降序',
  'desktop-o': '桌面描边', 'diamond-o': '钻石描边', 'description-o': '描述描边', delete: '删除', diamond: '钻石',
  'delete-o': '删除描边', cross: '叉号', edit: '编辑', ellipsis: '省略号', down: '向下',
  'discount-o': '折扣描边', 'ecard-pay': '电子卡', 'list-switch': '列表切换', 'envelop-o': '信封描边', exchange: '交换',
  eye: '眼睛', enlarge: '放大', 'expand-o': '展开描边', 'eye-o': '眼睛描边', expand: '展开',
  'filter-o': '筛选描边', fire: '火焰', fail: '失败', failure: '失效', 'fire-o': '火焰描边',
  'flag-o': '旗帜描边', font: '字体', 'font-o': '字体描边', 'gem-o': '宝石描边', 'flower-o': '花朵描边',
  gem: '宝石', 'gift-card': '礼品卡', friends: '好友', 'friends-o': '好友描边', 'gold-coin': '金币',
  'gold-coin-o': '金币描边', 'good-job-o': '点赞描边', gift: '礼物', 'gift-o': '礼物描边', 'gift-card-o': '礼品卡描边',
  'good-job': '点赞', 'home-o': '首页描边', 'goods-collect': '收藏商品', graphic: '图文', 'goods-collect-o': '收藏商品描边',
  'hot-o': '热门描边', info: '信息', 'hotel-o': '酒店描边', 'info-o': '信息描边', 'hot-sale-o': '热卖描边',
  hot: '热门', like: '点赞', idcard: '身份证', invitation: '邀请', 'like-o': '点赞描边',
  'hot-sale': '热卖', 'location-o': '定位描边', location: '定位', label: '标签', lock: '锁定',
  'label-o': '标签描边', 'map-marked': '地图标记', logistics: '物流', manager: '店长', more: '更多',
  live: '直播', 'manager-o': '店长描边', medal: '勋章', 'more-o': '更多描边', 'music-o': '音乐描边',
  music: '音乐', 'new-arrival-o': '新品描边', 'medal-o': '勋章描边', 'new-o': '新品描边', 'free-postage': '包邮',
  'newspaper-o': '报纸描边', 'new-arrival': '新品', minus: '减号', 'orders-o': '订单描边', new: '上新',
  paid: '已支付', 'notes-o': '笔记描边', 'other-pay': '其他支付', 'pause-circle': '暂停圆圈', pause: '暂停',
  'pause-circle-o': '暂停圆圈描边', 'peer-pay': '余额互转', 'pending-payment': '待支付', passed: '已通过', plus: '加号',
  'phone-circle-o': '电话圆圈描边', 'phone-o': '电话描边', printer: '打印机', 'photo-fail': '图片缺失', phone: '电话',
  'photo-o': '图片描边', 'play-circle': '播放圆圈', play: '播放', 'phone-circle': '电话圆圈', 'point-gift-o': '积分礼品描边',
  'point-gift': '积分礼品', 'play-circle-o': '播放圆圈描边', shrink: '缩小', photo: '图片', qr: '二维码',
  'qr-invalid': '二维码失效', 'question-o': '问号描边', revoke: '撤销', replay: '重播', service: '客服',
  question: '问号', search: '搜索', 'refund-o': '退款描边', 'service-o': '客服描边', scan: '扫码',
  share: '分享', 'send-gift-o': '送礼描边', 'share-o': '分享描边', setting: '设置', points: '积分',
  photograph: '拍照', shop: '店铺', 'shop-o': '店铺描边', 'shop-collect-o': '收藏店铺描边', 'shop-collect': '收藏店铺',
  smile: '微笑', 'shopping-cart-o': '购物车描边', sign: '签到', sort: '排序', 'star-o': '星星描边',
  'smile-comment-o': '微笑评论描边', stop: '停止', 'stop-circle-o': '停止圆圈描边', 'smile-o': '微笑描边', star: '星星',
  success: '成功', 'stop-circle': '停止圆圈', 'records-o': '账本描边', 'shopping-cart': '购物车', tosend: '待发货',
  'todo-list': '待办清单', 'thumb-circle-o': '点赞圆圈描边', 'thumb-circle': '点赞圆圈', 'umbrella-circle': '伞圆圈', underway: '进行中',
  upgrade: '升级', 'todo-list-o': '待办清单描边', 'tv-o': '电视描边', 'underway-o': '进行中描边', 'user-o': '用户描边',
  'vip-card-o': '会员卡描边', 'vip-card': '会员卡', 'send-gift': '送礼', 'wap-home': '移动版首页', 'wap-nav': '移动版导航',
  'volume-o': '音量描边', video: '视频', 'wap-home-o': '移动版首页描边', volume: '音量', warning: '警告',
  'weapp-nav': '小程序导航', 'wechat-pay': '微信支付', 'warning-o': '警告描边', wechat: '微信', 'setting-o': '设置描边',
  'warn-o': '警示描边', 'smile-comment': '微笑评论', 'user-circle-o': '用户圆圈描边', 'video-o': '视频描边',
  'shield-o': '盾牌描边', 'guide-o': '指引描边', 'cash-o': '现金描边', qq: 'QQ', 'wechat-moments': '朋友圈',
  weibo: '微博', 'link-o': '链接描边', 'miniprogram-o': '小程序描边', contact: '联系人',
}

export const iconGroups: Record<string, string[]> = {
  通用操作: [
    'cross', 'close', 'clear', 'delete', 'delete-o', 'edit', 'plus', 'minus',
    'add', 'add-o', 'add-square', 'arrow', 'arrow-left', 'arrow-down', 'arrow-up',
    'arrow-double-left', 'arrow-double-right', 'back-top', 'down', 'ellipsis',
    'more', 'more-o', 'exchange', 'filter-o', 'sort', 'ascending', 'descending',
    'list-switch', 'list-switching', 'column', 'expand', 'expand-o', 'shrink', 'enlarge',
    'font', 'font-o', 'sign', 'lock', 'revoke', 'upgrade', 'qr', 'qr-invalid',
    'scan', 'certificate', 'bars',
  ],
  状态反馈: [
    'completed', 'completed-o', 'checked', 'success', 'fail', 'failure', 'circle', 'passed',
    'star', 'star-o', 'good-job', 'good-job-o', 'thumb-circle', 'thumb-circle-o',
    'clock', 'clock-o', 'fire', 'fire-o', 'hot', 'hot-o', 'like', 'like-o',
    'info', 'info-o', 'warning', 'warning-o', 'warn-o', 'question', 'question-o',
    'aim', 'award', 'award-o', 'medal', 'medal-o', 'gem', 'gem-o', 'diamond',
    'diamond-o', 'flower-o',
  ],
  社交: ['wechat', 'weibo', 'alipay', 'qq', 'wechat-moments', 'wechat-pay', 'miniprogram-o'],
  订单物流: [
    'logistics', 'cluster', 'cluster-o', 'underway', 'underway-o',
    'cart', 'cart-o', 'cart-circle', 'cart-circle-o', 'shopping-cart', 'shopping-cart-o',
    'shop-collect', 'shop-collect-o', 'free-postage', 'cash-on-deliver', 'peer-pay',
    'pending-payment', 'paid', 'after-sale', 'refund-o', 'todo-list', 'todo-list-o',
    'tosend', 'orders-o',
  ],
  金融: [
    'gold-coin', 'gold-coin-o', 'balance-pay', 'balance-list', 'balance-list-o', 'balance-o',
    'cash-o', 'cash-back-record', 'cash-back-record-o', 'cashier-o', 'points',
    'credit-pay', 'debit-pay', 'ecard-pay', 'other-pay', 'coupon', 'coupon-o',
    'gift-card', 'gift-card-o', 'point-gift', 'point-gift-o', 'vip-card', 'vip-card-o',
    'bill', 'bill-o', 'card',
  ],
  联系人: [
    'contact', 'contact-o', 'friends', 'friends-o', 'manager', 'manager-o',
    'user', 'user-o', 'user-circle-o', 'idcard', 'smile', 'smile-o',
    'smile-comment', 'smile-comment-o', 'comment', 'comment-o', 'comment-circle',
    'comment-circle-o', 'chat', 'chat-o', 'phone', 'phone-o', 'phone-circle',
    'phone-circle-o', 'browsing-history', 'browsing-history-o', 'bookmark', 'bookmark-o',
  ],
  服务功能: [
    'service', 'service-o', 'search', 'location', 'location-o', 'map-marked',
    'notes', 'notes-o', 'description', 'description-o', 'records', 'records-o',
    'gift', 'gift-o', 'send-gift', 'send-gift-o', 'bag', 'bag-o',
    'bell', 'bullhorn-o', 'bulb-o', 'invitation', 'label', 'label-o', 'envelop-o',
    'calendar-o', 'brush-o', 'printer', 'newspaper', 'newspaper-o', 'birthday-cake-o',
    'setting', 'setting-o', 'share', 'share-o', 'shield-o', 'guide-o', 'link-o',
  ],
  媒体: [
    'music', 'music-o', 'video', 'video-o', 'audio', 'photograph', 'photo', 'photo-o', 'photo-fail',
    'play', 'play-circle', 'play-circle-o', 'pause', 'pause-circle', 'pause-circle-o',
    'stop', 'stop-circle', 'stop-circle-o', 'tv-o', 'volume', 'volume-o', 'live',
    'eye', 'eye-o', 'closed-eye', 'umbrella-circle', 'replay',
  ],
  商品其他: [
    'shop', 'shop-o', 'goods-collect', 'goods-collect-o', 'graphic', 'wap-home', 'wap-home-o',
    'wap-nav', 'weapp-nav', 'desktop-o', 'hotel-o', 'home-o', 'bar-chart-o',
    'chart-trending-o', 'apps-o', 'discount', 'discount-o', 'new', 'new-o',
    'new-arrival', 'new-arrival-o', 'hot-sale', 'hot-sale-o', 'flag-o',
  ],
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name?: string
  size?: string | number
  color?: string
  dot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  name: '',
  size: 'inherit',
  color: 'inherit',
  dot: false,
})

// ponytail: size 无单位时默认补 px，字符串已带单位(如 rem/rpx)原样输出
const iconStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.size) {
    const s = String(props.size)
    style.fontSize = /^\d+(\.\d+)?$/.test(s) ? `${s}px` : s
  }
  if (props.color) style.color = props.color
  return style
})
</script>

<style lang="scss" scoped>
@import '../../scss/variables';

// ponytail: iconfont.cn 项目(Project id 5222155) base64 woff2 内嵌，避免外链字体请求；在线链接仅供调试，生产应下载字体包自托管备份
// ceiling: 图标集变更时从 iconfont.cn 该项目重新导出并替换 base64 与回退链接；若字体内码与下方 &--name:before 的 codepoint 不一致，图标需同步校正
@font-face {
  font-family: 'ddktv-icon';
  font-weight: 400;
  font-style: normal;
  font-display: auto;
  src:
    url('data:font/woff2;charset=utf-8;base64,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') format('woff2'),
    url('//at.alicdn.com/t/c/font_5222155_fmv3szxrdin.woff?t=1788711022506')
      format('woff'),
    url('//at.alicdn.com/t/c/font_5222155_fmv3szxrdin.ttf?t=1788711022506')
      format('truetype');}

.dd-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'ddktv-icon';
  font-size: inherit;
  font-style: normal;
  line-height: 1;
  vertical-align: middle;

  &:before {
    font-family: inherit;
  }

  &--dot {
    position: relative;
  }

  &--dot::after {
    content: '';
    position: absolute;
    top: -$dd-space-1;
    right: -$dd-space-1;
    width: 12rpx;
    height: 12rpx;
    background: var(--dd-error, #{$dd-error});
    border-radius: 50%;
  }

  &--notes:before { content: '\e6a1'; }
  &--records:before { content: '\e69f'; }
  &--cash-back-record:before { content: '\e62f'; }
  &--newspaper:before { content: '\e69a'; }
  &--discount:before { content: '\e632'; }
  &--completed:before { content: '\e6f8'; }
  &--user:before { content: '\e65b'; }
  &--description:before { content: '\e6dd'; }
  &--arrow-double-left:before { content: '\e725'; }
  &--arrow-double-right:before { content: '\e71f'; }
  &--list-switching:before { content: '\e66e'; }
  &--add-square:before { content: '\e629'; }
  &--add:before { content: '\e729'; }
  &--arrow-down:before { content: '\e723'; }
  &--arrow-up:before { content: '\e71e'; }
  &--arrow:before { content: '\e724'; }
  &--after-sale:before { content: '\e726'; }
  &--add-o:before { content: '\e628'; }
  &--alipay:before { content: '\e728'; }
  &--ascending:before { content: '\e722'; }
  &--apps-o:before { content: '\e62a'; }
  &--aim:before { content: '\e727'; }
  &--award:before { content: '\e62b'; }
  &--arrow-left:before { content: '\e721'; }
  &--award-o:before { content: '\e720'; }
  &--audio:before { content: '\e71d'; }
  &--bag-o:before { content: '\e70c'; }
  &--balance-list:before { content: '\e71a'; }
  &--back-top:before { content: '\e71c'; }
  &--bag:before { content: '\e71b'; }
  &--balance-pay:before { content: '\e712'; }
  &--balance-o:before { content: '\e711'; }
  &--bar-chart-o:before { content: '\e719'; }
  &--bars:before { content: '\e70a'; }
  &--balance-list-o:before { content: '\e70b'; }
  &--birthday-cake-o:before { content: '\e714'; }
  &--bookmark:before { content: '\e710'; }
  &--bill:before { content: '\e62c'; }
  &--bell:before { content: '\e715'; }
  &--browsing-history-o:before { content: '\e62d'; }
  &--browsing-history:before { content: '\e718'; }
  &--bookmark-o:before { content: '\e716'; }
  &--bulb-o:before { content: '\e704'; }
  &--bullhorn-o:before { content: '\e717'; }
  &--bill-o:before { content: '\e713'; }
  &--calendar-o:before { content: '\e708'; }
  &--brush-o:before { content: '\e70f'; }
  &--card:before { content: '\e70e'; }
  &--cart-o:before { content: '\e709'; }
  &--cart-circle:before { content: '\e70d'; }
  &--cart-circle-o:before { content: '\e62e'; }
  &--cart:before { content: '\e706'; }
  &--cash-on-deliver:before { content: '\e702'; }
  &--cash-back-record-o:before { content: '\e705'; }
  &--cashier-o:before { content: '\e707'; }
  &--chart-trending-o:before { content: '\e630'; }
  &--certificate:before { content: '\e701'; }
  &--chat:before { content: '\e700'; }
  &--clear:before { content: '\e6f4'; }
  &--chat-o:before { content: '\e6ff'; }
  &--checked:before { content: '\e6fe'; }
  &--clock:before { content: '\e6fc'; }
  &--clock-o:before { content: '\e6fd'; }
  &--close:before { content: '\e6f1'; }
  &--closed-eye:before { content: '\e6f3'; }
  &--circle:before { content: '\e6ef'; }
  &--cluster-o:before { content: '\e6f7'; }
  &--column:before { content: '\e6fb'; }
  &--comment-circle-o:before { content: '\e6f9'; }
  &--cluster:before { content: '\e6fa'; }
  &--comment:before { content: '\e6e6'; }
  &--comment-o:before { content: '\e6f2'; }
  &--comment-circle:before { content: '\e6f0'; }
  &--completed-o:before { content: '\e631'; }
  &--credit-pay:before { content: '\e6eb'; }
  &--coupon:before { content: '\e6ec'; }
  &--debit-pay:before { content: '\e6ed'; }
  &--coupon-o:before { content: '\e6ee'; }
  &--contact-o:before { content: '\e6e4'; }
  &--descending:before { content: '\e6de'; }
  &--desktop-o:before { content: '\e6df'; }
  &--diamond-o:before { content: '\e6e9'; }
  &--description-o:before { content: '\e6ea'; }
  &--delete:before { content: '\e6e5'; }
  &--diamond:before { content: '\e6f5'; }
  &--delete-o:before { content: '\e6e8'; }
  &--cross:before { content: '\e6e7'; }
  &--edit:before { content: '\e6d5'; }
  &--ellipsis:before { content: '\e6e0'; }
  &--down:before { content: '\e6e1'; }
  &--discount-o:before { content: '\e6e2'; }
  &--ecard-pay:before { content: '\e6d0'; }
  &--list-switch:before { content: '\e6b3'; }
  &--envelop-o:before { content: '\e6db'; }
  &--exchange:before { content: '\e6d7'; }
  &--eye:before { content: '\e6e3'; }
  &--enlarge:before { content: '\e6da'; }
  &--expand-o:before { content: '\e6dc'; }
  &--eye-o:before { content: '\e6b1'; }
  &--expand:before { content: '\e6d4'; }
  &--filter-o:before { content: '\e6c6'; }
  &--fire:before { content: '\e6d2'; }
  &--fail:before { content: '\e6d8'; }
  &--failure:before { content: '\e6d6'; }
  &--fire-o:before { content: '\e633'; }
  &--flag-o:before { content: '\e6cb'; }
  &--font:before { content: '\e6a5'; }
  &--font-o:before { content: '\e6cf'; }
  &--gem-o:before { content: '\e6c5'; }
  &--flower-o:before { content: '\e6c3'; }
  &--gem:before { content: '\e6cc'; }
  &--gift-card:before { content: '\e6ba'; }
  &--friends:before { content: '\e6c7'; }
  &--friends-o:before { content: '\e6d9'; }
  &--gold-coin:before { content: '\e634'; }
  &--gold-coin-o:before { content: '\e6c1'; }
  &--good-job-o:before { content: '\e6a8'; }
  &--gift:before { content: '\e6a7'; }
  &--gift-o:before { content: '\e6bf'; }
  &--gift-card-o:before { content: '\e6bd'; }
  &--good-job:before { content: '\e6ce'; }
  &--home-o:before { content: '\e6d1'; }
  &--goods-collect:before { content: '\e6ca'; }
  &--graphic:before { content: '\e6c8'; }
  &--goods-collect-o:before { content: '\e6bc'; }
  &--hot-o:before { content: '\e6b4'; }
  &--info:before { content: '\e6d3'; }
  &--hotel-o:before { content: '\e6ac'; }
  &--info-o:before { content: '\e6cd'; }
  &--hot-sale-o:before { content: '\e6a9'; }
  &--hot:before { content: '\e636'; }
  &--like:before { content: '\e6b2'; }
  &--idcard:before { content: '\e6c9'; }
  &--invitation:before { content: '\e635'; }
  &--like-o:before { content: '\e6bb'; }
  &--hot-sale:before { content: '\e6c4'; }
  &--location-o:before { content: '\e6aa'; }
  &--location:before { content: '\e63f'; }
  &--label:before { content: '\e6c0'; }
  &--lock:before { content: '\e688'; }
  &--label-o:before { content: '\e6c2'; }
  &--map-marked:before { content: '\e6b6'; }
  &--logistics:before { content: '\e6be'; }
  &--manager:before { content: '\e650'; }
  &--more:before { content: '\e6b0'; }
  &--live:before { content: '\e66c'; }
  &--manager-o:before { content: '\e637'; }
  &--medal:before { content: '\e6af'; }
  &--more-o:before { content: '\e678'; }
  &--music-o:before { content: '\e6ab'; }
  &--music:before { content: '\e6ad'; }
  &--new-arrival-o:before { content: '\e645'; }
  &--medal-o:before { content: '\e66b'; }
  &--new-o:before { content: '\e66a'; }
  &--free-postage:before { content: '\e6b7'; }
  &--newspaper-o:before { content: '\e6a3'; }
  &--new-arrival:before { content: '\e66d'; }
  &--minus:before { content: '\e68c'; }
  &--orders-o:before { content: '\e638'; }
  &--new:before { content: '\e6a0'; }
  &--paid:before { content: '\e68d'; }
  &--notes-o:before { content: '\e6a6'; }
  &--other-pay:before { content: '\e668'; }
  &--pause-circle:before { content: '\e6a2'; }
  &--pause:before { content: '\e669'; }
  &--pause-circle-o:before { content: '\e6a4'; }
  &--peer-pay:before { content: '\e695'; }
  &--pending-payment:before { content: '\e640'; }
  &--passed:before { content: '\e6ae'; }
  &--plus:before { content: '\e666'; }
  &--phone-circle-o:before { content: '\e692'; }
  &--phone-o:before { content: '\e698'; }
  &--printer:before { content: '\e69b'; }
  &--photo-fail:before { content: '\e68b'; }
  &--phone:before { content: '\e64e'; }
  &--photo-o:before { content: '\e69c'; }
  &--play-circle:before { content: '\e667'; }
  &--play:before { content: '\e694'; }
  &--phone-circle:before { content: '\e647'; }
  &--point-gift-o:before { content: '\e642'; }
  &--point-gift:before { content: '\e665'; }
  &--play-circle-o:before { content: '\e641'; }
  &--shrink:before { content: '\e676'; }
  &--photo:before { content: '\e652'; }
  &--qr:before { content: '\e660'; }
  &--qr-invalid:before { content: '\e690'; }
  &--question-o:before { content: '\e662'; }
  &--revoke:before { content: '\e699'; }
  &--replay:before { content: '\e685'; }
  &--service:before { content: '\e696'; }
  &--question:before { content: '\e69e'; }
  &--search:before { content: '\e63a'; }
  &--refund-o:before { content: '\e643'; }
  &--service-o:before { content: '\e693'; }
  &--scan:before { content: '\e646'; }
  &--share:before { content: '\e691'; }
  &--send-gift-o:before { content: '\e663'; }
  &--share-o:before { content: '\e684'; }
  &--setting:before { content: '\e661'; }
  &--points:before { content: '\e648'; }
  &--photograph:before { content: '\e69d'; }
  &--shop:before { content: '\e67a'; }
  &--shop-o:before { content: '\e689'; }
  &--shop-collect-o:before { content: '\e655'; }
  &--shop-collect:before { content: '\e67f'; }
  &--smile:before { content: '\e68f'; }
  &--shopping-cart-o:before { content: '\e687'; }
  &--sign:before { content: '\e65a'; }
  &--sort:before { content: '\e682'; }
  &--star-o:before { content: '\e64b'; }
  &--smile-comment-o:before { content: '\e683'; }
  &--stop:before { content: '\e65e'; }
  &--stop-circle-o:before { content: '\e63b'; }
  &--smile-o:before { content: '\e67d'; }
  &--star:before { content: '\e679'; }
  &--success:before { content: '\e68a'; }
  &--stop-circle:before { content: '\e656'; }
  &--records-o:before { content: '\e639'; }
  &--shopping-cart:before { content: '\e67b'; }
  &--tosend:before { content: '\e65c'; }
  &--todo-list:before { content: '\e686'; }
  &--thumb-circle-o:before { content: '\e67e'; }
  &--thumb-circle:before { content: '\e67c'; }
  &--umbrella-circle:before { content: '\e644'; }
  &--underway:before { content: '\e65f'; }
  &--upgrade:before { content: '\e65d'; }
  &--todo-list-o:before { content: '\e658'; }
  &--tv-o:before { content: '\e64a'; }
  &--underway-o:before { content: '\e651'; }
  &--user-o:before { content: '\e659'; }
  &--vip-card-o:before { content: '\e63c'; }
  &--vip-card:before { content: '\e653'; }
  &--send-gift:before { content: '\e68e'; }
  &--wap-home:before { content: '\e63e'; }
  &--wap-nav:before { content: '\e673'; }
  &--volume-o:before { content: '\e657'; }
  &--video:before { content: '\e670'; }
  &--wap-home-o:before { content: '\e674'; }
  &--volume:before { content: '\e675'; }
  &--warning:before { content: '\e64c'; }
  &--weapp-nav:before { content: '\e672'; }
  &--wechat-pay:before { content: '\e671'; }
  &--warning-o:before { content: '\e654'; }
  &--wechat:before { content: '\e63d'; }
  &--setting-o:before { content: '\e680'; }
  &--warn-o:before { content: '\e64f'; }
  &--smile-comment:before { content: '\e681'; }
  &--user-circle-o:before { content: '\e649'; }
  &--video-o:before { content: '\e677'; }
  &--shield-o:before { content: '\e664'; }
  &--guide-o:before { content: '\e6b9'; }
  &--cash-o:before { content: '\e703'; }
  &--qq:before { content: '\e697'; }
  &--wechat-moments:before { content: '\e64d'; }
  &--weibo:before { content: '\e66f'; }
  &--link-o:before { content: '\e6b5'; }
  &--miniprogram-o:before { content: '\e6b8'; }
  &--contact:before { content: '\e6f6'; }
}
</style>