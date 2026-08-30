// 车牌号键盘纯逻辑：键位布局、按位锁键、光标推进（供 dd-car-keyboard.vue 消费）
export const MAX_LEN = 8

export interface KeyItem {
	label: string
	locked: boolean
}

// 省份行（参考实现末行含字母 W 为笔误，此处修正为 港/澳）
export const PROVINCE_ROWS: string[][] = [
	['京', '津', '晋', '冀', '蒙', '辽', '吉', '黑', '沪'],
	['苏', '浙', '皖', '闽', '赣', '鲁', '豫', '鄂', '湘'],
	['粤', '桂', '琼', '渝', '川', '贵', '云', '藏'],
	['陕', '甘', '青', '宁', '新', '港', '澳']
]

const DIGIT_ROW = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
const EN_ROW2_DEFAULT = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'O', 'P', '挂']
// 第 6 位（新能源序号位）去掉 O，追加 学/挂
const EN_ROW2_ENERGY = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'P', '学', '挂']
const EN_ROW3 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '警']
const EN_ROW4 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '港', '澳']

// 按位锁键：1 位禁数字与特殊字；2-5/7 位禁 O 与特殊字；6 位（新能源）仅禁 O
export function getLockedKeys(pos: number): string[] {
	if (pos <= 0) return []
	if (pos === 1) return [...DIGIT_ROW, '学', '挂', '警', '港', '澳']
	if (pos === MAX_LEN - 2) return ['O']
	return ['O', '学', '挂', '警', '港', '澳']
}

// pos=0 返回省份键盘，其余位返回字母数字键盘（带锁定态）
export function getKeyRows(pos: number): KeyItem[][] {
	if (pos === 0) {
		return PROVINCE_ROWS.map((row) => row.map((label) => ({ label, locked: false })))
	}
	const row2 = pos === MAX_LEN - 2 ? EN_ROW2_ENERGY : EN_ROW2_DEFAULT
	const locked = getLockedKeys(pos)
	return [DIGIT_ROW, row2, EN_ROW3, EN_ROW4].map((row) =>
		row.map((label) => ({ label, locked: locked.includes(label) }))
	)
}

// 填完第 7 位后收起键盘（返回 -1），新能源位（第 8 位）由用户主动点选
export function nextPos(pos: number): number {
	return pos < MAX_LEN - 2 ? pos + 1 : -1
}
