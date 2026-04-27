import type { ExtractPropTypes, InjectionKey, PropType, Ref } from 'vue'
import { baseProps, makeBooleanProp, makeNumberProp, makeRequiredProp, makeStringProp } from '../../common/props'

export type DragSortSortType = 'move' | 'swap'

export type DragSortScrollArea = {
  top?: number
  bottom?: number
  height?: number
}

export const dragSortProps = {
  ...baseProps,
  modelValue: makeRequiredProp(Array as PropType<any[]>),
  realtime: makeBooleanProp(false),
  edgeThreshold: makeNumberProp(50),
  scrollSpeed: makeNumberProp(10),
  scrollTop: makeNumberProp(0),
  feedback: makeBooleanProp(true),
  disabled: makeBooleanProp(false),
  scrollArea: Object as PropType<DragSortScrollArea>,
  longPressDuration: makeNumberProp(100),
  useDragHandle: makeBooleanProp(false),
  placeholderClass: makeStringProp(''),
  sortType: makeStringProp<DragSortSortType>('move'),
  strict: makeBooleanProp(false)
}

export type DragSortProps = ExtractPropTypes<typeof dragSortProps>

export type DragSortChangeDetail = {
  oldIndex: number
  newIndex: number
}

export type DragSortScrollDetail = {
  dx: number
  dy: number
}

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

export type DragSortExpose = {
  init: () => Promise<void>
}

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
