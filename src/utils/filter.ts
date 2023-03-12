import { timeOptions, flagOptions } from '@/services/consult'
import type { IllnessTime } from '@/enums'
// 在枚举中找对应就诊状态
const getConsultFlagText = (flag: 0 | 1) => {
  return flagOptions.find((item) => item.value === flag)?.label
}
// 在枚举对象中找到对应时间文本
const getIllnessTimeText = (timeId: IllnessTime) => {
  return timeOptions.find((item) => {
    return item.value === timeId
  })?.label
}
export { getConsultFlagText, getIllnessTimeText }
