import type { ColorPickerFormat, ColorPickerHsl, ColorPickerHsv, ColorPickerRgb } from './types'

const ALPHA_FORMATS: ColorPickerFormat[] = ['hexa', 'rgba', 'hsla']
const RGB_FORMATS: ColorPickerFormat[] = ['rgb', 'rgba']

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function round(value: number, precision = 0): number {
  const ratio = Math.pow(10, precision)
  return Math.round(value * ratio) / ratio
}

function normalizeHex(value: string): string {
  const hex = value.trim().replace(/^#/, '')
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    return `#${hex
      .split('')
      .map((item) => item + item)
      .join('')}`.toLowerCase()
  }
  if (/^[0-9a-fA-F]{4}$/.test(hex)) {
    return `#${hex
      .split('')
      .map((item) => item + item)
      .join('')}`.toLowerCase()
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return `#${hex}`.toLowerCase()
  }
  if (/^[0-9a-fA-F]{8}$/.test(hex)) {
    return `#${hex}`.toLowerCase()
  }
  return ''
}

export function parseColor(value: string): ColorPickerRgb | null {
  const color = value.trim()

  if (color.toLowerCase() === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0 }
  }

  const hex = normalizeHex(color)

  if (hex) {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
      a: hex.length === 9 ? round(parseInt(hex.slice(7, 9), 16) / 255, 2) : 1
    }
  }

  const rgbaMatch = color.match(/^rgba?\((.+)\)$/i)
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(',').map((item) => item.trim())
    if (parts.length < 3) return null

    const r = Number(parts[0])
    const g = Number(parts[1])
    const b = Number(parts[2])
    const a = parts.length > 3 ? Number(parts[3]) : 1

    if ([r, g, b, a].some((item) => Number.isNaN(item))) return null

    return {
      r: clamp(Math.round(r), 0, 255),
      g: clamp(Math.round(g), 0, 255),
      b: clamp(Math.round(b), 0, 255),
      a: clamp(a, 0, 1)
    }
  }

  const hslaMatch = color.match(/^hsla?\((.+)\)$/i)
  if (!hslaMatch) return null

  const hslParts = hslaMatch[1].split(',').map((item) => item.trim())
  if (hslParts.length < 3) return null

  const h = Number(hslParts[0].replace(/deg$/i, ''))
  const s = Number(hslParts[1].replace(/%$/, ''))
  const l = Number(hslParts[2].replace(/%$/, ''))
  const hslAlpha = hslParts.length > 3 ? Number(hslParts[3]) : 1

  if ([h, s, l, hslAlpha].some((item) => Number.isNaN(item))) return null

  return hslToRgb({
    h,
    s: clamp(s, 0, 100),
    l: clamp(l, 0, 100),
    a: clamp(hslAlpha, 0, 1)
  })
}

export function rgbToHsv(color: ColorPickerRgb): ColorPickerHsv {
  const r = color.r / 255
  const g = color.g / 255
  const b = color.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let h = 0

  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6
    } else if (max === g) {
      h = (b - r) / delta + 2
    } else {
      h = (r - g) / delta + 4
    }
    h *= 60
    if (h < 0) h += 360
  }

  return {
    h: round(h, 2),
    s: max === 0 ? 0 : round((delta / max) * 100, 2),
    v: round(max * 100, 2),
    a: color.a
  }
}

export function hsvToRgb(color: ColorPickerHsv): ColorPickerRgb {
  const h = ((color.h % 360) + 360) % 360
  const s = clamp(color.s, 0, 100) / 100
  const v = clamp(color.v, 0, 100) / 100
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0
  let g = 0
  let b = 0

  if (h < 60) {
    r = c
    g = x
  } else if (h < 120) {
    r = x
    g = c
  } else if (h < 180) {
    g = c
    b = x
  } else if (h < 240) {
    g = x
    b = c
  } else if (h < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a: clamp(color.a, 0, 1)
  }
}

export function rgbToHex(color: ColorPickerRgb, alpha = false): string {
  const toHex = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0')
  const hex = `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`
  return alpha ? `${hex}${toHex(color.a * 255)}` : hex
}

export function rgbToHsl(color: ColorPickerRgb): ColorPickerHsl {
  const r = color.r / 255
  const g = color.g / 255
  const b = color.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1))

    if (max === r) {
      h = ((g - b) / delta) % 6
    } else if (max === g) {
      h = (b - r) / delta + 2
    } else {
      h = (r - g) / delta + 4
    }

    h *= 60
    if (h < 0) h += 360
  }

  return {
    h: round(h),
    s: round(s * 100),
    l: round(l * 100),
    a: color.a
  }
}

export function hslToRgb(color: ColorPickerHsl): ColorPickerRgb {
  const h = ((color.h % 360) + 360) % 360
  const s = clamp(color.s, 0, 100) / 100
  const l = clamp(color.l, 0, 100) / 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0

  if (h < 60) {
    r = c
    g = x
  } else if (h < 120) {
    r = x
    g = c
  } else if (h < 180) {
    g = c
    b = x
  } else if (h < 240) {
    g = x
    b = c
  } else if (h < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a: clamp(color.a, 0, 1)
  }
}

export function formatColor(color: ColorPickerHsv, format: ColorPickerFormat, showAlpha: boolean): string {
  const rgb = hsvToRgb(color)
  const alpha = round(showAlpha ? rgb.a : 1, 2)

  if (format === 'hex') {
    return rgbToHex(rgb)
  }

  if (format === 'hexa') {
    return rgbToHex({ ...rgb, a: alpha }, true)
  }

  if (format === 'rgba') {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
  }

  if (format === 'rgb') {
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  }

  if (format === 'hsl' || format === 'hsla') {
    const hsl = rgbToHsl(rgb)
    if (format === 'hsla') {
      return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha})`
    }
    return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
  }

  return rgbToHex(rgb)
}

export function colorToHsv(value: string, fallback: ColorPickerHsv): ColorPickerHsv {
  const rgb = parseColor(value)
  return rgb ? rgbToHsv(rgb) : fallback
}

export function formatAlpha(value: number): string {
  return Number(value.toFixed(2)).toString()
}

export function getInputValue(event: any): string {
  return event.detail?.value ?? event.target?.value ?? ''
}

export function getNumericInputValue(key: string, value: string): string {
  if (key === 'a') {
    const numeric = value.replace(/[^\d.]/g, '')
    const [integer = '', ...decimal] = numeric.split('.')
    return decimal.length ? `${integer}.${decimal.join('')}` : integer
  }

  return value.replace(/\D/g, '')
}

export function getTouchPoint(event: any): any {
  return event.touches?.[0] || event.changedTouches?.[0] || event.detail || event
}

export function getPercentByRect(event: any, rect: UniApp.NodeInfo | null, vertical = false): number {
  if (!rect) return 0
  const point = getTouchPoint(event)
  const clientKey = vertical ? 'clientY' : 'clientX'
  const pageKey = vertical ? 'pageY' : 'pageX'
  const fallbackKey = vertical ? 'y' : 'x'
  const start = Number(vertical ? rect.top : rect.left)
  const size = Number(vertical ? rect.height : rect.width)
  const current = Number(point[clientKey] ?? point[pageKey] ?? point[fallbackKey] ?? 0)
  if (!size) return 0
  return clamp(((current - start) / size) * 100, 0, 100)
}

export function isSameColor(value: string, target: string): boolean {
  const color = parseColor(value)
  const targetColor = parseColor(target)
  if (!color || !targetColor) return value === target
  return rgbToHex(color) === rgbToHex(targetColor) && round(color.a, 2) === round(targetColor.a, 2)
}

export function isTransparentColor(value: string): boolean {
  return value.trim().toLowerCase() === 'transparent'
}

export function isAlphaFormat(format: ColorPickerFormat): boolean {
  return ALPHA_FORMATS.includes(format)
}

export function isRgbFormat(format: ColorPickerFormat): boolean {
  return RGB_FORMATS.includes(format)
}
