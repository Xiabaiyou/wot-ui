# DragSort 拖拽排序

用于列表、宫格等场景下的拖拽排序，支持移动排序、交换排序、自定义拖拽手柄，以及在动态布局变化后手动刷新位置信息。

## 示例分组

### 基础用法

#### 基础拖拽

通过 `v-model` 绑定数组，`wd-drag-sort-item` 的 `index` 需要和当前渲染顺序保持一致。

```html
<wd-drag-sort v-model="list" @change="handleChange">
  <wd-drag-sort-item v-for="(item, index) in list" :key="item.id" :index="index">
    <view class="card">{{ item.text }}</view>
  </wd-drag-sort-item>
</wd-drag-sort>
```

```ts
const list = ref([
  { id: '1', text: 'Item 1' },
  { id: '2', text: 'Item 2' },
  { id: '3', text: 'Item 3' }
])

function handleChange(value, { oldIndex, newIndex }) {
  console.log(value, oldIndex, newIndex)
}
```

#### 伪 Grid 严格模式

对应示例页里的 `strict + swap + realtime` 组合，适合用 Flex 模拟不等宽宫格；尺寸差异明显的项不会互换。

```html
<wd-drag-sort v-model="list" sort-type="swap" strict realtime custom-style="display: flex; flex-wrap: wrap; gap: 10px">
  <wd-drag-sort-item
    v-for="(item, index) in list"
    :key="item.id"
    :index="index"
    :custom-style="`width: ${item.large ? 'calc(66.66% - 5px)' : 'calc(33.33% - 7px)'}`"
  >
    <view class="card" :style="{ height: '100px' }">{{ item.text }}</view>
  </wd-drag-sort-item>
</wd-drag-sort>
```

#### 图片排序

图片墙场景可以直接结合 `placeholder-class` 使用。

```html
<wd-drag-sort v-model="imageList" placeholder-class="custom-placeholder">
  <wd-drag-sort-item v-for="(item, index) in imageList" :key="item.id" :index="index">
    <image :src="item.src" mode="aspectFill" class="thumb" />
  </wd-drag-sort-item>
</wd-drag-sort>
```

#### 混合尺寸 Grid 布局

CSS Grid 场景建议结合 `sort-type="swap"` 和 `strict`，避免跨尺寸元素误换位。

```html
<wd-drag-sort
  v-model="list"
  sort-type="swap"
  strict
  custom-style="display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 80px; gap: 10px;"
>
  <wd-drag-sort-item
    v-for="(item, index) in list"
    :key="item.id"
    :index="index"
    :custom-style="`width: 100%; height: 100%; grid-column: span ${item.w}; grid-row: span ${item.h}`"
  >
    <view class="card">{{ item.text }}</view>
  </wd-drag-sort-item>
</wd-drag-sort>
```

#### 列表排序

单列列表不需要额外配置，直接按顺序渲染即可。

```html
<wd-drag-sort v-model="list">
  <wd-drag-sort-item v-for="(item, index) in list" :key="item.id" :index="index">
    <view class="list-item">{{ item.text }}</view>
  </wd-drag-sort-item>
</wd-drag-sort>
```

### 交互与样式

#### 动态增删

直接修改绑定数组后，组件会自动重新计算布局；如果同时发生了尺寸变化，建议再手动调用一次 `init()`。

```ts
const list = ref([
  { id: '1', text: 'Item 1' },
  { id: '2', text: 'Item 2' }
])

function addItem() {
  list.value.push({
    id: `${Date.now()}`,
    text: `Item ${list.value.length + 1}`
  })
}

function removeItem() {
  list.value.pop()
}
```

#### 自定义拖拽手柄

设置 `use-drag-handle` 后，只有 `wd-drag-handle` 包裹的区域才会触发拖拽。

```html
<wd-drag-sort v-model="list" use-drag-handle>
  <wd-drag-sort-item v-for="(item, index) in list" :key="item.id" :index="index">
    <view class="item">
      <text>{{ item.text }}</text>
      <wd-drag-handle>
        <wd-icon name="list" />
      </wd-drag-handle>
    </view>
  </wd-drag-sort-item>
</wd-drag-sort>
```

#### 自定义占位样式

通过 `placeholder-class` 可以定制拖拽中的占位元素样式。

```html
<wd-drag-sort v-model="list" placeholder-class="custom-placeholder">
  <wd-drag-sort-item v-for="(item, index) in list" :key="item.id" :index="index">
    <view class="card">{{ item.text }}</view>
  </wd-drag-sort-item>
</wd-drag-sort>
```

```scss
.custom-placeholder {
  border: 1px dashed #409eff;
  background: rgba(64, 158, 255, 0.1);
}
```

### 排序模式

#### Move + 实时

默认 `sort-type="move"`，开启 `realtime` 后，拖拽过程中会实时插入到目标位置。

```html
<wd-drag-sort v-model="list" realtime>
  <wd-drag-sort-item v-for="(item, index) in list" :key="item.id" :index="index">
    <view class="card">{{ item.text }}</view>
  </wd-drag-sort-item>
</wd-drag-sort>
```

#### Swap + 非实时

设置 `sort-type="swap"` 后，拖拽结束时会与目标项直接交换位置。

```html
<wd-drag-sort v-model="list" sort-type="swap">
  <wd-drag-sort-item v-for="(item, index) in list" :key="item.id" :index="index">
    <view class="card">{{ item.text }}</view>
  </wd-drag-sort-item>
</wd-drag-sort>
```

#### Swap + 实时

`sort-type="swap"` 与 `realtime` 组合时，拖拽经过目标项就会即时交换。

```html
<wd-drag-sort v-model="list" sort-type="swap" realtime>
  <wd-drag-sort-item v-for="(item, index) in list" :key="item.id" :index="index">
    <view class="card">{{ item.text }}</view>
  </wd-drag-sort-item>
</wd-drag-sort>
```

### 状态控制

#### 指定元素不可拖拽

通过 `disabled` 可以禁止某一项被直接拖动，但其他元素仍然可以从它旁边经过。

```html
<wd-drag-sort v-model="list">
  <wd-drag-sort-item v-for="(item, index) in list" :key="item.id" :index="index" :disabled="index === 0">
    <view class="card">{{ item.text }}</view>
  </wd-drag-sort-item>
</wd-drag-sort>
```

#### 固定元素 Move

`wd-drag-sort-item` 支持通过 `sortable` 控制某一项是否参与排序。设置为 `false` 后，该项既不能被拖动，也不会被其他项挤开。

```html
<wd-drag-sort v-model="list" realtime>
  <wd-drag-sort-item v-for="(item, index) in list" :key="item.id" :index="index" :sortable="index !== 0 && index !== list.length - 1">
    <view class="card">{{ item.text }}</view>
  </wd-drag-sort-item>
</wd-drag-sort>
```

#### 固定元素 Swap

```html
<wd-drag-sort v-model="list" sort-type="swap" realtime>
  <wd-drag-sort-item v-for="(item, index) in list" :key="item.id" :index="index" :sortable="index !== 0 && index !== list.length - 1">
    <view class="card">{{ item.text }}</view>
  </wd-drag-sort-item>
</wd-drag-sort>
```

### 事件与编程控制

#### 事件监听

可以通过 `drag-start`、`drag-end`、`change`、`dragging`、`scroll` 监听完整的拖拽过程。

```html
<wd-drag-sort v-model="list" @drag-start="onDragStart" @drag-end="onDragEnd" @change="onChange">
  <wd-drag-sort-item v-for="(item, index) in list" :key="item.id" :index="index">
    <view class="card">{{ item.text }}</view>
  </wd-drag-sort-item>
</wd-drag-sort>
```

```ts
function onDragStart(index) {
  console.log('drag start', index)
}

function onDragEnd() {
  console.log('drag end')
}

function onChange(value, { oldIndex, newIndex }) {
  console.log('change', value, oldIndex, newIndex)
}
```

### 布局更新

#### 手动刷新布局

当卡片尺寸、布局列数或容器宽度发生变化后，可以通过组件实例调用 `init()` 重新计算布局。

```html
<wd-drag-sort ref="dragSortRef" v-model="list">...</wd-drag-sort>
```

```ts
const dragSortRef = ref()

function refreshLayout() {
  dragSortRef.value?.init()
}
```

## 使用注意

- 当前拖拽链路基于触摸事件，H5 桌面端鼠标按下不会触发拖拽；请在移动端或浏览器触摸模拟模式下测试。
- `sort-type="move"` 暂不支持同时开启 `realtime` 和 `strict`。

## Attributes

### DragSort

| 参数                  | 说明                             | 类型                                                 | 默认值   |
| --------------------- | -------------------------------- | ---------------------------------------------------- | -------- |
| model-value / v-model | 绑定的排序数组                   | `any[]`                                              | -        |
| realtime              | 是否在拖拽过程中实时交换位置     | `boolean`                                            | `false`  |
| edge-threshold        | 自动滚动触发阈值                 | `number`                                             | `50`     |
| scroll-speed          | 自动滚动速度                     | `number`                                             | `10`     |
| scroll-top            | 当前滚动位置                     | `number`                                             | `0`      |
| feedback              | 是否开启震动反馈                 | `boolean`                                            | `true`   |
| disabled              | 是否禁用整个拖拽排序             | `boolean`                                            | `false`  |
| scroll-area           | 自定义自动滚动区域               | `{ top?: number; bottom?: number; height?: number }` | -        |
| long-press-duration   | 长按多久后触发拖拽，单位毫秒     | `number`                                             | `100`    |
| use-drag-handle       | 是否仅允许通过拖拽手柄触发拖拽   | `boolean`                                            | `false`  |
| placeholder-class     | 占位元素自定义类名               | `string`                                             | `''`     |
| sort-type             | 排序模式，可选 `move` / `swap`   | `string`                                   | `move` |
| strict                | 严格模式，仅允许尺寸相近的项交换 | `boolean`                                            | `false`  |
| custom-class          | 根节点自定义类名                 | `string`                                             | `''`     |
| custom-style          | 根节点自定义样式                 | `string`                                             | `''`     |

### DragSortItem

| 参数         | 说明               | 类型      | 默认值  |
| ------------ | ------------------ | --------- | ------- |
| index        | 当前项索引         | `number`  | -       |
| disabled     | 是否禁用当前项拖拽 | `boolean` | `false` |
| sortable     | 当前项是否参与排序 | `boolean` | `true`  |
| custom-class | 根节点自定义类名   | `string`  | `''`    |
| custom-style | 根节点自定义样式   | `string`  | `''`    |

### DragHandle

| 参数         | 说明             | 类型     | 默认值 |
| ------------ | ---------------- | -------- | ------ |
| custom-class | 根节点自定义类名 | `string` | `''`   |
| custom-style | 根节点自定义样式 | `string` | `''`   |

## Events

| 事件名称   | 说明               | 参数                                                             |
| ---------- | ------------------ | ---------------------------------------------------------------- |
| change     | 排序结果变化时触发 | `(value: any[], detail: { oldIndex: number; newIndex: number })` |
| drag-start | 开始拖拽时触发     | `index: number`                                                  |
| drag-end   | 拖拽结束时触发     | -                                                                |
| dragging   | 拖拽过程中触发     | `{ index, delta, touch }`                                        |
| scroll     | 自动滚动时触发     | `{ dx, dy }`                                                     |

## DragSort Slots

| name        | 说明                                   | 参数 |
| ----------- | -------------------------------------- | ---- |
| default     | 默认插槽，通常放置 `wd-drag-sort-item` | -    |
| placeholder | 拖拽占位内容                           | -    |

## DragSortItem Slots

| name    | 说明     | 参数 |
| ------- | -------- | ---- |
| default | 默认内容 | -    |

## DragHandle Slots

| name    | 说明     | 参数 |
| ------- | -------- | ---- |
| default | 默认内容 | -    |
