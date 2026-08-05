import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import WdQrCode from '@/uni_modules/wot-ui/components/wd-qr-code/wd-qr-code.vue'
import { generateQRCode, QRRSBlock, QRErrorCorrectLevel } from '@/uni_modules/wot-ui/components/wd-qr-code/qrcode.js'

const require = createRequire(import.meta.url)
const ReferenceQRCode = require(resolve('node_modules/.pnpm/qrcode-terminal@0.12.0/node_modules/qrcode-terminal/vendor/QRCode'))
const ReferenceQRErrorCorrectLevel = require(resolve(
  'node_modules/.pnpm/qrcode-terminal@0.12.0/node_modules/qrcode-terminal/vendor/QRCode/QRErrorCorrectLevel'
))

const drawMock = vi.fn()
const createLinearGradientMock = vi.fn(() => ({
  addColorStop: vi.fn()
}))

function createCanvasContextMock() {
  return {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    clip: vi.fn(),
    drawImage: vi.fn(),
    createLinearGradient: createLinearGradientMock,
    draw: drawMock,
    scale: vi.fn(),
    setFillStyle: vi.fn(),
    setStrokeStyle: vi.fn(),
    setLineWidth: vi.fn()
  }
}

function getExpectedCanvasSize(size: number) {
  const shouldUsePixelRatio = process.env.UNI_PLATFORM === 'mp-alipay'
  return size * (shouldUsePixelRatio ? uni.getSystemInfoSync().pixelRatio || 1 : 1)
}

function expectQRCodeMatrixToMatchReference(text: string, level: keyof typeof QRErrorCorrectLevel) {
  const result = generateQRCode(text, {
    errorCorrectLevel: QRErrorCorrectLevel[level]
  })
  const reference = new ReferenceQRCode(-1, ReferenceQRErrorCorrectLevel[level])

  reference.addData(text)
  reference.make()

  expect(result.typeNumber).toBe(reference.typeNumber)
  expect(result.moduleCount).toBe(reference.getModuleCount())

  for (let row = 0; row < result.moduleCount; row++) {
    for (let col = 0; col < result.moduleCount; col++) {
      expect(result.modules[row][col]).toBe(reference.isDark(row, col))
    }
  }
}

beforeAll(() => {
  ;(globalThis as any).uni = {
    ...(globalThis as any).uni,
    createCanvasContext: vi.fn(() => createCanvasContextMock()),
    canvasToTempFilePath: vi.fn((options: Record<string, any>) => {
      options.success?.({ tempFilePath: '/tmp/wd-qr-code.png', filePath: '/tmp/wd-qr-code.png' })
    }),
    getImageInfo: vi.fn((options: Record<string, any>) => {
      options.success?.({ path: options.src })
    })
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('WdQrCode', () => {
  test('generates valid version 5 QRCode for UUID with H correction level', () => {
    const text = '66d1a39d-7535-41bc-9a5b-469715a1a38e'
    const result = generateQRCode(text, {
      errorCorrectLevel: QRErrorCorrectLevel.H
    })
    const rsBlocks = QRRSBlock.getRSBlocks(result.typeNumber, result.errorCorrectLevel)

    expect(result.typeNumber).toBe(5)
    expect(result.moduleCount).toBe(37)
    expect(rsBlocks).toHaveLength(4)
    expect(rsBlocks.reduce((total, block) => total + block.totalCount, 0)).toBe(134)
  })

  test('matches reference matrix for ASCII content across correction levels', () => {
    const cases = [
      'https://wot-ui.cn',
      'https://wot-ui.cn/component/qr-code.html',
      'https://example.com/path/to/page?foo=bar&baz=qux#section-2',
      'https://api.example.com/pay?id=66d1a39d-7535-41bc-9a5b-469715a1a38e&amount=128.50&currency=CNY',
      'mailto:support@example.com?subject=wot-ui-qr-code',
      'tel:+8613800138000',
      'WIFI:T:WPA;S:wot-ui-demo;P:pa55word123;;',
      '{"id":"66d1a39d-7535-41bc-9a5b-469715a1a38e","scope":"qr-code","enabled":true}',
      'ORDER-20260805-000001|USER-10086|AMOUNT-128.50',
      'otpauth://totp/WotUI:demo@example.com?secret=JBSWY3DPEHPK3PXP&issuer=WotUI',
      '66d1a39d-7535-41bc-9a5b-469715a1a38e',
      'a'.repeat(100),
      '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    ]
    const levels: Array<keyof typeof QRErrorCorrectLevel> = ['L', 'M', 'Q', 'H']

    cases.forEach((text) => {
      levels.forEach((level) => {
        expectQRCodeMatrixToMatchReference(text, level)
      })
    })
  })

  test('generates stable UTF-8 matrices for non-ASCII content', () => {
    const cases = [
      { text: '中文二维码', expectedTypes: { L: 2, M: 2, Q: 2, H: 3 } },
      { text: '😀'.repeat(10), expectedTypes: { L: 3, M: 4, Q: 4, H: 5 } }
    ]
    const levels: Array<keyof typeof QRErrorCorrectLevel> = ['L', 'M', 'Q', 'H']

    cases.forEach(({ text, expectedTypes }) => {
      levels.forEach((level) => {
        const result = generateQRCode(text, {
          errorCorrectLevel: QRErrorCorrectLevel[level]
        })

        expect(result.typeNumber).toBe(expectedTypes[level])
        expect(result.moduleCount).toBe(result.typeNumber * 4 + 17)
        expect(result.modules).toHaveLength(result.moduleCount)
        expect(result.modules.every((row) => row.length === result.moduleCount)).toBe(true)
      })
    })
  })

  test('二维码算法使用 ESM 命名导出', () => {
    const result = generateQRCode('https://wot-ui.cn', {
      errorCorrectLevel: QRErrorCorrectLevel.M
    })

    expect(result.moduleCount).toBeGreaterThan(0)
    expect(result.modules).toHaveLength(result.moduleCount)
    expect(result.errorCorrectLevel).toBe(QRErrorCorrectLevel.M)
  })

  test('二维码算法不包含 CommonJS 导出', () => {
    const source = readFileSync(resolve('src/uni_modules/wot-ui/components/wd-qr-code/qrcode.js'), 'utf8')

    expect(source).not.toMatch(/\bmodule\.exports\b/)
  })

  test('基本渲染', async () => {
    const wrapper = mount(WdQrCode, {
      props: {
        text: 'https://wot-ui.cn'
      }
    })

    await Promise.resolve()
    await Promise.resolve()

    expect(wrapper.classes()).toContain('wd-qr-code')
    const canvas = wrapper.find('canvas')
    expect(canvas.exists()).toBe(true)
    expect(canvas.attributes('id')).toBeTruthy()
    expect(canvas.attributes('canvas-id')).toBe(canvas.attributes('id'))
    const expectedCanvasSize = String(getExpectedCanvasSize(200))
    expect(canvas.attributes('width')).toBe(expectedCanvasSize)
    expect(canvas.attributes('height')).toBe(expectedCanvasSize)
    expect(vi.mocked(uni.createCanvasContext).mock.calls[0][0]).toBe(canvas.attributes('id'))
    expect(drawMock).toHaveBeenCalledWith(false, expect.any(Function))

    const context = vi.mocked(uni.createCanvasContext).mock.results[0].value as ReturnType<typeof createCanvasContextMock>
    // 默认方块按连续区间合并绘制，避免支付宝模拟器逐码点传递 Canvas 指令。
    expect(context.fillRect.mock.calls.length).toBeLessThan(300)
  })

  test('圆角码点使用单次路径批量填充', async () => {
    mount(WdQrCode, {
      props: {
        text: 'https://wot-ui.cn',
        dotType: 'rounded'
      }
    })

    await Promise.resolve()
    await Promise.resolve()

    const context = vi.mocked(uni.createCanvasContext).mock.results[0].value as ReturnType<typeof createCanvasContextMock>
    expect(context.beginPath).toHaveBeenCalledTimes(1)
    expect(context.fill).toHaveBeenCalledTimes(1)
  })

  test('点击时触发 click 事件', async () => {
    const wrapper = mount(WdQrCode, {
      props: {
        text: 'https://wot-ui.cn'
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  test('支持导出二维码图片', async () => {
    const wrapper = mount(WdQrCode, {
      props: {
        text: 'https://wot-ui.cn',
        enableGradient: true,
        gradientColors: ['#111111', '#999999']
      }
    })

    await Promise.resolve()
    ;(wrapper.vm as any).$.setupState.pixelRatio = 2
    const tempFilePath = await (wrapper.vm as any).exportImage()
    const exportOptions = vi.mocked(uni.canvasToTempFilePath).mock.calls[0][0]

    expect(tempFilePath).toBe('/tmp/wd-qr-code.png')
    expect(uni.canvasToTempFilePath).toHaveBeenCalled()
    expect(exportOptions).toMatchObject({
      width: 400,
      height: 400,
      destWidth: 400,
      destHeight: 400
    })
    expect(createLinearGradientMock).toHaveBeenCalled()
  })
})
