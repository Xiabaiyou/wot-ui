<template>
  <view
    ref="elRef"
    class="wd-drag-sort-item"
    :class="[{ 'is-dragging-active': isDraggingActive }, customClass]"
    :style="[itemStyle, customStyle]"
    :data-index="index"
    :data-width="myRect.width"
    :data-height="myRect.height"
    :data-duration="duration"
    :id="elementId"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
    @touchmove="handleTouchMove"
  >
    <slot></slot>
  </view>
</template>

<script lang="ts">
export default {
  name: 'wd-drag-sort-item',
  options: {
    addGlobalClass: true,
    // #ifndef MP-TOUTIAO
    virtualHost: true,
    // #endif
    styleIsolation: 'shared'
  }
}
</script>

<script lang="ts" setup>
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref, watch, type CSSProperties } from 'vue'
import { useChildren } from '../../composables/useChildren'
import { useParent } from '../../composables/useParent'
import { DRAG_SORT_KEY } from '../wd-drag-sort/types'
import { getDistance, getTouch } from '../wd-drag-sort/utils'
import { DRAG_SORT_ITEM_KEY, dragSortItemProps, type DragSortItemExpose } from './types'

const props = defineProps(dragSortItemProps)

const { parent } = useParent(DRAG_SORT_KEY)
const { linkChildren } = useChildren(DRAG_SORT_ITEM_KEY)
const { proxy } = getCurrentInstance() as any

const myRect = ref({ left: 0, top: 0, width: 0, height: 0 })
const elRef = ref(null)
const isDraggingActive = ref(false)
const syncedStyle = ref<Record<string, any>>({})
let isHandleTriggered = false

const elementId = computed(() => {
  if (parent.value?.componentId) {
    return `${parent.value.componentId}-item-${props.index}`
  }

  return `wd-drag-sort-item-${props.index}`
})

const duration = computed(() => {
  return parent.value?.props.longPressDuration ?? 200
})

const targetRect = computed(() => {
  if (!parent.value?.isReady.value) return null
  return parent.value.getPosition(props.index)
})

watch(
  () => targetRect.value,
  (position) => {
    if (position) {
      myRect.value = { ...myRect.value, ...position }
    }
  },
  { deep: true, immediate: true }
)

watch(
  () => parent.value?.getItemStyle(props.index),
  (newStyle) => {
    syncedStyle.value = newStyle || {}
  },
  { deep: true, immediate: true }
)

const itemStyle = computed<CSSProperties>(() => {
  return {
    boxSizing: 'border-box',
    ...syncedStyle.value
  }
})

const getRect = () => {
  return new Promise((resolve) => {
    const query = uni.createSelectorQuery().in(proxy)
    query
      .select(`#${elementId.value}`)
      .boundingClientRect((data: any) => {
        if (data) {
          data.dataset = data.dataset || {}
          data.dataset.index = props.index
          resolve(data)
        } else {
          resolve(null)
        }
      })
      .exec()
  })
}

defineExpose<DragSortItemExpose>({
  getRect
})

onMounted(() => {
  if (!parent.value) {
    console.error('[wot ui] warning(wd-drag-sort-item): <wd-drag-sort-item> 必须在 <wd-drag-sort> 中使用。')
  }
})

onBeforeUnmount(() => {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
})

let longPressTimer: ReturnType<typeof setTimeout> | null = null
let touchStartPosition = { x: 0, y: 0 }

const startDragLogic = (event: any) => {
  if (!parent.value?.isReady.value) return
  if (parent.value.props.disabled || props.disabled || !props.sortable) return

  const touch = getTouch(event)
  touchStartPosition = { x: touch.clientX, y: touch.clientY }

  const durationValue = parent.value.props.longPressDuration
  if (durationValue > 0) {
    longPressTimer = setTimeout(() => {
      isDraggingActive.value = true
      parent.value?.onDragStart(props.index, touch)
      longPressTimer = null
    }, durationValue)
  } else {
    isDraggingActive.value = true
    parent.value.onDragStart(props.index, touch)
  }
}

const onTouchStart = (event: any) => {
  if (event.__handledByHandle) return

  if (parent.value?.props.useDragHandle) {
    if (!isHandleTriggered) {
      return
    }
  }

  isHandleTriggered = false
  startDragLogic(event)
}

const onHandleTouch = (event: any) => {
  if (parent.value?.props.useDragHandle) {
    isHandleTriggered = true
    startDragLogic(event)
    event.__handledByHandle = true
  }
}

const handleTouchMove = (event: any) => {
  if (!parent.value) return

  if (event.stopPropagation) {
    event.stopPropagation()
  }

  if (isDraggingActive.value && event.preventDefault) {
    event.preventDefault()
  }

  const touch = getTouch(event)

  if (isDraggingActive.value && parent.value.draggedIndex.value === props.index) {
    parent.value.onDragMove(touch)
    return
  }

  const movedDistance = getDistance(touch.clientX, touch.clientY, touchStartPosition.x, touchStartPosition.y)
  if (parent.value.props.longPressDuration > 0 && longPressTimer && movedDistance > 15) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

const onTouchEnd = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }

  if (isDraggingActive.value) {
    isDraggingActive.value = false
    parent.value?.onDragEnd()

    const currentStyle = parent.value?.getItemStyle(props.index)
    if (currentStyle) {
      syncedStyle.value = currentStyle
    }
  }
}

linkChildren({ onHandleTouch })
</script>

<style lang="scss">
@use './index.scss';
</style>
