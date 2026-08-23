const version = '3'

// 开发环境才提示，生产环境不会提示
if (process.env.NODE_ENV === 'development') {
	console.log(`\n %c DidaoUI V${version} %c https://didaoktv.com \n\n`, 'color: #ffffff; background: #3c9cff; padding:5px 0;', 'color: #3c9cff;background: #ffffff; padding:5px 0;');
}

export default {
    v: version,
    version,
    // 颜色部分，本来可以通过scss的:export导出供js使用，但是奈何nvue不支持
    color: {
        'primary': '#2979ff',
        'warning': '#ff9900',
        'success': '#19be6b',
        'error': '#fa3534',
        'info': '#909399',
        'main-color': '#303133',
        'content-color': '#606266',
        'tips-color': '#909399',
        'light-color': '#c0c4cc'
    },
	// 默认单位，可以通过配置为rpx，那么在用于传入组件大小参数为数值时，就默认为rpx
	unit: 'px'
}
