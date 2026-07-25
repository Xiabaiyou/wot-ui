import type { ColorPickerFormat, ColorPickerPreset } from './types'

export const defaultQuickColorPresets: ColorPickerPreset[] = [
  { label: '珊瑚红', value: '#ff3b30' },
  { label: '玫红', value: '#e91e63' },
  { label: '洋红', value: '#d81b60' },
  { label: '深紫', value: '#673ab7' },
  { label: '靛蓝', value: '#3f51b5' },
  { label: '钴蓝', value: '#1565c0' },
  { label: '天蓝', value: '#3aa7f0' },
  { label: '青色', value: '#24c6dc' },
  { label: '松石绿', value: '#26a69a' },
  { label: '森林绿', value: '#2e7d32' },
  { label: '草绿', value: '#7bc043' },
  { label: '青柠', value: '#a3e635' },
  { label: '明黄', value: '#ffe600' },
  { label: '琥珀', value: '#ffc107' },
  { label: '金橙', value: '#fb8c00' },
  { label: '橘红', value: '#ff5722' },
  { label: '冷灰', value: '#8e8e93' },
  { label: '墨黑', value: '#1d1f29' },
  { label: '透明', value: 'transparent' }
]

export const defaultColorFormats: ColorPickerFormat[] = ['hex', 'hexa', 'rgb', 'rgba', 'hsl', 'hsla']
