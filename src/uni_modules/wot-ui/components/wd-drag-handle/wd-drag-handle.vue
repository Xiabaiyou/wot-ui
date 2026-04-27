<template>
  <view :class="`wd-drag-handle ${customClass}`" :style="customStyle" @touchstart="handleTouch">
    <slot />
  </view>
</template>

<script lang="ts">
export default {
  name: 'wd-drag-handle',
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
import { inject } from 'vue'
import { DRAG_SORT_ITEM_KEY, type DragSortItemProvide } from '../wd-drag-sort-item/types'
import { dragHandleProps } from './types'

defineProps(dragHandleProps)

const parent = inject<DragSortItemProvide | null>(DRAG_SORT_ITEM_KEY, null)

const handleTouch = (event: any) => {
  if (parent?.onHandleTouch) {
    parent.onHandleTouch(event)
  }
}
</script>

<style lang="scss">
@use './index.scss';
</style>
