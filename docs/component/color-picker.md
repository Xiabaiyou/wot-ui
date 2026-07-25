# ColorPicker 颜色选择器

用于选择主题色，提供颜色选择面板能力。

## 组件类型

### 选择器模式

通过 `mode` 设置颜色选择器面板模式。`basic` 显示基础色板，`advanced` 显示完整控制项。

```html
<wd-color-picker v-model="value" mode="basic" />
<wd-color-picker v-model="value" mode="advanced" />
```

### 颜色预设

如需展示预设色，可在业务侧自行绘制色块，并通过 `v-model` 更新颜色选择器的绑定值。

```html
<view class="color-presets">
  <view
    v-for="item in presets"
    :key="item.value"
    class="color-presets__item"
    :style="{ backgroundColor: item.value }"
    @click="value = item.value"
  />
</view>
<wd-color-picker v-model="value" />
```

```ts
const value = ref('#2f65f6')
const presets = [
  { label: '品牌蓝', value: '#2f65f6' },
  { label: '强调红', value: '#ff4757' },
  { label: '成功绿', value: '#28c76f' }
]
```

### 自定义颜色

在 `basic` 和 `advanced` 模式下，自定义颜色面板会默认展开。

```html
<wd-color-picker v-model="value" format="rgba" />
```

```ts
const value = ref('rgba(142, 43, 226, 0.92)')
```

### 自定义触发器

如需通过自定义入口控制颜色面板展示，可在业务侧自行绘制触发器，并通过条件渲染控制组件。
```html
<view class="color-trigger" @click="showPicker = !showPicker">
  <view class="color-trigger__swatch" :style="{ backgroundColor: value }" />
  <view>{{ value }}</view>
</view>
<wd-color-picker v-if="showPicker" v-model="value" format="rgba" />
```

```ts
const showPicker = ref(false)
const value = ref('rgba(47, 101, 246, 0.9)')
```

### 自定义格式列表

通过 `formats` 传入可切换的颜色格式列表，格式切换控件会通过弹出菜单按传入顺序展示。

```html
<wd-color-picker v-model="value" :formats="['hex', 'hexa', 'rgba']" />
```

### 自定义快捷色板

通过 `quick-presets` 传入底部快捷色块列表，适合提供更多紧凑颜色。

```html
<wd-color-picker v-model="value" :quick-presets="quickPresets" />
```

```ts
const quickPresets = [
  { label: '品牌蓝', value: '#2f65f6' },
  { label: '强调橙', value: '#ff7a00' },
  { label: '墨黑', value: '#1d1f29' },
  { label: '透明', value: 'transparent' }
]
```

## 组件状态

### 禁用状态

设置 `disabled` 禁用颜色选择器。

```html
<wd-color-picker v-model="value" disabled />
```

## 组件样式

### 无透明度

设置 `show-alpha="false"` 关闭透明度能力，组件会隐藏透明度滑条、透明快捷色块，并从格式切换中移除 `hexa`、`rgba`、`hsla`。

```html
<wd-color-picker v-model="value" :show-alpha="false" />
```

### 隐藏辅助控件

通过 `show-preview`、`show-input`、`show-copy`、`show-format-switch` 控制当前色预览、颜色值输入框、复制按钮和格式切换。

```html
<wd-color-picker v-model="value" :show-preview="false" :show-input="false" :show-copy="false" :show-format-switch="false" />
```

### 色块形状

通过 `quick-preset-shape` 控制底部快捷色块形状，可选值为 `circle`、`square`。

```html
<wd-color-picker v-model="value" quick-preset-shape="circle" />
```

## Attributes

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| model-value / v-model | 当前颜色值，支持 `#rgb`、`#rgba`、`#rrggbb`、`#rrggbbaa`、`rgb()`、`rgba()`、`hsl()`、`hsla()`、`transparent` | `string` | `'#2f65f6'` |
| title | 标题 | `string` | `''` |
| format | 输出格式，可选值为 `hex`、`hexa`、`rgb`、`rgba`、`hsl`、`hsla` | `ColorPickerFormat` | `'hex'` |
| formats | 可切换的输出格式列表 | `ColorPickerFormat[]` | `['hex', 'hexa', 'rgb', 'rgba', 'hsl', 'hsla']` |
| mode | 选择器面板模式，可选值为 `basic`、`advanced` | `ColorPickerMode` | `'advanced'` |
| quick-presets | 底部快捷色块列表 | `ColorPickerPreset[]` | `defaultQuickColorPresets` |
| quick-preset-shape | 底部快捷色块形状，可选值为 `circle`、`square` | `ColorPickerShape` | `'square'` |
| show-alpha | 是否支持透明度，关闭后会隐藏透明度滑条、透明快捷色块和透明输出格式 | `boolean` | `true` |
| show-preview | 是否显示当前颜色预览 | `boolean` | `true` |
| show-input | 是否显示颜色值输入框 | `boolean` | `true` |
| show-copy | 是否显示复制颜色按钮 | `boolean` | `true` |
| show-format-switch | 是否显示输出格式切换 | `boolean` | `true` |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| custom-class | 根节点样式类 | `string` | `''` |
| custom-style | 根节点样式 | `string` | `''` |

## Events

| 事件名称 | 说明 | 参数 |
| --- | --- | --- |
| change | 颜色变化时触发 | `value` |
| customChange | 自定义颜色变化时触发 | `value` |
| copy | 复制颜色值成功时触发 | `value` |
| update:format | 切换输出格式时触发 | `value` |

## Methods

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| updateRect | 重新测量自定义面板尺寸 | - |

## 类型定义

```ts
type ColorPickerFormat = 'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla'

type ColorPickerMode = 'basic' | 'advanced'

type ColorPickerShape = 'circle' | 'square'

type ColorPickerPreset = {
  label: string
  value: string
}
```
