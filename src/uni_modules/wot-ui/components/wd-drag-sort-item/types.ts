import type { ComponentPublicInstance, ExtractPropTypes, InjectionKey } from 'vue'
import { baseProps, makeBooleanProp, makeRequiredProp } from '../../common/props'

export const dragSortItemProps = {
  ...baseProps,
  /**
   * 当前项索引。
   * 类型: number
   * 默认值: 必填
   */
  index: makeRequiredProp(Number),
  /**
   * 是否禁用当前项拖拽。
   * 类型: boolean
   * 默认值: false
   */
  disabled: makeBooleanProp(false),
  /**
   * 当前项是否参与排序。
   * 类型: boolean
   * 默认值: true
   */
  sortable: makeBooleanProp(true)
}

export type DragSortItemProps = ExtractPropTypes<typeof dragSortItemProps>

/**
 * 子项组件对外暴露的方法。
 */
export type DragSortItemExpose = {
  getRect: () => Promise<any>
}

export type DragSortItemInstance = ComponentPublicInstance<DragSortItemProps>

export type DragSortItemProvide = {
  onHandleTouch: (event: any) => void
}

export const DRAG_SORT_ITEM_KEY: InjectionKey<DragSortItemProvide> = Symbol('wd-drag-sort-item')
