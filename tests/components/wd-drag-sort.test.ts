import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import WdDragHandle from '@/uni_modules/wot-ui/components/wd-drag-handle/wd-drag-handle.vue'
import WdDragSort from '@/uni_modules/wot-ui/components/wd-drag-sort/wd-drag-sort.vue'
import WdDragSortItem from '@/uni_modules/wot-ui/components/wd-drag-sort-item/wd-drag-sort-item.vue'
import { findClosestSlot, getScrollDirection, moveArrayItem, swapArrayItem } from '@/uni_modules/wot-ui/components/wd-drag-sort/utils'

const globalComponents = {
  WdDragSortItem,
  WdDragHandle
}

function createSelectorQueryMock() {
  let selector = ''
  let callback: ((rect: any) => void) | null = null

  const getRectBySelector = (value: string) => {
    if (value.includes('item-0')) {
      return { left: 0, top: 0, width: 80, height: 80 }
    }

    if (value.includes('item-1')) {
      return { left: 88, top: 0, width: 80, height: 80 }
    }

    if (value.includes('item-2')) {
      return { left: 176, top: 0, width: 80, height: 80 }
    }

    return { left: 0, top: 0, width: 256, height: 80 }
  }

  const query = {
    in() {
      return query
    },
    select(value: string) {
      selector = value
      return query
    },
    boundingClientRect(cb: (rect: any) => void) {
      callback = cb
      return query
    },
    exec() {
      callback?.(getRectBySelector(selector))
      return query
    }
  }

  return query
}

describe('WdDragSort', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('uni', {
      getWindowInfo: vi.fn(() => ({ windowHeight: 640 })),
      getSystemInfoSync: vi.fn(() => ({ windowHeight: 640 })),
      createSelectorQuery: vi.fn(() => createSelectorQueryMock()),
      onWindowResize: vi.fn(),
      offWindowResize: vi.fn(),
      vibrateShort: vi.fn()
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  test('基本渲染并暴露 init 方法', async () => {
    const list = [
      { id: '1', text: 'Item 1' },
      { id: '2', text: 'Item 2' },
      { id: '3', text: 'Item 3' }
    ]

    const wrapper = mount(WdDragSort, {
      props: {
        modelValue: list
      },
      global: {
        components: globalComponents
      },
      slots: {
        default: `
          <wd-drag-sort-item :index="0">
            <view class="drag-item">Item 1</view>
          </wd-drag-sort-item>
          <wd-drag-sort-item :index="1">
            <view class="drag-item">Item 2</view>
          </wd-drag-sort-item>
          <wd-drag-sort-item :index="2">
            <view class="drag-item">Item 3</view>
          </wd-drag-sort-item>
        `
      }
    })

    await vi.runAllTimersAsync()
    await flushPromises()

    expect(wrapper.classes()).toContain('wd-drag-sort')
    expect(typeof (wrapper.vm as any).init).toBe('function')
  })

  test('自定义拖拽手柄渲染', async () => {
    const wrapper = mount(WdDragSort, {
      props: {
        modelValue: [{ id: '1', text: 'Item 1' }],
        useDragHandle: true
      },
      global: {
        components: globalComponents
      },
      slots: {
        default: `
          <wd-drag-sort-item :index="0">
            <view>
              <wd-drag-handle>
                <view class="custom-handle">drag</view>
              </wd-drag-handle>
            </view>
          </wd-drag-sort-item>
        `
      }
    })

    await vi.runAllTimersAsync()
    await flushPromises()

    expect(wrapper.find('.custom-handle').exists()).toBe(true)
  })

  test('开启 useDragHandle 后仅手柄可以启动拖拽', async () => {
    const wrapper = mount(WdDragSort, {
      props: {
        modelValue: [{ id: '1', text: 'Item 1' }],
        useDragHandle: true
      },
      global: {
        components: globalComponents
      },
      slots: {
        default: `
          <wd-drag-sort-item :index="0">
            <view class="drag-item">
              <view class="drag-content">content</view>
              <wd-drag-handle>
                <view class="custom-handle">drag</view>
              </wd-drag-handle>
            </view>
          </wd-drag-sort-item>
        `
      }
    })

    await vi.runAllTimersAsync()
    await flushPromises()

    await wrapper.find('.drag-item').trigger('touchstart', {
      touches: [{ clientX: 10, clientY: 10 }]
    })
    await vi.advanceTimersByTimeAsync(120)

    expect(wrapper.emitted('drag-start')).toBeFalsy()

    await wrapper.find('.wd-drag-handle').trigger('touchstart', {
      touches: [{ clientX: 10, clientY: 10 }]
    })
    await vi.advanceTimersByTimeAsync(120)

    expect(wrapper.emitted('drag-start')).toHaveLength(1)
  })

  test('H5 桌面端鼠标不会触发触摸拖拽链路', async () => {
    const wrapper = mount(WdDragSort, {
      props: {
        modelValue: [{ id: '1', text: 'Item 1' }],
        useDragHandle: true
      },
      global: {
        components: globalComponents
      },
      slots: {
        default: `
          <wd-drag-sort-item :index="0">
            <view class="drag-item">
              <wd-drag-handle>
                <view class="custom-handle">drag</view>
              </wd-drag-handle>
            </view>
          </wd-drag-sort-item>
        `
      }
    })

    await vi.runAllTimersAsync()
    await flushPromises()

    await wrapper.find('.wd-drag-handle').trigger('mousedown', {
      clientX: 10,
      clientY: 10,
      button: 0
    })
    await vi.advanceTimersByTimeAsync(120)

    expect(wrapper.emitted('drag-start')).toBeFalsy()
  })

  test('无效组合会给出警告', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mount(WdDragSort, {
      props: {
        modelValue: [],
        sortType: 'move',
        realtime: true,
        strict: true
      }
    })

    expect(errorSpy).toHaveBeenCalled()
  })

  test('工具函数行为正确', () => {
    expect(moveArrayItem([0, 1, 2], 0, 2)).toEqual([1, 2, 0])
    expect(swapArrayItem([0, 1, 2], 0, 2)).toEqual([2, 1, 0])
    expect(
      findClosestSlot({ x: 10, y: 10 }, [
        { left: 0, top: 0, width: 20, height: 20 },
        { left: 100, top: 0, width: 20, height: 20 }
      ]).index
    ).toBe(0)
    expect(getScrollDirection(5, 0, 100, 10)).toBe(-1)
    expect(getScrollDirection(95, 0, 100, 10)).toBe(1)
    expect(getScrollDirection(50, 0, 100, 10)).toBe(0)
  })
})
