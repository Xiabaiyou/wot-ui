export const throttle = (fn: (...args: any[]) => void, delay: number) => {
  let last = 0
  return (...args: any[]) => {
    const now = Date.now()
    if (now - last > delay) {
      last = now
      fn(...args)
    }
  }
}

export const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.hypot(x1 - x2, y1 - y2)
}

export const findClosestSlot = (point: { x: number; y: number }, slots: any[], filterFn?: (index: number) => boolean) => {
  let minDist = Infinity
  let targetSlotIndex = -1
  const { x: centerX, y: centerY } = point

  slots.forEach((slot, slotIndex) => {
    if (filterFn && !filterFn(slotIndex)) return

    const slotCenterX = slot.left + slot.width / 2
    const slotCenterY = slot.top + slot.height / 2
    const distance = getDistance(centerX, centerY, slotCenterX, slotCenterY)

    if (distance < minDist) {
      minDist = distance
      targetSlotIndex = slotIndex
    }
  })

  return { index: targetSlotIndex, dist: minDist }
}

export const moveArrayItem = <T>(array: T[], fromIndex: number, toIndex: number) => {
  const newArray = [...array]
  const item = newArray.splice(fromIndex, 1)[0]
  newArray.splice(toIndex, 0, item)
  return newArray
}

export const swapArrayItem = <T>(array: T[], fromIndex: number, toIndex: number) => {
  if (fromIndex === toIndex) return array

  const temp = array[fromIndex]
  array[fromIndex] = array[toIndex]
  array[toIndex] = temp

  return array
}

export const getTouch = (event: any) => {
  return event.touches && event.touches[0] ? event.touches[0] : event
}

export const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(value, max))
}

export const getScrollDirection = (clientY: number, topEdge: number, bottomEdge: number, threshold: number) => {
  if (clientY < topEdge + threshold) {
    return -1
  }

  if (clientY > bottomEdge - threshold) {
    return 1
  }

  return 0
}

export const generateId = (prefix = 'ds') => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 7)
  return `${prefix}_${timestamp}${random}`
}
