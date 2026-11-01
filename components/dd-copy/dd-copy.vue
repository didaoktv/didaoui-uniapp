<template>
	<view @click="handleClick">
        <slot>复制</slot>
    </view>
</template>
<script setup lang="ts">
interface Props {
    content?: string
    alertStyle?: string
    notice?: string
}

const props = withDefaults(defineProps<Props>(), {
    content: '',
    alertStyle: 'toast',
    notice: '复制成功',
})

const emit = defineEmits<{ (e: 'success'): void }>()

function handleClick() {
    let content: any = props.content;
	if (!content) {
		uni.showToast({
		    title: "暂无",
		    icon: 'none',
		    duration: 2000,
		});
		return false;
	}
    content = typeof content === 'string' ? content : content.toString() // 复制内容，必须字符串，数字需要转换为字符串
    /**
	* 复制逻辑
	*/
    uni.setClipboardData({
        data: content,
        success: function() {
			if (props.alertStyle == 'modal') {
				uni.showModal({
					title: "提示",
					content: props.notice
				});
			} else {
				uni.showToast({
				    title: props.notice,
				    icon: 'none'
				});
			}
			emit('success');
        },
        fail:function(){
            uni.showToast({
                title: "复制失败",
                icon: 'none',
                duration:3000,
            });
        }
    });
}

defineExpose({ handleClick })
</script>

<style lang="scss" scoped>
@import '../../scss/variables';
@import '../../scss/mixins';
</style>
