import type { ComponentPublicInstance, ExtractPropTypes, PropType } from 'vue'
import { baseProps, makeBooleanProp, makeStringProp } from '../../common/props'
import { defaultColorFormats, defaultQuickColorPresets } from './constants'

/**
 * 颜色输出格式
 */
export type ColorPickerFormat = 'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla'

/**
 * 颜色选择器模式
 */
export type ColorPickerMode = 'basic' | 'advanced'

/**
 * 颜色色块形状
 */
export type ColorPickerShape = 'circle' | 'square'

/**
 * 预设颜色项
 */
export type ColorPickerPreset = {
  /** 颜色名称 */
  label: string
  /** 颜色值 */
  value: string
}

/**
 * 内部 HSV 颜色模型
 */
export type ColorPickerHsv = {
  /** 色相，范围 0-360 */
  h: number
  /** 饱和度，范围 0-100 */
  s: number
  /** 明度，范围 0-100 */
  v: number
  /** 透明度，范围 0-1 */
  a: number
}

/**
 * RGB 颜色模型
 */
export type ColorPickerRgb = {
  /** 红色，范围 0-255 */
  r: number
  /** 绿色，范围 0-255 */
  g: number
  /** 蓝色，范围 0-255 */
  b: number
  /** 透明度，范围 0-1 */
  a: number
}

/**
 * HSL 颜色模型
 */
export type ColorPickerHsl = {
  /** 色相，范围 0-360 */
  h: number
  /** 饱和度，范围 0-100 */
  s: number
  /** 亮度，范围 0-100 */
  l: number
  /** 透明度，范围 0-1 */
  a: number
}

export { defaultColorFormats, defaultQuickColorPresets }

export const colorPickerProps = {
  ...baseProps,
  /**
   * 绑定的颜色值
   * 类型: string
   * 默认值: '#2f65f6'
   */
  modelValue: makeStringProp('#2f65f6'),
  /**
   * 标题
   * 类型: string
   * 默认值: ''
   */
  title: makeStringProp(''),
  /**
   * 颜色输出格式
   * 类型: ColorPickerFormat
   * 可选值: 'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla'
   * 默认值: 'hex'
   */
  format: makeStringProp<ColorPickerFormat>('hex'),
  /**
   * 可切换的颜色输出格式列表
   * 类型: ColorPickerFormat[]
   * 默认值: defaultColorFormats
   */
  formats: {
    type: Array as PropType<ColorPickerFormat[]>,
    default: () => defaultColorFormats
  },
  /**
   * 颜色选择器面板模式
   * 类型: ColorPickerMode
   * 可选值: 'basic' | 'advanced'
   * 默认值: 'advanced'
   */
  mode: makeStringProp<ColorPickerMode>('advanced'),
  /**
   * 底部快捷色块列表
   * 类型: ColorPickerPreset[]
   * 默认值: defaultQuickColorPresets
   */
  quickPresets: {
    type: Array as PropType<ColorPickerPreset[]>,
    default: () => defaultQuickColorPresets
  },
  /**
   * 底部快捷色块形状
   * 类型: ColorPickerShape
   * 可选值: 'circle' | 'square'
   * 默认值: 'square'
   */
  quickPresetShape: makeStringProp<ColorPickerShape>('square'),
  /**
   * 是否支持透明度
   * 类型: boolean
   * 默认值: true
   */
  showAlpha: makeBooleanProp(true),
  /**
   * 是否显示当前颜色预览
   * 类型: boolean
   * 默认值: true
   */
  showPreview: makeBooleanProp(true),
  /**
   * 是否显示颜色值输入框
   * 类型: boolean
   * 默认值: true
   */
  showInput: makeBooleanProp(true),
  /**
   * 是否显示输出格式切换
   * 类型: boolean
   * 默认值: true
   */
  showFormatSwitch: makeBooleanProp(true),
  /**
   * 是否显示复制颜色按钮
   * 类型: boolean
   * 默认值: true
   */
  showCopy: makeBooleanProp(true),
  /**
   * 是否禁用
   * 类型: boolean
   * 默认值: false
   */
  disabled: makeBooleanProp(false),
  /**
   * 是否只读
   * 类型: boolean
   * 默认值: false
   */
  readonly: makeBooleanProp(false)
}

/**
 * 颜色选择器事件类型定义
 */
export type ColorPickerEmits = {
  /** 更新绑定值时触发 */
  'update:modelValue': [value: string]
  /** 更新输出格式时触发 */
  'update:format': [value: ColorPickerFormat]
  /** 颜色变化时触发 */
  change: [value: string]
  /** 自定义颜色变化时触发 */
  customChange: [value: string]
  /** 复制颜色值成功时触发 */
  copy: [value: string]
}

/**
 * 颜色选择器暴露方法
 */
export type ColorPickerExpose = {
  /** 重新测量面板尺寸 */
  updateRect: () => void
}

export type ColorPickerProps = ExtractPropTypes<typeof colorPickerProps>

export type ColorPickerInstance = ComponentPublicInstance<ColorPickerExpose, ColorPickerProps>
