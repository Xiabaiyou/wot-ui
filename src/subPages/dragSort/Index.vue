<template>
  <page-wraper :demo-config="{ transparent: true }">
    <scroll-view
      scroll-y
      style="height: calc(100vh - env(safe-area-inset-bottom))"
      :style="{ pointerEvents: canScrollY ? 'auto' : 'none' }"
      :scroll-top="currentScrollTop"
      @scroll="onScroll"
    >
      <view class="page-drag-sort">
        <demo-group :title="copy.groupBasic">
          <demo-group-item :title="copy.basicMove">
            <view class="tip">{{ copy.basicMoveTip }}</view>
            <wd-drag-sort
              v-model="basicList"
              :scroll-top="scrollTop"
              @change="handleChange"
              @scroll="handleScroll"
              @drag-start="handleDragStart"
              @drag-end="handleDragEnd"
            >
              <view class="grid-container">
                <wd-drag-sort-item v-for="(item, index) in basicList" :key="item.id" :index="index">
                  <view class="grid-cell">
                    <wd-icon name="image" size="24px" />
                    <text class="grid-text">{{ item.text }}</text>
                  </view>
                </wd-drag-sort-item>
              </view>
            </wd-drag-sort>
          </demo-group-item>

          <demo-group-item :title="copy.pseudoStrict">
            <view class="tip">{{ copy.pseudoStrictTip }}</view>
            <wd-drag-sort
              v-model="pseudoList"
              sort-type="swap"
              strict
              realtime
              @drag-start="handleDragStart"
              @drag-end="handleDragEnd"
              custom-style="display: flex; flex-wrap: wrap; gap: 10px"
            >
              <wd-drag-sort-item
                v-for="(item, index) in pseudoList"
                :key="item.id"
                :index="index"
                :custom-style="`width: ${item.large ? 'calc(66.66% - 5px)' : 'calc(33.33% - 7px)'}`"
              >
                <view
                  class="item"
                  :style="{
                    height: '100px',
                    backgroundColor: item.large ? '#f0f9eb' : '#fff',
                    color: item.large ? '#67c23a' : '#606266'
                  }"
                >
                  <text>{{ item.text }}</text>
                </view>
              </wd-drag-sort-item>
            </wd-drag-sort>
          </demo-group-item>

          <demo-group-item :title="copy.imageSort">
            <wd-drag-sort v-model="imageList" placeholder-class="custom-placeholder" @drag-start="handleDragStart" @drag-end="handleDragEnd">
              <view class="grid-container">
                <wd-drag-sort-item v-for="(item, index) in imageList" :key="item.id" :index="index">
                  <view class="item-img">
                    <image :src="item.src" mode="aspectFill" class="image" />
                  </view>
                </wd-drag-sort-item>
              </view>
            </wd-drag-sort>
          </demo-group-item>

          <demo-group-item :title="copy.mixGrid">
            <view class="tip">{{ copy.mixGridTip }}</view>
            <wd-drag-sort
              v-model="mixGridList"
              strict
              sort-type="swap"
              :realtime="false"
              :scroll-top="scrollTop"
              custom-style="display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 80px; gap: 10px;"
              @scroll="handleScroll"
              @drag-start="handleDragStart"
              @drag-end="handleDragEnd"
            >
              <wd-drag-sort-item
                v-for="(item, index) in mixGridList"
                :key="item.id"
                :index="index"
                :custom-style="`width: 100% !important; height: 100% !important; grid-column: span ${item.w}; grid-row: span ${item.h}`"
              >
                <view class="item-mix" :style="{ backgroundColor: item.color, height: '100%' }">
                  <text class="text-white">{{ item.text }}</text>
                </view>
              </wd-drag-sort-item>
            </wd-drag-sort>
          </demo-group-item>

          <demo-group-item :title="copy.listSort">
            <wd-drag-sort
              v-model="listSortList"
              :scroll-top="scrollTop"
              @change="handleChange"
              @scroll="handleScroll"
              @drag-start="handleDragStart"
              @drag-end="handleDragEnd"
            >
              <view class="list-container">
                <wd-drag-sort-item v-for="(item, index) in listSortList" :key="item.id" :index="index">
                  <view class="list-item">
                    <wd-icon name="github-filled" size="24px" custom-class="icon" />
                    <text class="text">{{ item.text }}</text>
                    <wd-icon name="list" size="20px" custom-class="handle" />
                  </view>
                </wd-drag-sort-item>
              </view>
            </wd-drag-sort>
          </demo-group-item>
        </demo-group>

        <demo-group :title="copy.groupInteractive">
          <demo-group-item :title="copy.dynamicList">
            <view class="tip">{{ copy.dynamicListTip }}</view>
            <view style="margin-bottom: 12px; display: flex; gap: 12px">
              <wd-button size="small" @click="addItem">{{ copy.addItem }}</wd-button>
              <wd-button size="small" type="danger" @click="removeItem">{{ copy.removeItem }}</wd-button>
            </view>
            <wd-drag-sort
              v-model="dynamicList"
              custom-style="display: flex; flex-wrap: wrap"
              :scroll-top="scrollTop"
              @change="handleChange"
              @scroll="handleScroll"
              @drag-start="handleDragStart"
              @drag-end="handleDragEnd"
            >
              <view class="grid-container">
                <wd-drag-sort-item v-for="(item, index) in dynamicList" :key="item.id" :index="index">
                  <view class="grid-cell">
                    <wd-icon name="picture" size="24px" />
                    <text class="grid-text">{{ item.text }}</text>
                  </view>
                </wd-drag-sort-item>
              </view>
            </wd-drag-sort>
          </demo-group-item>

          <demo-group-item :title="copy.handleOnly">
            <view class="tip">{{ copy.handleOnlyTip }}</view>
            <wd-drag-sort
              v-model="handleList"
              use-drag-handle
              :scroll-top="scrollTop"
              @scroll="handleScroll"
              @drag-start="handleDragStart"
              @drag-end="handleDragEnd"
            >
              <view class="list-container">
                <wd-drag-sort-item v-for="(item, index) in handleList" :key="item.id" :index="index">
                  <view class="list-item">
                    <text class="text">{{ item.text }}</text>
                    <wd-drag-handle custom-class="handle-wrapper">
                      <wd-icon name="list" size="20px" custom-class="handle" />
                    </wd-drag-handle>
                  </view>
                </wd-drag-sort-item>
              </view>
            </wd-drag-sort>
          </demo-group-item>

          <demo-group-item :title="copy.placeholderStyle">
            <view class="tip">{{ copy.placeholderStyleTip }}</view>
            <wd-drag-sort
              v-model="placeholderList"
              custom-style="display: flex; flex-wrap: wrap"
              placeholder-class="custom-placeholder"
              @change="handleChange"
              @drag-start="handleDragStart"
              @drag-end="handleDragEnd"
            >
              <view class="grid-container">
                <wd-drag-sort-item v-for="(item, index) in placeholderList" :key="item.id" :index="index">
                  <view class="grid-cell">
                    <text class="text">{{ item.text }}</text>
                  </view>
                </wd-drag-sort-item>
              </view>
            </wd-drag-sort>
          </demo-group-item>
        </demo-group>

        <demo-group :title="copy.groupSortMode">
          <demo-group-item :title="copy.moveRealtime">
            <view class="tip">{{ copy.moveRealtimeTip }}</view>
            <wd-drag-sort
              v-model="moveRealtimeList"
              realtime
              :scroll-top="scrollTop"
              @change="handleChange"
              @scroll="handleScroll"
              @drag-start="handleDragStart"
              @drag-end="handleDragEnd"
            >
              <view class="grid-container">
                <wd-drag-sort-item v-for="(item, index) in moveRealtimeList" :key="item.id" :index="index">
                  <view class="grid-cell">
                    <text class="text">{{ item.text }}</text>
                  </view>
                </wd-drag-sort-item>
              </view>
            </wd-drag-sort>
          </demo-group-item>

          <demo-group-item :title="copy.swapMove">
            <view class="tip">{{ copy.swapMoveTip }}</view>
            <wd-drag-sort v-model="swapList" sort-type="swap" @change="handleChange" @drag-start="handleDragStart" @drag-end="handleDragEnd">
              <view class="grid-container">
                <wd-drag-sort-item v-for="(item, index) in swapList" :key="item.id" :index="index">
                  <view class="grid-cell">
                    <text class="text">{{ item.text }}</text>
                  </view>
                </wd-drag-sort-item>
              </view>
            </wd-drag-sort>
          </demo-group-item>

          <demo-group-item :title="copy.swapRealtime">
            <view class="tip">{{ copy.swapRealtimeTip }}</view>
            <wd-drag-sort
              v-model="swapRealtimeList"
              sort-type="swap"
              realtime
              @change="handleChange"
              @drag-start="handleDragStart"
              @drag-end="handleDragEnd"
            >
              <view class="grid-container">
                <wd-drag-sort-item v-for="(item, index) in swapRealtimeList" :key="item.id" :index="index">
                  <view class="grid-cell">
                    <text class="text">{{ item.text }}</text>
                  </view>
                </wd-drag-sort-item>
              </view>
            </wd-drag-sort>
          </demo-group-item>
        </demo-group>

        <demo-group :title="copy.groupStates">
          <demo-group-item :title="copy.disabledItems">
            <view class="tip">{{ copy.disabledItemsTip }}</view>
            <wd-drag-sort v-model="partialDisabledList" @change="handleChange">
              <view class="grid-container">
                <wd-drag-sort-item
                  v-for="(item, index) in partialDisabledList"
                  :key="item.id"
                  :index="index"
                  :disabled="index === 0 || index === partialDisabledList.length - 1"
                  @drag-start="handleDragStart"
                  @drag-end="handleDragEnd"
                >
                  <view class="grid-cell" :style="{ opacity: index === 0 || index === partialDisabledList.length - 1 ? 0.5 : 1 }">
                    <text class="text">{{ item.text }}</text>
                    <text v-if="index === 0 || index === partialDisabledList.length - 1" style="font-size: 10px; color: red">
                      {{ copy.notDraggable }}
                    </text>
                  </view>
                </wd-drag-sort-item>
              </view>
            </wd-drag-sort>
          </demo-group-item>

          <demo-group-item :title="copy.fixedMove">
            <view class="tip">{{ copy.fixedMoveTip }}</view>
            <wd-drag-sort v-model="fixedMoveList" custom-style="display: flex; flex-wrap: wrap" realtime @change="handleChange">
              <view class="grid-container">
                <wd-drag-sort-item
                  v-for="(item, index) in fixedMoveList"
                  :key="item.id"
                  :index="index"
                  :sortable="index !== 0 && index !== fixedMoveList.length - 1"
                  @drag-start="handleDragStart"
                  @drag-end="handleDragEnd"
                >
                  <view class="grid-cell" :style="{ backgroundColor: index === 0 || index === fixedMoveList.length - 1 ? '#f5f5f5' : '#fff' }">
                    <text class="text">{{ item.text }}</text>
                    <text v-if="index === 0 || index === fixedMoveList.length - 1" style="font-size: 10px; color: #999">
                      {{ copy.fixedPosition }}
                    </text>
                  </view>
                </wd-drag-sort-item>
              </view>
            </wd-drag-sort>
          </demo-group-item>

          <demo-group-item :title="copy.fixedSwap">
            <view class="tip">{{ copy.fixedSwapTip }}</view>
            <wd-drag-sort
              v-model="fixedSwapList"
              custom-style="display: flex; flex-wrap: wrap"
              realtime
              @change="handleChange"
              sort-type="swap"
              @drag-start="handleDragStart"
              @drag-end="handleDragEnd"
            >
              <view class="grid-container">
                <wd-drag-sort-item
                  v-for="(item, index) in fixedSwapList"
                  :key="item.id"
                  :index="index"
                  :sortable="index !== 0 && index !== fixedSwapList.length - 1"
                >
                  <view class="grid-cell" :style="{ backgroundColor: index === 0 || index === fixedSwapList.length - 1 ? '#f5f5f5' : '#fff' }">
                    <text class="text">{{ item.text }}</text>
                    <text v-if="index === 0 || index === fixedSwapList.length - 1" style="font-size: 10px; color: #999">
                      {{ copy.fixedPosition }}
                    </text>
                  </view>
                </wd-drag-sort-item>
              </view>
            </wd-drag-sort>
          </demo-group-item>
        </demo-group>

        <demo-group :title="copy.groupEvents">
          <demo-group-item :title="copy.events">
            <wd-drag-sort
              v-model="eventList"
              custom-style="display: flex; flex-wrap: wrap"
              @drag-start="handleDragStart"
              @drag-end="handleDragEnd"
              @change="handleEventChange"
            >
              <view class="grid-container">
                <wd-drag-sort-item v-for="(item, index) in eventList" :key="item.id" :index="index">
                  <view class="grid-cell">
                    <text class="text">{{ item.text }}</text>
                  </view>
                </wd-drag-sort-item>
              </view>
            </wd-drag-sort>
          </demo-group-item>
        </demo-group>

        <demo-group :title="copy.groupLayout">
          <demo-group-item :title="copy.manualUpdate">
            <view class="tip">{{ copy.manualUpdateTip }}</view>
            <view style="margin-bottom: 12px; display: flex; gap: 12px">
              <wd-button size="small" @click="toggleSize">{{ copy.toggleSize }}</wd-button>
              <wd-button size="small" type="success" @click="updateLayout">{{ copy.refreshLayout }}</wd-button>
            </view>
            <wd-drag-sort
              ref="dragSortRef"
              v-model="strictList"
              custom-style="display: flex; flex-wrap: wrap"
              strict
              @change="handleChange"
              @drag-start="handleDragStart"
              @drag-end="handleDragEnd"
            >
              <view class="grid-container">
                <wd-drag-sort-item
                  v-for="(item, index) in strictList"
                  :key="item.id"
                  :index="index"
                  :custom-style="`height: ${item.large ? '170px' : '80px'}; background-color: ${item.large ? '#f0f9eb' : '#fff'}`"
                >
                  <view class="grid-cell" :style="{ height: item.large ? '170px' : '80px' }">
                    <text class="text">{{ item.text }}</text>
                  </view>
                </wd-drag-sort-item>
              </view>
            </wd-drag-sort>
          </demo-group-item>
        </demo-group>
      </view>
    </scroll-view>
  </page-wraper>
</template>

<script lang="ts" setup>
import { useToast } from '@/uni_modules/wot-ui'
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'

type DemoItem = {
  id: string
  text: string
  color?: string
  large?: boolean
  sortable?: boolean
  src?: string
  w?: number
  h?: number
}

const { t } = useI18n()
const toast = useToast()

const copy = computed(() => ({
  groupBasic: t('dragsort-group-basic'),
  basicMove: t('dragsort-basic-move'),
  basicMoveTip: t('dragsort-basic-move-tip'),
  pseudoStrict: t('dragsort-pseudo-strict'),
  pseudoStrictTip: t('dragsort-pseudo-strict-tip'),
  imageSort: t('dragsort-image-sort'),
  imageItem: t('dragsort-image-item'),
  mixGrid: t('dragsort-mix-grid'),
  mixGridTip: t('dragsort-mix-grid-tip'),
  listSort: t('dragsort-list-sort'),
  groupInteractive: t('dragsort-group-interactive'),
  dynamicList: t('dragsort-dynamic-list'),
  dynamicListTip: t('dragsort-dynamic-list-tip'),
  addItem: t('dragsort-add-item'),
  removeItem: t('dragsort-remove-item'),
  handleOnly: t('dragsort-handle-only'),
  handleOnlyTip: t('dragsort-handle-only-tip'),
  placeholderStyle: t('dragsort-placeholder-style'),
  placeholderStyleTip: t('dragsort-placeholder-style-tip'),
  groupSortMode: t('dragsort-group-sort-mode'),
  moveRealtime: t('dragsort-move-realtime'),
  moveRealtimeTip: t('dragsort-move-realtime-tip'),
  swapMove: t('dragsort-swap-move'),
  swapMoveTip: t('dragsort-swap-move-tip'),
  swapRealtime: t('dragsort-swap-realtime'),
  swapRealtimeTip: t('dragsort-swap-realtime-tip'),
  groupStates: t('dragsort-group-states'),
  disabledItems: t('dragsort-disabled-items'),
  disabledItemsTip: t('dragsort-disabled-items-tip'),
  fixedMove: t('dragsort-fixed-move'),
  fixedSwap: t('dragsort-fixed-swap'),
  fixedMoveTip: t('dragsort-fixed-move-tip'),
  fixedSwapTip: t('dragsort-fixed-swap-tip'),
  notDraggable: t('dragsort-not-draggable'),
  fixedPosition: t('dragsort-fixed-position'),
  groupEvents: t('dragsort-group-events'),
  events: t('dragsort-events'),
  groupLayout: t('dragsort-group-layout'),
  manualUpdate: t('dragsort-manual-update'),
  manualUpdateTip: t('dragsort-manual-update-tip'),
  toggleSize: t('dragsort-toggle-size'),
  refreshLayout: t('dragsort-refresh-layout'),
  startDrag: t('dragsort-start-drag'),
  listChanged: t('dragsort-list-changed'),
  movedFromTo: t('dragsort-moved-from'),
  movedTo: t('dragsort-moved-to'),
  layoutUpdated: t('dragsort-layout-updated'),
  listEmpty: t('dragsort-list-empty'),
  newItem: t('dragsort-new-item'),
  basicItem: t('dragsort-basic-item'),
  pseudoItem: t('dragsort-pseudo-item'),
  listItem: t('dragsort-list-item-prefix'),
  dynamicItem: t('dragsort-dynamic-item'),
  handleItem: t('dragsort-handle-item'),
  placeholderItem: t('dragsort-placeholder-item'),
  realtimeItem: t('dragsort-realtime-item'),
  swapItem: t('dragsort-swap-item'),
  swapRealItem: t('dragsort-swap-real-item'),
  partialItem: t('dragsort-partial-item'),
  fixedMoveItem: t('dragsort-fixed-move-item'),
  fixedSwapItem: t('dragsort-fixed-swap-item'),
  eventItem: t('dragsort-event-item'),
  strictItem: t('dragsort-strict-item')
}))

const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#303133']

const createList = (count: number, prefix: string): DemoItem[] => {
  return Array.from({ length: count }).map((_, index) => ({
    id: `${prefix}-${index}`,
    text: `${prefix} ${index + 1}`,
    color: colors[index % colors.length]
  }))
}

const scrollTop = ref(0)
const currentScrollTop = ref(0)
const canScrollY = ref(true)

const basicList = ref(createList(9, copy.value.basicItem))
const pseudoList = ref(
  createList(6, copy.value.pseudoItem).map((item, index) => ({
    ...item,
    large: index === 0 || index === 3
  }))
)
const imageList = ref([
  { id: 'img-1', src: 'https://img.yzcdn.cn/vant/cat.jpeg', text: `${copy.value.imageItem} 1` },
  { id: 'img-2', src: 'https://img.yzcdn.cn/vant/leaf.jpg', text: `${copy.value.imageItem} 2` },
  { id: 'img-3', src: 'https://img.yzcdn.cn/vant/sand.jpg', text: `${copy.value.imageItem} 3` },
  { id: 'img-4', src: 'https://img.yzcdn.cn/vant/tree.jpg', text: `${copy.value.imageItem} 4` },
  { id: 'img-5', src: 'https://img.yzcdn.cn/vant/apple-1.jpg', text: `${copy.value.imageItem} 5` },
  { id: 'img-6', src: 'https://img.yzcdn.cn/vant/apple-2.jpg', text: `${copy.value.imageItem} 6` }
])
const mixGridList = ref([
  { id: 'mix-1', w: 1, h: 1, text: '1x1 A', color: '#409EFF' },
  { id: 'mix-2', w: 1, h: 2, text: '1x2 B', color: '#67C23A' },
  { id: 'mix-3', w: 1, h: 1, text: '1x1 C', color: '#E6A23C' },
  { id: 'mix-4', w: 1, h: 1, text: '1x1 D', color: '#F56C6C' },
  { id: 'mix-5', w: 1, h: 1, text: '1x1 E', color: '#909399' },
  { id: 'mix-6', w: 2, h: 1, text: '2x1 F', color: '#303133' },
  { id: 'mix-7', w: 2, h: 2, text: '2x2 G', color: '#8e44ad' },
  { id: 'mix-8', w: 2, h: 1, text: '2x1 H', color: '#16a085' },
  { id: 'mix-9', w: 1, h: 1, text: '1x1 I', color: '#d35400' },
  { id: 'mix-10', w: 1, h: 1, text: '1x1 J', color: '#2c3e50' }
])
const listSortList = ref(createList(5, copy.value.listItem))
const dynamicList = ref(createList(6, copy.value.dynamicItem))
const handleList = ref(createList(5, copy.value.handleItem))
const placeholderList = ref(createList(8, copy.value.placeholderItem))
const moveRealtimeList = ref(createList(9, copy.value.realtimeItem))
const swapList = ref(createList(6, copy.value.swapItem))
const swapRealtimeList = ref(createList(6, copy.value.swapRealItem))
const partialDisabledList = ref(createList(6, copy.value.partialItem))
const fixedMoveList = ref(createList(6, copy.value.fixedMoveItem))
const fixedSwapList = ref(createList(6, copy.value.fixedSwapItem))
const eventList = ref(createList(6, copy.value.eventItem))
const strictList = ref(createList(6, copy.value.strictItem).map((item) => ({ ...item, large: false })))

const dragSortRef = ref<any>()

function onScroll(e: any) {
  scrollTop.value = e.detail.scrollTop
}

function handleScroll({ dy }: { dx: number; dy: number }) {
  currentScrollTop.value += dy
}

function handleChange(value: DemoItem[]) {
  console.log(copy.value.listChanged, value)
}

function handleDragStart(index: number) {
  currentScrollTop.value = scrollTop.value

  // #ifdef MP | APP-PLUS
  canScrollY.value = false
  // #endif

  toast.show(`${copy.value.startDrag}: ${index}`)
}

function handleDragEnd() {
  // #ifdef MP | APP-PLUS
  canScrollY.value = true
  // #endif
}

function handleEventChange(value: DemoItem[], { oldIndex, newIndex }: { oldIndex: number; newIndex: number }) {
  console.log(copy.value.listChanged, value)
  toast.success(`${copy.value.movedFromTo} ${oldIndex + 1} ${copy.value.movedTo} ${newIndex + 1}`)
}

function toggleSize() {
  if (!strictList.value.length) return

  strictList.value[0].large = !strictList.value[0].large
  nextTick(() => {
    dragSortRef.value?.init?.()
  })
}

function updateLayout() {
  dragSortRef.value?.init?.()
  toast.show(copy.value.layoutUpdated)
}

function addItem() {
  const next = dynamicList.value.length + 1
  dynamicList.value.push({
    id: `${Date.now()}`,
    text: `${copy.value.newItem} ${next}`,
    color: colors[next % colors.length]
  })
}

function removeItem() {
  if (!dynamicList.value.length) {
    toast.show(copy.value.listEmpty)
    return
  }

  dynamicList.value.pop()
}
</script>

<style lang="scss" scoped>
$surface-color: #fff;
$surface-muted: #f8f8f8;
$border-color: #eee;
$border-success: #e1f3d8;
$text-primary: #333;
$text-secondary: #666;
$text-muted: #999;
$brand-color: #409eff;
$radius-small: 8rpx;
$radius-medium: 12rpx;
$radius-large: 16rpx;

%center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

%card-border {
  border-radius: $radius-small;
  border: 1px solid $border-color;
  box-sizing: border-box;
}

.tip {
  margin: 10px 15px;
  color: $text-muted;
  font-size: 12px;
}

.grid-container {
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 20rpx;
  flex: 1;
  padding: 20rpx;
  background: $surface-color;
  border-radius: $radius-large;
}

.item-img {
  height: 100px;
  flex: 1;
  overflow: hidden;
  border-radius: $radius-small;
}

.image {
  width: 100px;
  height: 100px;
  display: flex;
  margin: 0 auto;
}

.grid-cell {
  @extend %center-content;

  height: 150rpx;
  margin: 0 auto;
  position: relative;
  background: $surface-muted;
  border-radius: $radius-medium;
  border: 1px solid $border-color;
}

.grid-item-3 {
  width: 100%;
  height: 120rpx;
  background-color: $surface-color;

  @extend %center-content;
  @extend %card-border;
}

.grid-text,
.text {
  font-size: 24rpx;
  color: $text-secondary;
  text-align: center;
}

.list-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.list-item {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  background: $surface-color;
  border-bottom: 1px solid $border-color;

  .text {
    flex: 1;
    padding-left: 10px;
    font-size: 14px;
    color: $text-primary;
    text-align: left;
  }
}

.icon {
  margin-right: 10px;
  color: $brand-color;
}

.handle {
  color: $text-muted;
}

.handle-wrapper {
  display: flex;
  align-items: center;
}

.drag-item-3 {
  width: 33.33%;
}

.item {
  height: 80px;
  background: $surface-color;

  @extend %center-content;
  @extend %card-border;
}

.item-mix {
  background: #f0f9eb;
  border-radius: $radius-small;
  border: 1px solid $border-success;

  @extend %center-content;
}

.text-white {
  color: #fff;
}

:deep(.custom-placeholder) {
  border: 1px dashed $brand-color !important;
  background: rgba(64, 158, 255, 0.1) !important;
  border-radius: $radius-small;
}
</style>
