import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import WdColorPicker from '@/uni_modules/wot-ui/components/wd-color-picker/wd-color-picker.vue'
import { defaultQuickColorPresets } from '@/uni_modules/wot-ui/components/wd-color-picker/constants'
import { colorToHsv, formatColor, parseColor } from '@/uni_modules/wot-ui/components/wd-color-picker/utils'
import { describe, expect, test, vi } from 'vitest'

function mountColorPicker(options: Record<string, any> = {}) {
  return mount(WdColorPicker, options)
}

describe('WdColorPicker', () => {
  test('基本渲染', () => {
    const wrapper = mountColorPicker()

    expect(wrapper.classes()).toContain('wd-color-picker')
    expect(wrapper.find('.wd-color-picker__title').exists()).toBeFalsy()
    expect(wrapper.find('.wd-color-picker__preset-list').exists()).toBeFalsy()
    expect(wrapper.find('.wd-color-picker__custom-panel').exists()).toBeTruthy()
  })

  test('传入 title 时展示标题', () => {
    const wrapper = mountColorPicker({
      props: {
        title: '选择主题色'
      }
    })

    expect(wrapper.find('.wd-color-picker__title').text()).toBe('选择主题色')
  })

  test('自定义颜色会默认展示自定义面板', () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: 'rgba(142, 43, 226, 0.92)',
        format: 'rgba'
      }
    })

    expect(wrapper.find('.wd-color-picker__custom-panel').exists()).toBeTruthy()
    expect(wrapper.find('.wd-color-picker__palette').exists()).toBeTruthy()
    expect(wrapper.find('.wd-color-picker__slider--hue').exists()).toBeTruthy()
    expect(wrapper.find('.wd-color-picker__slider--alpha').exists()).toBeTruthy()
    expect(wrapper.find('.wd-color-picker__preview').exists()).toBeTruthy()
    expect(wrapper.find('.wd-color-picker__input').exists()).toBeTruthy()
    expect(wrapper.find('.wd-color-picker__copy').exists()).toBeTruthy()
    expect(wrapper.find('.wd-color-picker__format-switch').exists()).toBeTruthy()
    expect(wrapper.find('.wd-color-picker__format-switch').text()).toBe('RGBA')
    expect(wrapper.find('.wd-color-picker__format-label').exists()).toBeFalsy()
    expect(wrapper.findAll('.wd-color-picker__quick-color').length).toBe(19)
    expect(wrapper.find('.wd-color-picker__quick-color.is-transparent').exists()).toBeTruthy()
  })

  test('组件不渲染内置上方预设色', () => {
    const wrapper = mountColorPicker()

    expect(wrapper.find('.wd-color-picker__preset-list').exists()).toBeFalsy()
    expect(wrapper.find('.wd-color-picker__preset').exists()).toBeFalsy()
    expect(wrapper.find('.wd-color-picker__custom-panel').exists()).toBeTruthy()
  })

  test('mode basic 展示自定义色板但隐藏高级控制项', () => {
    const wrapper = mountColorPicker({
      props: {
        mode: 'basic',
        modelValue: 'rgba(142, 43, 226, 0.92)'
      }
    })

    expect(wrapper.find('.wd-color-picker__preset-list').exists()).toBeFalsy()
    expect(wrapper.find('.wd-color-picker__custom-panel').exists()).toBeTruthy()
    expect(wrapper.find('.wd-color-picker__palette').exists()).toBeTruthy()
    expect(wrapper.find('.wd-color-picker__preview').exists()).toBeFalsy()
    expect(wrapper.find('.wd-color-picker__input').exists()).toBeFalsy()
    expect(wrapper.find('.wd-color-picker__format-switch').exists()).toBeFalsy()
  })

  test('showAlpha 为 false 时隐藏透明度滑条', () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: '#8a2be2',
        showAlpha: false
      }
    })

    expect(wrapper.find('.wd-color-picker__slider--alpha').exists()).toBeFalsy()
  })

  test('showAlpha 为 false 时关闭透明格式和透明色块', () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: 'rgba(142, 43, 226, 0.92)',
        format: 'rgba',
        showAlpha: false
      }
    })

    const popover = wrapper.findComponent({ name: 'wd-popover' })

    expect(wrapper.find('.wd-color-picker__format-switch').text()).toBe('十六进制')
    expect((popover.props('content') as any[]).map((item) => item.content)).toEqual(['十六进制', 'RGB', 'HSL'])
    expect(wrapper.find('.wd-color-picker__quick-color.is-transparent').exists()).toBeFalsy()
    expect((wrapper.vm as any).outputValue).toBe('#8e2be2')
  })

  test('disabled 状态阻止交互', async () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: '#2f65f6',
        disabled: true
      }
    })

    await wrapper.findAll('.wd-color-picker__quick-color')[1].trigger('click')

    expect(wrapper.classes()).toContain('is-disabled')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  test('输入颜色值会更新当前颜色', async () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: '#8a2be2'
      }
    })

    ;(wrapper.vm as any).handleInput({ detail: { value: '#ff0000' } })
    ;(wrapper.vm as any).handleInputConfirm()

    const updates = wrapper.emitted('update:modelValue') as any[]
    expect(updates).toBeTruthy()
    expect(updates[updates.length - 1][0]).toBe('#ff0000')
  })

  test('格式切换会触发 update:format 并按新格式输出', () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: '#ff0000'
      }
    })

    ;(wrapper.vm as any).handleFormatClick('rgba')

    const formatUpdates = wrapper.emitted('update:format') as any[]
    const valueUpdates = wrapper.emitted('update:modelValue') as any[]
    expect(formatUpdates[0][0]).toBe('rgba')
    expect(valueUpdates[valueUpdates.length - 1][0]).toBe('rgba(255, 0, 0, 1)')
  })

  test('格式切换控件通过 popover 支持 hex、hexa、rgb、rgba、hsl 和 hsla 切换', () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: '#ff0000'
      }
    })

    expect(wrapper.find('.wd-color-picker__format-switch').text()).toBe('十六进制')
    expect(wrapper.findComponent({ name: 'wd-popover' }).exists()).toBeTruthy()

    const vm = wrapper.vm as any
    vm.handleFormatMenuClick({ index: 1 })
    vm.handleFormatMenuClick({ index: 2 })
    vm.handleFormatMenuClick({ index: 3 })
    vm.handleFormatMenuClick({ index: 4 })
    vm.handleFormatMenuClick({ index: 5 })
    vm.handleFormatMenuClick({ index: 0 })

    const formatUpdates = wrapper.emitted('update:format') as any[]
    const valueUpdates = wrapper.emitted('update:modelValue') as any[]
    expect(formatUpdates.map((item) => item[0])).toEqual(['hexa', 'rgb', 'rgba', 'hsl', 'hsla', 'hex'])
    expect(valueUpdates[valueUpdates.length - 6][0]).toBe('#ff0000ff')
    expect(valueUpdates[valueUpdates.length - 5][0]).toBe('rgb(255, 0, 0)')
    expect(valueUpdates[valueUpdates.length - 4][0]).toBe('rgba(255, 0, 0, 1)')
    expect(valueUpdates[valueUpdates.length - 3][0]).toBe('hsl(0, 100%, 50%)')
    expect(valueUpdates[valueUpdates.length - 2][0]).toBe('hsla(0, 100%, 50%, 1)')
    expect(valueUpdates[valueUpdates.length - 1][0]).toBe('#ff0000')
  })

  test('rgba 格式会展示通道输入框并支持修改通道值', () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: 'rgba(255, 0, 0, 0.5)',
        format: 'rgba'
      }
    })

    expect(wrapper.findAll('.wd-color-picker__input-item').length).toBe(4)
    expect(wrapper.findAll('.wd-color-picker__input-label').map((item) => item.text())).toEqual(['R', 'G', 'B', 'A'])
    expect(wrapper.findAllComponents({ name: 'wd-input' }).map((item) => item.props('type'))).toEqual(['number', 'number', 'number', 'digit'])
    expect(wrapper.findAllComponents({ name: 'wd-input' }).map((item) => item.props('clearable'))).toEqual([false, false, false, false])
    ;(wrapper.vm as any).handleChannelInput('g', { detail: { value: '12a8' } })
    ;(wrapper.vm as any).handleChannelConfirm()

    const updates = wrapper.emitted('update:modelValue') as any[]
    expect(updates[0][0]).toBe('rgba(255, 128, 0, 0.5)')
  })

  test('formats 支持自定义可切换格式列表', () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: '#ff0000',
        formats: ['hex', 'rgba']
      }
    })

    expect(wrapper.find('.wd-color-picker__format-switch').text()).toBe('十六进制')

    const vm = wrapper.vm as any
    vm.handleFormatMenuClick({ index: 1 })
    vm.handleFormatMenuClick({ index: 0 })

    const formatUpdates = wrapper.emitted('update:format') as any[]
    const valueUpdates = wrapper.emitted('update:modelValue') as any[]
    expect(formatUpdates.map((item) => item[0])).toEqual(['rgba', 'hex'])
    expect(valueUpdates[valueUpdates.length - 2][0]).toBe('rgba(255, 0, 0, 1)')
    expect(valueUpdates[valueUpdates.length - 1][0]).toBe('#ff0000')
  })

  test('可隐藏预览、输入框、复制按钮和格式切换', () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: '#8a2be2',
        showPreview: false,
        showInput: false,
        showCopy: false,
        showFormatSwitch: false
      }
    })

    expect(wrapper.find('.wd-color-picker__preview').exists()).toBeFalsy()
    expect(wrapper.find('.wd-color-picker__input').exists()).toBeFalsy()
    expect(wrapper.find('.wd-color-picker__copy').exists()).toBeFalsy()
    expect(wrapper.find('.wd-color-picker__format-switch').exists()).toBeFalsy()
  })

  test('点击复制按钮会复制当前颜色值并触发 copy', async () => {
    const setClipboardData = vi.fn(({ success }) => success?.())
    ;(uni as any).setClipboardData = setClipboardData
    const wrapper = mountColorPicker({
      props: {
        modelValue: 'rgba(162, 81, 230, 0.92)',
        format: 'rgba'
      }
    })

    await wrapper.find('.wd-color-picker__copy').trigger('click')

    expect(setClipboardData).toHaveBeenCalledWith(
      expect.objectContaining({
        data: 'rgba(162, 81, 230, 0.92)',
        showToast: false
      })
    )
    expect(wrapper.emitted('copy')?.[0]).toEqual(['rgba(162, 81, 230, 0.92)'])
  })

  test('快捷色块默认方形', () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: 'rgba(142, 43, 226, 0.92)'
      }
    })

    expect(wrapper.find('.wd-color-picker__quick-color').classes()).toContain('wd-color-picker__quick-color--square')
  })

  test('快捷色块支持切换为圆形', () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: 'rgba(142, 43, 226, 0.92)',
        quickPresetShape: 'circle'
      }
    })

    expect(wrapper.find('.wd-color-picker__quick-color').classes()).toContain('wd-color-picker__quick-color--circle')
  })

  test('色板点击会触发自定义颜色更新', async () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: 'rgba(142, 43, 226, 0.92)',
        format: 'rgba'
      }
    })

    await nextTick()
    await (wrapper.vm as any).updateRect()
    await (wrapper.vm as any).handleDragStart('palette', { clientX: 80, clientY: 20 })

    const updates = wrapper.emitted('update:modelValue') as any[]
    expect(updates).toBeTruthy()
    expect(updates[updates.length - 1][0]).toContain('rgba(')
    expect(wrapper.emitted('customChange')).toBeTruthy()
  })

  test('色板触摸支持 pageX 和 pageY 坐标', async () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: 'rgba(142, 43, 226, 0.92)',
        format: 'rgba'
      }
    })

    await nextTick()
    await (wrapper.vm as any).updateRect()
    await (wrapper.vm as any).handleDragStart('palette', { touches: [{ pageX: 40, pageY: 60 }] })

    expect(wrapper.find('.wd-color-picker__palette-thumb').attributes('style')).toContain('left: 40%; top: 60%;')
  })

  test('底部小色块会更新颜色并保持自定义面板展开', async () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: 'rgba(142, 43, 226, 0.92)',
        format: 'hex',
        quickPresets: [
          { label: '品牌蓝', value: '#2f65f6' },
          { label: '强调橙', value: '#ff7a00' }
        ]
      }
    })

    await wrapper.findAll('.wd-color-picker__quick-color')[1].trigger('click')

    const updates = wrapper.emitted('update:modelValue') as any[]
    expect(updates[0][0]).toBe('#ff7a00')
    expect(wrapper.find('.wd-color-picker__custom-panel').exists()).toBeTruthy()
  })

  test('点击底部透明色块会按当前格式输出透明色', async () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: 'rgba(142, 43, 226, 0.92)',
        format: 'hex'
      }
    })

    await wrapper.find('.wd-color-picker__quick-color.is-transparent').trigger('click')

    const updates = wrapper.emitted('update:modelValue') as any[]
    expect(updates[0][0]).toBe('#000000')
  })

  test('默认底部快捷色块包含透明色', () => {
    expect(defaultQuickColorPresets.length).toBe(19)
    expect(defaultQuickColorPresets.some((item) => item.value === 'transparent')).toBeTruthy()
  })

  test('颜色工具函数支持 hex、hexa、rgb、rgba、hsl 和 hsla', () => {
    expect(parseColor('transparent')).toEqual({ r: 0, g: 0, b: 0, a: 0 })
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(parseColor('#fff8')).toEqual({ r: 255, g: 255, b: 255, a: 0.53 })
    expect(parseColor('#ffffff80')).toEqual({ r: 255, g: 255, b: 255, a: 0.5 })
    expect(parseColor('rgb(10, 20, 30)')).toEqual({ r: 10, g: 20, b: 30, a: 1 })
    expect(parseColor('rgba(10, 20, 30, 0.5)')).toEqual({ r: 10, g: 20, b: 30, a: 0.5 })
    expect(parseColor('hsl(0, 100%, 50%)')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(parseColor('hsla(0, 100%, 50%, 0.5)')).toEqual({ r: 255, g: 0, b: 0, a: 0.5 })

    const hsv = colorToHsv('#ff0000', { h: 0, s: 0, v: 0, a: 1 })
    expect(formatColor(hsv, 'hex', false)).toBe('#ff0000')
    expect(formatColor({ ...hsv, a: 0.5 }, 'hex', true)).toBe('#ff0000')
    expect(formatColor({ ...hsv, a: 0.5 }, 'hexa', true)).toBe('#ff000080')
    expect(formatColor(hsv, 'rgb', false)).toBe('rgb(255, 0, 0)')
    expect(formatColor({ ...hsv, a: 0.5 }, 'rgba', true)).toBe('rgba(255, 0, 0, 0.5)')
    expect(formatColor(hsv, 'hsl', false)).toBe('hsl(0, 100%, 50%)')
    expect(formatColor({ ...hsv, a: 0.5 }, 'hsla', true)).toBe('hsla(0, 100%, 50%, 0.5)')
  })

  test('hue and alpha controls use wd-slider v-model to update color', async () => {
    const wrapper = mountColorPicker({
      props: {
        modelValue: 'rgba(255, 0, 0, 1)',
        format: 'rgba'
      }
    })

    const sliders = wrapper.findAllComponents({ name: 'wd-slider' })
    expect(sliders.length).toBe(2)

    await sliders[0].vm.$emit('update:modelValue', 120)
    await sliders[1].vm.$emit('update:modelValue', 50)

    const updates = wrapper.emitted('update:modelValue') as any[]
    expect(updates.map((item) => item[0])).toContain('rgba(0, 255, 0, 1)')
    expect(updates[updates.length - 1][0]).toBe('rgba(0, 255, 0, 0.5)')
  })
})
