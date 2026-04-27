import type { ExtractPropTypes, InjectionKey, PropType, Ref } from 'vue'
import { baseProps, makeBooleanProp, makeNumberProp, makeRequiredProp, makeStringProp } from '../../common/props'

export type DragSortSortType = 'move' | 'swap'

/**
 * 自动滚动区域配置。
 */
export type DragSortScrollArea = {
  top?: number
  bottom?: number
  height?: number
}

export const dragSortProps = {
  ...baseProps,
  /**
   * 绑定的排序数组。
   * 类型: any[]
   * 默认值: 必填
   */
  modelValue: makeRequiredProp(Array as PropType<any[]>),
  /**
   * 是否在拖拽过程中实时交换位置。
   * 类型: boolean
   * 默认值: false
   */
  realtime: makeBooleanProp(false),
  /**
   * 自动滚动触发阈值。
   * 类型: number
   * 默认值: 50
   */
  edgeThreshold: makeNumberProp(50),
  /**
   * 自动滚动速度。
   * 类型: number
   * 默认值: 10
   */
  scrollSpeed: makeNumberProp(10),
  /**
   * 当前滚动位置。
   * 类型: number
   * 默认值: 0
   */
  scrollTop: makeNumberProp(0),
  /**
   * 是否开启震动反馈。
   * 类型: boolean
   * 默认值: true
   */
  feedback: makeBooleanProp(true),
  /**
   * 是否禁用整个拖拽排序。
   * 类型: boolean
   * 默认值: false
   */
  disabled: makeBooleanProp(false),
  /**
   * 自定义自动滚动区域。
   * 类型: DragSortScrollArea
   * 默认值: undefined
   */
  scrollArea: Object as PropType<DragSortScrollArea>,
  /**
   * 长按多久后触发拖拽，单位毫秒。
   * 类型: number
   * 默认值: 100
   */
  longPressDuration: makeNumberProp(100),
  /**
   * 是否仅允许通过拖拽手柄触发拖拽。
   * 类型: boolean
   * 默认值: false
   */
  useDragHandle: makeBooleanProp(false),
  /**
   * 占位元素自定义类名。
   * 类型: string
   * 默认值: ''
   */
  placeholderClass: makeStringProp(''),
  /**
   * 排序模式。
   * 类型: DragSortSortType
   * 可选值: 'move' | 'swap'
   * 默认值: 'move'
   */
  sortType: makeStringProp<DragSortSortType>('move'),
  /**
   * 严格模式，仅允许尺寸相近的项交换。
   * 类型: boolean
   * 默认值: false
   */
  strict: makeBooleanProp(false)
}

export type DragSortProps = ExtractPropTypes<typeof dragSortProps>

/**
 * 排序变化事件明细。
 */
export type DragSortChangeDetail = {
  oldIndex: number
  newIndex: number
}

/**
 * 自动滚动事件明细。
 */
export type DragSortScrollDetail = {
  dx: number
  dy: number
}

/**
 * 拖拽过程事件明细。
 */
export type DragSortDraggingDetail = {
  index: number
  delta: {
    x: number
    y: number
  }
  touch: {
    clientX: number
    clientY: number
  }
}

/**
 * 组件对外暴露的方法。
 */
export type DragSortExpose = {
  init: () => Promise<void>
}

/**
 * 提供给子项组件的上下文能力。
 */
export type DragSortProvide = {
  props: DragSortProps
  isReady: Ref<boolean>
  draggedIndex: Ref<number>
  componentId: string
  register: (index: number, helper: any, sortable: boolean) => void
  unregister: (index: number) => void
  onDragStart: (index: number, touch: any, rect?: any) => void
  onDragMove: (touch: any) => void
  onDragEnd: () => void
  getPosition: (index: number) => any
  getItemStyle: (index: number) => any
  getCurrentPosition: (index: number) => any
}

export const DRAG_SORT_KEY: InjectionKey<DragSortProvide> = Symbol.for('wd-drag-sort')
