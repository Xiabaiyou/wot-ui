import type { ComponentPublicInstance, ExtractPropTypes } from 'vue'
import { baseProps } from '../../common/props'

export const dragHandleProps = {
  ...baseProps
}

export type DragHandleProps = ExtractPropTypes<typeof dragHandleProps>

/**
 * 拖拽手柄组件实例类型。
 */
export type DragHandleInstance = ComponentPublicInstance<DragHandleProps>
