<template>
	<view @click="handleClick">
        <slot>{{ t("dd.common.copy") }}</slot>
    </view>
</template>
<script>
import { t } from '../../libs/i18n'
export default {
    name: "up-copy",
    props: {
        content: {
            type: String,
            default: ''
        },
		alertStyle: {
			type: String,
			default: 'toast'
		},
		notice: {
			type: String,
			default: t("dd.common.copy") + t("dd.common.success")
		}
    },
	emits: ['success'],
    methods: {
		t,
        handleClick() {
            let content = this.content;
			if (!content) {
				uni.showToast({
				    title: t("dd.common.none"),
				    icon: 'none',
				    duration: 2000,
				});
				return false;
			}
            content = typeof content === 'string' ? content : content.toString() // 复制内容，必须字符串，数字需要转换为字符串
            /**
			* 复制逻辑
			*/
			let that = this;
            uni.setClipboardData({
                data: content,
                success: function() {
					if (that.alertStyle == 'modal') {
						uni.showModal({
							title: t("dd.common.tip"),
							content: that.notice
						});
					} else {
						uni.showToast({
						    title: that.notice,
						    icon: 'none'
						});
					}
					that.$emit('success');
                },
                fail:function(){
                    uni.showToast({
                        title: t("dd.common.copy") + t("dd.common.fail"),
                        icon: 'none',
                        duration:3000,
                    });
                }
            });
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/dd-shared';
</style>
