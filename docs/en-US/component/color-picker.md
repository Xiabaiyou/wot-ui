# ColorPicker

Used to select theme colors. It provides a color picker panel.

## Component Types

### Picker Mode

Use `mode` to set the picker panel mode. `basic` shows the basic palette, and `advanced` shows all controls.

```html
<wd-color-picker v-model="value" mode="basic" />
<wd-color-picker v-model="value" mode="advanced" />
```

### Color Presets

If you need preset colors, render your own swatches and update the bound value through `v-model`.

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
  { label: 'Brand Blue', value: '#2f65f6' },
  { label: 'Accent Red', value: '#ff4757' },
  { label: 'Success Green', value: '#28c76f' }
]
```

### Custom Color

In `basic` and `advanced` modes, the custom color panel is displayed by default.

```html
<wd-color-picker v-model="value" format="rgba" />
```

```ts
const value = ref('rgba(142, 43, 226, 0.92)')
```

### Custom Trigger

If you need to control when the color panel is displayed, render your own trigger and conditionally render the component.

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

### Custom Formats

Set `formats` to customize the color formats available in the switcher. The switcher shows the formats in a popover menu using the provided order.

```html
<wd-color-picker v-model="value" :formats="['hex', 'hexa', 'rgba']" />
```

### Custom Quick Presets

Set `quick-presets` to customize the compact color swatches at the bottom of the custom panel.

```html
<wd-color-picker v-model="value" :quick-presets="quickPresets" />
```

```ts
const quickPresets = [
  { label: 'Brand Blue', value: '#2f65f6' },
  { label: 'Accent Orange', value: '#ff7a00' },
  { label: 'Ink Black', value: '#1d1f29' },
  { label: 'Transparent', value: 'transparent' }
]
```

## Component States

### Disabled State

Set `disabled` to disable the color picker.

```html
<wd-color-picker v-model="value" disabled />
```

## Component Styles

### Without Alpha

Set `show-alpha="false"` to disable transparency support. The component hides the alpha slider, transparent quick swatch, and removes `hexa`, `rgba`, and `hsla` from the format switcher.

```html
<wd-color-picker v-model="value" :show-alpha="false" />
```

### Hide Auxiliary Controls

Use `show-preview`, `show-input`, `show-copy`, and `show-format-switch` to control the current color preview, color value input, copy button, and format switch.

```html
<wd-color-picker v-model="value" :show-preview="false" :show-input="false" :show-copy="false" :show-format-switch="false" />
```

### Swatch Shape

Use `quick-preset-shape` to control the compact swatches at the bottom. Optional values are `circle` and `square`.

```html
<wd-color-picker v-model="value" quick-preset-shape="circle" />
```

## Attributes

| Parameter | Description | Type | Default Value |
| --- | --- | --- | --- |
| model-value / v-model | Current color value, supports `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()`, `rgba()`, `hsl()`, `hsla()`, `transparent` | `string` | `'#2f65f6'` |
| title | Title | `string` | `''` |
| format | Output format, optional values are `hex`, `hexa`, `rgb`, `rgba`, `hsl`, `hsla` | `ColorPickerFormat` | `'hex'` |
| formats | Switchable output formats | `ColorPickerFormat[]` | `['hex', 'hexa', 'rgb', 'rgba', 'hsl', 'hsla']` |
| mode | Picker panel mode, optional values are `basic`, `advanced` | `ColorPickerMode` | `'advanced'` |
| quick-presets | Compact color swatches at the bottom | `ColorPickerPreset[]` | `defaultQuickColorPresets` |
| quick-preset-shape | Compact swatch shape, optional values are `circle`, `square` | `ColorPickerShape` | `'square'` |
| show-alpha | Whether to support transparency. When disabled, the alpha slider, transparent quick swatch, and transparent output formats are hidden | `boolean` | `true` |
| show-preview | Whether to show current color preview | `boolean` | `true` |
| show-input | Whether to show color value input | `boolean` | `true` |
| show-copy | Whether to show copy color button | `boolean` | `true` |
| show-format-switch | Whether to show output format switch | `boolean` | `true` |
| disabled | Whether disabled | `boolean` | `false` |
| readonly | Whether readonly | `boolean` | `false` |
| custom-class | Root node style class | `string` | `''` |
| custom-style | Root node style | `string` | `''` |

## Events

| Event Name | Description | Parameters |
| --- | --- | --- |
| change | Triggered when the color changes | `value` |
| customChange | Triggered when the custom color changes | `value` |
| copy | Triggered when the color value is copied successfully | `value` |
| update:format | Triggered when switching output format | `value` |

## Methods

| Method Name | Description | Parameters |
| --- | --- | --- |
| updateRect | Re-measure custom panel size | - |

## Types

```ts
type ColorPickerFormat = 'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla'

type ColorPickerMode = 'basic' | 'advanced'

type ColorPickerShape = 'circle' | 'square'

type ColorPickerPreset = {
  label: string
  value: string
}
```
