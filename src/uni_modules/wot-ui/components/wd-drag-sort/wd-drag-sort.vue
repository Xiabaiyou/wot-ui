<template>
  <view :id="componentId" class="wd-drag-sort" :class="[{ 'is-dragging': draggedIndex > -1 }, customClass]" :style="[customStyle]">
    <view v-if="draggedIndex > -1 && currentSlotStyle" class="wd-drag-sort__placeholder" :class="placeholderClass" :style="currentSlotStyle">
      <slot name="placeholder"></slot>
    </view>
    <slot></slot>
  </view>
</template>

<script lang="ts">
export default {
  name: 'wd-drag-sort',
  options: {
    // #ifndef MP-TOUTIAO
    virtualHost: true,
    // #endif
    addGlobalClass: true,
    styleIsolation: 'shared'
  }
}
</script>

<script lang="ts" setup>
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch, type CSSProperties } from 'vue'
import { useChildren } from '../../composables/useChildren'
import { clamp, findClosestSlot, generateId, getScrollDirection, moveArrayItem, swapArrayItem, throttle } from './utils'
import {
  DRAG_SORT_KEY,
  dragSortProps,
  type DragSortChangeDetail,
  type DragSortDraggingDetail,
  type DragSortExpose,
  type DragSortProvide,
  type DragSortScrollDetail
} from './types'
import type { DragSortItemInstance } from '../wd-drag-sort-item/types'

type DragSortEmits = {
  'update:modelValue': [value: any[]]
  change: [value: any[], detail: DragSortChangeDetail]
  scroll: [detail: DragSortScrollDetail]
  'drag-start': [index: number]
  'drag-end': []
  dragging: [detail: DragSortDraggingDetail]
}

const props = defineProps(dragSortProps)
const emit = defineEmits<DragSortEmits>()

const { proxy } = getCurrentInstance() as any
const { linkChildren, children } = useChildren<DragSortItemInstance, DragSortProvide>(DRAG_SORT_KEY)

const componentId = generateId()
const noop = () => undefined
const DRAG_MOVE_THROTTLE = 30
const LAYOUT_RETRY_LIMIT = 3
const LAYOUT_RETRY_DELAY = 50
const DRAG_END_COMMIT_DELAY = 300

const isReady = ref(false)
const containerHeight = ref<number | string>('auto')
const containerWidth = ref(0)
const items = reactive<Record<number, any>>({})

const slots = ref<any[]>([])
const itemToSlot = ref<number[]>([])
const draggedIndex = ref(-1)
const dragDelta = reactive({ x: 0, y: 0 })
const dragStartScrollTop = ref(0)
const innerScrollTop = ref(0)
const windowHeight = ref(0)

linkChildren({
  props,
  isReady,
  draggedIndex,
  componentId,
  register: () => {},
  unregister: () => {},
  onDragStart,
  onDragMove,
  onDragEnd,
  getPosition,
  getItemStyle,
  getCurrentPosition
})

defineExpose<DragSortExpose>({
  init: dragInit
})

const currentSlotStyle = computed<CSSProperties | null>(() => {
  if (draggedIndex.value === -1) return null

  const slotIndex = itemToSlot.value[draggedIndex.value]
  if (slotIndex === undefined) return null

  const slot = slots.value[slotIndex]
  if (!slot) return null

  return {
    position: 'absolute',
    left: `${slot.left}px`,
    top: `${slot.top}px`,
    width: `${slot.width}px`,
    height: `${slot.height}px`
  }
})

let initDebounceTimer: ReturnType<typeof setTimeout> | null = null
let layoutRetryTimer: ReturnType<typeof setTimeout> | null = null
let layoutRetryCount = 0

/**
 * 初始化容器与子项位置信息。
 */
function dragInit() {
  try {
    const sys = uni.getWindowInfo ? uni.getWindowInfo() : uni.getSystemInfoSync()
    windowHeight.value = sys.windowHeight
  } catch (error) {
    void error
  }

  return new Promise<void>((resolve) => {
    const query = uni.createSelectorQuery().in(proxy)
    query
      .select(`#${componentId}`)
      .boundingClientRect((containerRect: any) => {
        if (!containerRect) {
          const retryQuery = uni.createSelectorQuery().in(proxy)
          retryQuery
            .select('.wd-drag-sort')
            .boundingClientRect((retryRect: any) => {
              if (retryRect) {
                handleLayoutHelper(retryRect).then(resolve)
              } else {
                retryLayout()
                resolve()
              }
            })
            .exec()
          return
        }

        handleLayoutHelper(containerRect).then(resolve)
      })
      .exec()
  })
}

const retryLayout = () => {
  if (layoutRetryCount >= LAYOUT_RETRY_LIMIT) {
    return
  }

  layoutRetryCount += 1
  if (layoutRetryTimer) {
    clearTimeout(layoutRetryTimer)
  }

  layoutRetryTimer = setTimeout(() => {
    layoutRetryTimer = null
    dragInit()
  }, LAYOUT_RETRY_DELAY)
}

const handleLayoutHelper = (containerRect: any) => {
  return new Promise<void>((resolve) => {
    const promises: Promise<any>[] = []

    children.forEach((child) => {
      const current = child as any
      const getRect = current.getRect || current.$?.exposed?.getRect
      if (getRect) {
        promises.push(getRect())
      } else {
        console.warn('[wot ui] warning(wd-drag-sort): child has no getRect method', child)
      }
    })

    Promise.all(promises).then((results) => {
      const validRects = results.filter(Boolean)
      handleLayout(containerRect, validRects)
      resolve()
    })
  })
}

const handleLayout = (containerRect: any, itemRects: any[]) => {
  if (!containerRect || !itemRects?.length) {
    retryLayout()
    return
  }

  layoutRetryCount = 0
  if (layoutRetryTimer) {
    clearTimeout(layoutRetryTimer)
    layoutRetryTimer = null
  }

  containerWidth.value = containerRect.width
  const newSlots: any[] = []
  let maxBottom = 0

  const oldItems = { ...items }
  const oldSlots = [...slots.value]
  const oldItemToSlot = [...itemToSlot.value]
  const currentDraggedIndex = draggedIndex.value
  const currentInnerScrollTop = innerScrollTop.value
  const currentDragStartScrollTop = dragStartScrollTop.value

  draggedIndex.value = -1
  dragDelta.x = 0
  dragDelta.y = 0

  Object.keys(items).forEach((key) => {
    delete items[Number(key)]
  })

  itemRects.forEach((rect) => {
    const index = Number(rect.dataset?.index)
    if (Number.isNaN(index)) return

    let offsetX = 0
    let offsetY = 0

    if (!isSilentUpdate.value && oldItems[index]) {
      if (index === currentDraggedIndex) {
        offsetX = dragDelta.x
        offsetY = dragDelta.y + (currentInnerScrollTop - currentDragStartScrollTop)
      } else {
        const slotIndex = oldItemToSlot[index]
        if (slotIndex !== undefined && oldSlots[slotIndex]) {
          const slot = oldSlots[slotIndex]
          const oldRect = oldItems[index]
          if (slot && oldRect) {
            offsetX = slot.left - oldRect.left
            offsetY = slot.top - oldRect.top
          }
        }
      }
    }

    items[index] = {
      left: rect.left - containerRect.left - offsetX,
      top: rect.top - containerRect.top - offsetY,
      width: rect.width,
      height: rect.height
    }
  })

  Object.keys(items).forEach((key) => {
    const rect = items[Number(key)]
    if (rect.top + rect.height > maxBottom) {
      maxBottom = rect.top + rect.height
    }
  })

  const sortedIndices = Object.keys(items)
    .map(Number)
    .sort((a, b) => a - b)

  sortedIndices.forEach((index) => {
    newSlots.push({ ...items[index] })
  })

  slots.value = newSlots
  containerHeight.value = maxBottom
  itemToSlot.value = sortedIndices.map((_, index) => index)
  isReady.value = true
}

let startX = 0
let startY = 0
let autoScrollTimer: ReturnType<typeof setTimeout> | null = null
let updateTimer: ReturnType<typeof setTimeout> | null = null
let silentTimer: ReturnType<typeof setTimeout> | null = null
let dragMoveLastTime = 0
let pendingOrder: any[] | null = null
let pendingChangeDetail: DragSortChangeDetail | null = null
const touchOffset = ref<any>(null)
const currentTouch = reactive({ x: 0, y: 0 })

const onWindowResize = () => {
  isReady.value = false
  nextTick(() => {
    dragInit()
  })
}

onMounted(() => {
  uni.onWindowResize(onWindowResize)
  nextTick(() => {
    dragInit()
  })
})

watch(draggedIndex, (value) => {
  // #ifdef H5
  document.body.style.overflow = value > -1 ? 'hidden' : ''
  // #endif
})

watch(
  () => [props.sortType, props.realtime, props.strict],
  () => {
    if (props.sortType === 'move' && props.realtime && props.strict) {
      console.error('[wot ui] warning(wd-drag-sort): sort-type="move" 暂不支持开启 realtime + strict。')
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  draggedIndex.value = -1
  uni.offWindowResize(onWindowResize)
  stopAutoScroll()

  if (layoutRetryTimer) {
    clearTimeout(layoutRetryTimer)
    layoutRetryTimer = null
  }

  if (initDebounceTimer) {
    clearTimeout(initDebounceTimer)
    initDebounceTimer = null
  }

  if (updateTimer) {
    clearTimeout(updateTimer)
    updateTimer = null
  }

  if (silentTimer) {
    clearTimeout(silentTimer)
    silentTimer = null
  }

  layoutRetryCount = 0
  dragMoveLastTime = 0
  pendingOrder = null
  pendingChangeDetail = null

  // #ifdef H5
  document.body.style.overflow = ''
  // #endif
})

/**
 * 结束当前拖拽并重置内部状态。
 */
const cleanupDragState = (shouldEmitDragEnd = false) => {
  stopAutoScroll()
  draggedIndex.value = -1
  dragDelta.x = 0
  dragDelta.y = 0
  touchOffset.value = null

  if (shouldEmitDragEnd) {
    emit('drag-end')
  }
}

/**
 * 在父级 v-model 更新后静默重建布局，避免中间态闪动。
 */
const syncLayoutAfterChange = () => {
  isSilentUpdate.value = true

  if (silentTimer) {
    clearTimeout(silentTimer)
    silentTimer = null
  }

  nextTick(() => {
    itemToSlot.value = itemToSlot.value.map((_, index) => index)

    dragInit().then(() => {
      silentTimer = setTimeout(() => {
        isSilentUpdate.value = false
      }, 50)
    })
  })
}

/**
 * 提交拖拽排序结果，并在提交后静默同步布局。
 */
const flushPendingUpdate = () => {
  if (!pendingOrder || !pendingChangeDetail) {
    return
  }

  if (updateTimer) {
    clearTimeout(updateTimer)
    updateTimer = null
  }

  const nextOrder = pendingOrder
  const nextDetail = pendingChangeDetail

  pendingOrder = null
  pendingChangeDetail = null
  isInternalUpdate.value = true

  emit('update:modelValue', nextOrder)
  emit('change', nextOrder, nextDetail)
  emit('drag-end')

  syncLayoutAfterChange()
}

function onDragStart(index: number, touch: any, rect: any = null) {
  if (pendingOrder) {
    flushPendingUpdate()
  }

  if (!isReady.value) return

  draggedIndex.value = index
  startX = touch.clientX
  startY = touch.clientY

  if (rect) {
    touchOffset.value = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    }
    currentTouch.x = touch.clientX
    currentTouch.y = touch.clientY
  } else {
    touchOffset.value = null
  }

  dragDelta.x = 0
  dragDelta.y = 0

  if (Math.abs(innerScrollTop.value - props.scrollTop) > 5) {
    innerScrollTop.value = props.scrollTop
  }

  dragStartScrollTop.value = innerScrollTop.value

  // #ifndef H5
  if (props.feedback) {
    try {
      uni.vibrateShort({
        fail: noop
      })
    } catch (error) {
      void error
    }
  }
  // #endif

  emit('drag-start', index)
}

const startAutoScroll = (directionX: number, directionY: number) => {
  if (autoScrollTimer) return

  const step = () => {
    const deltaX = directionX * props.scrollSpeed
    let deltaY = directionY * props.scrollSpeed
    let nextScrollTop = innerScrollTop.value + deltaY

    const rect = items[draggedIndex.value]
    if (rect) {
      const currentScrollDiff = nextScrollTop - dragStartScrollTop.value
      const nextTop = rect.top + dragDelta.y + currentScrollDiff

      if (deltaY > 0 && nextTop + rect.height >= Number(containerHeight.value)) {
        deltaY = 0
        nextScrollTop = innerScrollTop.value
      }

      if (deltaY < 0 && nextTop <= 0) {
        deltaY = 0
        nextScrollTop = innerScrollTop.value
      }
    }

    if (deltaY === 0 && deltaX === 0) {
      autoScrollTimer = setTimeout(step, 20)
      return
    }

    let maxLead = 20
    // #ifdef MP
    maxLead = 30
    // #endif

    if (deltaY > 0 && nextScrollTop > props.scrollTop + maxLead) {
      nextScrollTop = props.scrollTop + maxLead
    } else if (deltaY < 0 && nextScrollTop < props.scrollTop - maxLead) {
      nextScrollTop = props.scrollTop - maxLead
    }

    innerScrollTop.value = nextScrollTop

    emit('scroll', {
      dx: deltaX,
      dy: deltaY
    })

    autoScrollTimer = setTimeout(step, 20)
  }

  step()
}

const stopAutoScroll = () => {
  if (autoScrollTimer) {
    clearTimeout(autoScrollTimer)
    autoScrollTimer = null
  }
}

watch(
  () => props.scrollTop,
  (value) => {
    if (!autoScrollTimer) {
      innerScrollTop.value = value
    } else if (Math.abs(value - innerScrollTop.value) > 100) {
      innerScrollTop.value = value
    }
  }
)

const swapItems = (targetSlotIndex: number) => {
  const currentOrder: number[] = []

  for (let i = 0; i < slots.value.length; i++) {
    const itemIndex = itemToSlot.value.findIndex((slotIndex) => slotIndex === i)
    if (itemIndex !== -1) currentOrder.push(itemIndex)
  }

  const oldVisualIndex = currentOrder.indexOf(draggedIndex.value)
  const newVisualIndex = targetSlotIndex
  const newOrder =
    props.sortType === 'swap'
      ? swapArrayItem(currentOrder, oldVisualIndex, newVisualIndex)
      : moveArrayItem(currentOrder, oldVisualIndex, newVisualIndex)

  newOrder.forEach((itemIndex, slotIndex) => {
    itemToSlot.value[itemIndex] = slotIndex
  })

  // #ifndef H5
  if (props.feedback) {
    try {
      uni.vibrateShort({
        fail: noop
      })
    } catch (error) {
      void error
    }
  }
  // #endif
}

const getSlotItemIndex = (slotIndex: number) => {
  return itemToSlot.value.findIndex((mappedSlotIndex) => mappedSlotIndex === slotIndex)
}

const isTargetSlotSortable = (slotIndex: number) => {
  const itemIndex = getSlotItemIndex(slotIndex)
  if (itemIndex === -1) return false

  const child = children.find((current) => (current as any).index === itemIndex)
  return !!(child as any)?.sortable
}

const getSlotFilterFn = () => {
  return (slotIndex: number) => isTargetSlotSortable(slotIndex)
}

const checkSwap = throttle(() => {
  const originalRect = items[draggedIndex.value]
  if (!originalRect) return

  const currentScrollDiff = innerScrollTop.value - dragStartScrollTop.value
  const centerX = originalRect.left + originalRect.width / 2 + dragDelta.x
  const centerY = originalRect.top + originalRect.height / 2 + dragDelta.y + currentScrollDiff
  const currentSlotIndex = itemToSlot.value[draggedIndex.value]

  const { index: targetSlotIndex, dist } = findClosestSlot({ x: centerX, y: centerY }, slots.value, getSlotFilterFn())

  if (targetSlotIndex !== -1 && targetSlotIndex !== currentSlotIndex) {
    const targetSlot = slots.value[targetSlotIndex]
    const threshold = Math.min(targetSlot.width, targetSlot.height) * 0.5

    if (dist < threshold) {
      if (props.strict && props.sortType === 'swap') {
        const widthDiff = Math.abs(targetSlot.width - originalRect.width)
        const heightDiff = Math.abs(targetSlot.height - originalRect.height)
        if (widthDiff > 1 || heightDiff > 1) {
          return
        }
      }

      if (!isTargetSlotSortable(targetSlotIndex)) return

      swapItems(targetSlotIndex)
    }
  }
}, 100)

function onDragMove(touch: any) {
  if (draggedIndex.value === -1) return

  const now = Date.now()
  if (now - dragMoveLastTime < DRAG_MOVE_THROTTLE) return
  dragMoveLastTime = now

  currentTouch.x = touch.clientX
  currentTouch.y = touch.clientY

  const deltaX = touch.clientX - startX
  const deltaY = touch.clientY - startY

  const rect = items[draggedIndex.value]
  if (rect) {
    const currentScrollDiff = innerScrollTop.value - dragStartScrollTop.value
    let nextLeft = rect.left + deltaX
    let nextTop = rect.top + deltaY + currentScrollDiff

    nextLeft = clamp(nextLeft, 0, containerWidth.value - rect.width)
    nextTop = clamp(nextTop, 0, Number(containerHeight.value) - rect.height)

    dragDelta.x = nextLeft - rect.left
    dragDelta.y = nextTop - rect.top - currentScrollDiff
  } else {
    dragDelta.x = deltaX
    dragDelta.y = deltaY
  }

  emit('dragging', {
    index: draggedIndex.value,
    delta: { ...dragDelta },
    touch: {
      clientX: touch.clientX,
      clientY: touch.clientY
    }
  })

  let topEdge = 0
  let bottomEdge = windowHeight.value

  if (props.scrollArea) {
    if (props.scrollArea.top !== undefined) topEdge = props.scrollArea.top
    if (props.scrollArea.height !== undefined) {
      bottomEdge = topEdge + props.scrollArea.height
    } else if (props.scrollArea.bottom !== undefined) {
      bottomEdge = props.scrollArea.bottom
    }
  }

  const scrollDirectionY = getScrollDirection(touch.clientY, topEdge, bottomEdge, props.edgeThreshold)

  if (scrollDirectionY !== 0) {
    startAutoScroll(0, scrollDirectionY)
  } else {
    stopAutoScroll()
  }

  if (!props.realtime) return
  if (props.strict && props.sortType === 'move') return

  checkSwap()
}

function onDragEnd() {
  if (draggedIndex.value === -1) return

  const currentDraggedIndex = draggedIndex.value

  if (!props.realtime) {
    const originalRect = items[currentDraggedIndex]
    if (!originalRect) {
      cleanupDragState(true)
      return
    }

    const currentScrollDiff = innerScrollTop.value - dragStartScrollTop.value
    const centerX = originalRect.left + originalRect.width / 2 + dragDelta.x
    const centerY = originalRect.top + originalRect.height / 2 + dragDelta.y + currentScrollDiff
    const currentSlotIndex = itemToSlot.value[currentDraggedIndex]
    const { index: targetSlotIndex } = findClosestSlot({ x: centerX, y: centerY }, slots.value, getSlotFilterFn())

    if (targetSlotIndex !== -1 && targetSlotIndex !== currentSlotIndex) {
      let canSwap = true
      if (props.strict && props.sortType === 'swap') {
        const targetSlot = slots.value[targetSlotIndex]
        if (targetSlot) {
          const widthDiff = Math.abs(targetSlot.width - originalRect.width)
          const heightDiff = Math.abs(targetSlot.height - originalRect.height)
          if (widthDiff > 2 || heightDiff > 2) {
            canSwap = false
          }
        }
      }

      if (canSwap && isTargetSlotSortable(targetSlotIndex)) {
        swapItems(targetSlotIndex)
      }
    }
  }

  const newOrder = new Array(props.modelValue.length)
  itemToSlot.value.forEach((slotIndex, itemIndex) => {
    newOrder[slotIndex] = props.modelValue[itemIndex]
  })

  const newIndex = itemToSlot.value[currentDraggedIndex]
  cleanupDragState()
  pendingOrder = newOrder
  pendingChangeDetail = { oldIndex: currentDraggedIndex, newIndex }

  if (updateTimer) {
    clearTimeout(updateTimer)
  }

  updateTimer = setTimeout(() => {
    updateTimer = null
    flushPendingUpdate()
  }, DRAG_END_COMMIT_DELAY)
}

const isSilentUpdate = ref(false)
const isInternalUpdate = ref(false)

function getItemStyle(index: number) {
  if (isSilentUpdate.value) {
    return {
      position: 'relative',
      left: '0',
      top: '0',
      zIndex: 1,
      transition: 'none'
    }
  }

  if (index === draggedIndex.value) {
    const translateX = dragDelta.x
    const translateY = dragDelta.y + (innerScrollTop.value - dragStartScrollTop.value)

    return {
      position: 'relative',
      left: `${translateX}px`,
      top: `${translateY}px`,
      zIndex: 9999,
      transition: 'none',
      willChange: 'left, top'
    }
  }

  const slotIndex = itemToSlot.value[index]
  if (slotIndex === undefined) return {}

  const slot = slots.value[slotIndex]
  const originalRect = items[index]
  if (!slot || !originalRect) return {}

  return {
    position: 'relative',
    left: `${slot.left - originalRect.left}px`,
    top: `${slot.top - originalRect.top}px`,
    zIndex: 1,
    transition: 'left 0.3s, top 0.3s'
  }
}

function getPosition(index: number) {
  return items[index]
}

function getCurrentPosition(index: number) {
  const rect = items[index]
  if (!rect) return null

  const currentScrollDiff = innerScrollTop.value - dragStartScrollTop.value

  return {
    left: rect.left + dragDelta.x,
    top: rect.top + dragDelta.y + currentScrollDiff,
    width: rect.width,
    height: rect.height
  }
}

watch(
  () => props.modelValue,
  () => {
    if (isInternalUpdate.value) {
      isInternalUpdate.value = false
      return
    }

    if (!initDebounceTimer) {
      initDebounceTimer = setTimeout(() => {
        initDebounceTimer = null
        dragInit()
      }, 150)
    }
  },
  { deep: true, immediate: true }
)

watch(
  () => children.length,
  () => {
    if (!initDebounceTimer) {
      initDebounceTimer = setTimeout(() => {
        initDebounceTimer = null
        if (!isReady.value) {
          dragInit()
        }
      }, 150)
    }
  }
)
</script>

<style lang="scss">
@use './index.scss';
</style>
