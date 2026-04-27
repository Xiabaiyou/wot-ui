# DragSort

`DragSort` is used for drag-and-drop sorting in lists, grids, and other layout containers. It supports move sorting, swap sorting, custom drag handles, and manual layout refresh when item size changes.

## Example Groups

### Basic Usage

#### Basic Dragging

Bind the array with `v-model`, and keep the `index` of each `wd-drag-sort-item` aligned with the current render order.

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

#### Pseudo Grid Strict Mode

This matches the demo page's `strict + swap + realtime` combination. It is useful for Flex-based uneven grids where different-sized items should not swap.

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

#### Image Sorting

For image wall scenarios, you can directly combine it with `placeholder-class`.

```html
<wd-drag-sort v-model="imageList" placeholder-class="custom-placeholder">
  <wd-drag-sort-item v-for="(item, index) in imageList" :key="item.id" :index="index">
    <image :src="item.src" mode="aspectFill" class="thumb" />
  </wd-drag-sort-item>
</wd-drag-sort>
```

#### Mixed-size Grid Layout

For CSS Grid layouts, it is recommended to combine `sort-type="swap"` with `strict` to avoid accidental swaps across differently sized items.

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

#### List Sorting

Single-column lists work without extra configuration.

```html
<wd-drag-sort v-model="list">
  <wd-drag-sort-item v-for="(item, index) in list" :key="item.id" :index="index">
    <view class="list-item">{{ item.text }}</view>
  </wd-drag-sort-item>
</wd-drag-sort>
```

### Interaction and Styles

#### Dynamic Add and Remove

When you modify the bound array directly, the component will recalculate the layout automatically. If item size also changes, it is still recommended to call `init()` manually once.

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

#### Custom Drag Handle

When `use-drag-handle` is enabled, dragging can only start from the `wd-drag-handle` area.

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

#### Custom Placeholder Style

Use `placeholder-class` to customize the placeholder shown while dragging.

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

### Sort Modes

#### Move + Realtime

`move` is the default mode. With `realtime` enabled, the dragged item is inserted into the target position during dragging.

```html
<wd-drag-sort v-model="list" realtime>
  <wd-drag-sort-item v-for="(item, index) in list" :key="item.id" :index="index">
    <view class="card">{{ item.text }}</view>
  </wd-drag-sort-item>
</wd-drag-sort>
```

#### Swap + Non-realtime

Set `sort-type="swap"` to directly swap with the target item when dragging ends.

```html
<wd-drag-sort v-model="list" sort-type="swap">
  <wd-drag-sort-item v-for="(item, index) in list" :key="item.id" :index="index">
    <view class="card">{{ item.text }}</view>
  </wd-drag-sort-item>
</wd-drag-sort>
```

#### Swap + Realtime

When `sort-type="swap"` is combined with `realtime`, items swap immediately as the dragged item crosses them.

```html
<wd-drag-sort v-model="list" sort-type="swap" realtime>
  <wd-drag-sort-item v-for="(item, index) in list" :key="item.id" :index="index">
    <view class="card">{{ item.text }}</view>
  </wd-drag-sort-item>
</wd-drag-sort>
```

### State Control

#### Disable Specific Items

Use `disabled` to prevent a specific item from being dragged directly, while other items can still move around it.

```html
<wd-drag-sort v-model="list">
  <wd-drag-sort-item v-for="(item, index) in list" :key="item.id" :index="index" :disabled="index === 0">
    <view class="card">{{ item.text }}</view>
  </wd-drag-sort-item>
</wd-drag-sort>
```

#### Fixed Items Move

Use `sortable` on `wd-drag-sort-item` to control whether an item participates in sorting. When it is set to `false`, that item cannot be dragged and will not be pushed away by other items.

```html
<wd-drag-sort v-model="list" realtime>
  <wd-drag-sort-item v-for="(item, index) in list" :key="item.id" :index="index" :sortable="index !== 0 && index !== list.length - 1">
    <view class="card">{{ item.text }}</view>
  </wd-drag-sort-item>
</wd-drag-sort>
```

#### Fixed Items Swap

```html
<wd-drag-sort v-model="list" sort-type="swap" realtime>
  <wd-drag-sort-item v-for="(item, index) in list" :key="item.id" :index="index" :sortable="index !== 0 && index !== list.length - 1">
    <view class="card">{{ item.text }}</view>
  </wd-drag-sort-item>
</wd-drag-sort>
```

### Events and Programmatic Control

#### Event Listening

You can observe the full drag lifecycle through `drag-start`, `drag-end`, `change`, `dragging`, and `scroll`.

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

### Layout Refresh

#### Manual Layout Refresh

If item size, layout columns, or container width changes, call `init()` on the component instance to re-measure the layout.

```html
<wd-drag-sort ref="dragSortRef" v-model="list">...</wd-drag-sort>
```

```ts
const dragSortRef = ref()

function refreshLayout() {
  dragSortRef.value?.init()
}
```

## Notes

- The current drag chain is touch-event based. Mouse interactions on H5 desktop will not start dragging; test on a mobile device or with touch simulation enabled.
- `sort-type="move"` does not currently support enabling `realtime` and `strict` at the same time.

## Attributes

### DragSort

| Parameter             | Description                                             | Type                                                 | Default  |
| --------------------- | ------------------------------------------------------- | ---------------------------------------------------- | -------- |
| model-value / v-model | Bound sortable array                                    | `any[]`                                              | -        |
| realtime              | Whether to swap positions during dragging               | `boolean`                                            | `false`  |
| edge-threshold        | Threshold for triggering auto scroll                    | `number`                                             | `50`     |
| scroll-speed          | Auto scroll speed                                       | `number`                                             | `10`     |
| scroll-top            | Current scroll position                                 | `number`                                             | `0`      |
| feedback              | Whether to enable vibration feedback                    | `boolean`                                            | `true`   |
| disabled              | Whether to disable the whole drag sort                  | `boolean`                                            | `false`  |
| scroll-area           | Custom auto-scroll area                                 | `{ top?: number; bottom?: number; height?: number }` | -        |
| long-press-duration   | Press duration before drag starts, in milliseconds      | `number`                                             | `100`    |
| use-drag-handle       | Whether drag can only start from a handle               | `boolean`                                            | `false`  |
| placeholder-class     | Custom class for the placeholder                        | `string`                                             | `''`     |
| sort-type             | Sort mode, `move` or `swap`                             | `'move' \| 'swap'`                                   | `'move'` |
| strict                | Strict mode, only allows swapping similarly-sized items | `boolean`                                            | `false`  |
| custom-class          | Custom root class name                                  | `string`                                             | `''`     |
| custom-style          | Custom root style                                       | `string`                                             | `''`     |

### DragSortItem

| Parameter    | Description                              | Type      | Default |
| ------------ | ---------------------------------------- | --------- | ------- |
| index        | Current item index                       | `number`  | -       |
| disabled     | Whether to disable dragging for the item | `boolean` | `false` |
| sortable     | Whether the item participates in sorting | `boolean` | `true`  |
| custom-class | Custom root class name                   | `string`  | `''`    |
| custom-style | Custom root style                        | `string`  | `''`    |

### DragHandle

| Parameter    | Description            | Type     | Default |
| ------------ | ---------------------- | -------- | ------- |
| custom-class | Custom root class name | `string` | `''`    |
| custom-style | Custom root style      | `string` | `''`    |

## Events

| Event      | Description                    | Parameters                                                       |
| ---------- | ------------------------------ | ---------------------------------------------------------------- |
| change     | Triggered when order changes   | `(value: any[], detail: { oldIndex: number; newIndex: number })` |
| drag-start | Triggered when dragging starts | `index: number`                                                  |
| drag-end   | Triggered when dragging ends   | -                                                                |
| dragging   | Triggered while dragging       | `{ index, delta, touch }`                                        |
| scroll     | Triggered during auto scroll   | `{ dx, dy }`                                                     |

## DragSort Slots

| name        | Description                                        | Parameters |
| ----------- | -------------------------------------------------- | ---------- |
| default     | Default slot, usually contains `wd-drag-sort-item` | -          |
| placeholder | Placeholder content while dragging                 | -          |

## DragSortItem Slots

| name    | Description     | Parameters |
| ------- | --------------- | ---------- |
| default | Default content | -          |

## DragHandle Slots

| name    | Description     | Parameters |
| ------- | --------------- | ---------- |
| default | Default content | -          |
