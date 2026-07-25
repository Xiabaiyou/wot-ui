<template>
  <view :class="rootClass" :style="rootStyle">
    <view v-if="title" class="wd-color-picker__title">{{ title }}</view>

    <view class="wd-color-picker__custom-panel">
      <view
        :id="panelId"
        class="wd-color-picker__palette"
        :style="paletteStyle"
        @click.stop="handleDragStart('palette', $event)"
        @touchstart.stop="handleDragStart('palette', $event)"
        @touchmove.stop.prevent="handleDragMove('palette', $event)"
      >
        <view class="wd-color-picker__palette-white"></view>
        <view class="wd-color-picker__palette-black"></view>
        <view class="wd-color-picker__palette-thumb" :style="paletteThumbStyle"></view>
      </view>

      <view class="wd-color-picker__slider-control">
        <view v-if="showPreviewControl" class="wd-color-picker__preview">
          <view class="wd-color-picker__preview-bg"></view>
          <view class="wd-color-picker__preview-color" :style="previewStyle"></view>
        </view>
        <view class="wd-color-picker__slider-list">
          <wd-slider
            v-model="hueValue"
            custom-class="wd-color-picker__slider wd-color-picker__slider--hue"
            :custom-style="sliderCustomStyle"
            :min="0"
            :max="360"
            :step="1"
            active-color="transparent"
            popover-visible="never"
            :disabled="disabled || readonly"
          />

          <wd-slider
            v-if="showAlpha"
            v-model="alphaValue"
            custom-class="wd-color-picker__slider wd-color-picker__slider--alpha"
            :custom-style="alphaSliderCustomStyle"
            :min="0"
            :max="100"
            :step="1"
            active-color="transparent"
            popover-visible="never"
            :disabled="disabled || readonly"
          />
        </view>
      </view>

      <view v-if="showControl" class="wd-color-picker__control">
        <view class="wd-color-picker__field">
          <view class="wd-color-picker__input-wrap">
            <view v-if="showInputControl" class="wd-color-picker__input-list" :class="{ 'is-multiple': showChannelInput }">
              <view v-if="!showChannelInput" class="wd-color-picker__input-item">
                <wd-input
                  custom-class="wd-color-picker__input"
                  custom-input-class="wd-color-picker__input-inner"
                  :model-value="inputValue"
                  :disabled="disabled || readonly"
                  :readonly="readonly"
                  clearable
                  @input="handleInput"
                  @blur="handleInputConfirm"
                  @confirm="handleInputConfirm"
                />
                <view class="wd-color-picker__input-label">{{ hexInputLabel }}</view>
              </view>
              <view v-for="item in channelFields" v-else :key="item.key" class="wd-color-picker__input-item">
                <wd-input
                  custom-class="wd-color-picker__input"
                  custom-input-class="wd-color-picker__input-inner"
                  :type="item.type"
                  :inputmode="item.inputmode"
                  :model-value="item.value"
                  :disabled="disabled || readonly"
                  :readonly="readonly"
                  @input="handleChannelInput(item.key, $event)"
                  @blur="handleChannelConfirm"
                  @confirm="handleChannelConfirm"
                />
                <view class="wd-color-picker__input-label">{{ item.label }}</view>
              </view>
            </view>
            <view v-if="showCopyControl" class="wd-color-picker__copy" :class="{ 'is-disabled': disabled || readonly }" @click="handleCopyClick">
              <wd-icon name="copy" size="18px" custom-class="wd-color-picker__copy-icon" />
            </view>
            <wd-popover
              v-if="showFormatSwitchControl"
              v-model="isFormatPopoverOpen"
              mode="menu"
              placement="top-start"
              :content="formatMenuItems"
              :disabled="disabled || readonly"
              :visible-arrow="false"
              custom-class="wd-color-picker__format-popover"
              @menuclick="handleFormatMenuClick"
            >
              <view class="wd-color-picker__format-switch" :class="{ 'is-disabled': disabled || readonly }">
                {{ activeFormatLabel }}
              </view>
            </wd-popover>
          </view>
        </view>
      </view>

      <view v-if="showQuickPresets" class="wd-color-picker__quick-list">
        <view
          v-for="item in quickPresets"
          :key="`quick-${item.label}-${item.value}`"
          class="wd-color-picker__quick-color"
          :class="[
            quickColorShapeClass,
            { 'is-active': isQuickPresetActive(item.value), 'is-disabled': disabled, 'is-transparent': isTransparentColor(item.value) }
          ]"
          :style="getPresetStyle(item.value)"
          @click="handleQuickPresetClick(item)"
        ></view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
export default {
  name: 'wd-color-picker',
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
import { computed, getCurrentInstance, onMounted, ref, watch } from 'vue'
import { getRect, objToStyle, uuid } from '../../common/util'
import { useParent } from '../../composables/useParent'
import { FORM_ITEM_VALIDATE_KEY } from '../wd-form-item/types'
import wdIcon from '../wd-icon/wd-icon.vue'
import wdInput from '../wd-input/wd-input.vue'
import type { PopoverMenuItem } from '../wd-popover/types'
import wdPopover from '../wd-popover/wd-popover.vue'
import wdSlider from '../wd-slider/wd-slider.vue'
import { defaultColorFormats } from './constants'
import {
  colorPickerProps,
  type ColorPickerEmits,
  type ColorPickerExpose,
  type ColorPickerFormat,
  type ColorPickerHsv,
  type ColorPickerMode,
  type ColorPickerPreset
} from './types'
import {
  clamp,
  colorToHsv,
  formatAlpha,
  formatColor,
  getInputValue,
  getNumericInputValue,
  getPercentByRect,
  hslToRgb,
  hsvToRgb,
  isAlphaFormat,
  isRgbFormat,
  isSameColor,
  isTransparentColor,
  parseColor,
  rgbToHsl,
  rgbToHsv
} from './utils'

type ColorPickerDragType = 'palette'
type ColorPickerChannelField = {
  key: string
  label: string
  value: string
  type: 'number' | 'digit'
  inputmode: 'numeric' | 'decimal'
}
const props = defineProps(colorPickerProps)
const emit = defineEmits<ColorPickerEmits>()

const fallbackColor: ColorPickerHsv = { h: 220, s: 80, v: 96, a: 1 }
const color = ref<ColorPickerHsv>(colorToHsv(props.modelValue, fallbackColor))
const activeFormat = ref(props.format)
const inputValue = ref('')
const channelInputValues = ref<Record<string, string>>({})
const isFormatPopoverOpen = ref(false)
const panelId = ref<string>(`wd-color-picker-panel-${uuid()}`)
const panelRect = ref<UniApp.NodeInfo | null>(null)
const { proxy } = getCurrentInstance() as any
const { parent: formItemValidate } = useParent(FORM_ITEM_VALIDATE_KEY)

const rootClass = computed(() => {
  const classes = ['wd-color-picker']
  if (props.disabled) classes.push('is-disabled')
  if (props.readonly) classes.push('is-readonly')
  if (props.customClass) classes.push(props.customClass)
  return classes.join(' ')
})

const rootStyle = computed(() => props.customStyle)

const COLOR_PICKER_MODES: ColorPickerMode[] = ['basic', 'advanced']
const FORMAT_LABEL_MAP: Record<ColorPickerFormat, string> = {
  hex: '十六进制',
  hexa: '十六进制透明',
  rgb: 'RGB',
  rgba: 'RGBA',
  hsl: 'HSL',
  hsla: 'HSLA'
}

const currentMode = computed<ColorPickerMode>(() => (COLOR_PICKER_MODES.includes(props.mode) ? props.mode : 'advanced'))

const quickPresetShape = computed(() => (props.quickPresetShape === 'circle' ? 'circle' : 'square'))

const quickColorShapeClass = computed(() => `wd-color-picker__quick-color--${quickPresetShape.value}`)

const formatOptions = computed<ColorPickerFormat[]>(() => {
  const defaultFormats = defaultColorFormats.filter((item) => props.showAlpha || !isAlphaFormat(item))
  const formats = props.formats.filter((item) => defaultColorFormats.includes(item) && (props.showAlpha || !isAlphaFormat(item)))
  return formats.length ? formats : defaultFormats
})

const formatMenuItems = computed<PopoverMenuItem[]>(() => formatOptions.value.map((item) => ({ content: FORMAT_LABEL_MAP[item] })))

const currentFormat = computed<ColorPickerFormat>(() =>
  formatOptions.value.includes(activeFormat.value) ? activeFormat.value : formatOptions.value[0]
)

const outputValue = computed(() => formatColor(color.value, currentFormat.value, props.showAlpha))

const activeFormatLabel = computed(() => FORMAT_LABEL_MAP[currentFormat.value])

const hexInputLabel = computed(() => (currentFormat.value === 'hexa' ? 'HEXA' : 'HEX'))

const showAdvancedControl = computed(() => currentMode.value === 'advanced')

const showPreviewControl = computed(() => props.showPreview && showAdvancedControl.value)

const showInputControl = computed(() => props.showInput && showAdvancedControl.value)

const showCopyControl = computed(() => props.showCopy && showAdvancedControl.value)

const showFormatSwitchControl = computed(() => props.showFormatSwitch && showAdvancedControl.value)

const showControl = computed(() => showInputControl.value || showCopyControl.value || showFormatSwitchControl.value)

const showChannelInput = computed(() => currentFormat.value !== 'hex' && currentFormat.value !== 'hexa')

const quickPresets = computed(() => (props.showAlpha ? props.quickPresets : props.quickPresets.filter((item) => !isTransparentColor(item.value))))

const showQuickPresets = computed(() => quickPresets.value.length > 0)

const paletteStyle = computed(() => objToStyle({ backgroundColor: `hsl(${color.value.h}, 100%, 50%)` }))

const paletteThumbStyle = computed(() =>
  objToStyle({
    left: `${color.value.s}%`,
    top: `${100 - color.value.v}%`
  })
)

const hueValue = computed({
  get: () => Math.round(color.value.h),
  set: (value: number) => updateColor({ ...color.value, h: value })
})

const alphaValue = computed({
  get: () => Math.round(color.value.a * 100),
  set: (value: number) => updateColor({ ...color.value, a: value / 100 })
})

const sliderCustomStyle =
  '--wot-slider-bar-height: var(--wot-color-picker-slider-height, 18px); --wot-slider-dot-size: var(--wot-color-picker-thumb-size, 24px); --wot-slider-dot-bg: var(--wot-filled-oppo, var(--wot-base-white, white)); --wot-slider-dot-shadow: var(--wot-color-picker-thumb-shadow, 0 1px 6px 0 rgba(0, 0, 0, 0.2));'

const alphaSliderCustomStyle = computed(() => {
  const rgb = hsvToRgb({ ...color.value, a: 1 })
  return `${sliderCustomStyle} --wot-color-picker-alpha-start: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0); --wot-color-picker-alpha-end: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1);`
})

const previewStyle = computed(() => objToStyle({ background: outputValue.value }))

const channelFields = computed<ColorPickerChannelField[]>(() => {
  const rgb = hsvToRgb(color.value)
  const hsl = rgbToHsl(rgb)

  if (isRgbFormat(currentFormat.value)) {
    const fields = [getChannelField('r', 'R', rgb.r), getChannelField('g', 'G', rgb.g), getChannelField('b', 'B', rgb.b)]
    if (currentFormat.value === 'rgba') fields.push(getChannelField('a', 'A', formatAlpha(color.value.a)))
    return fields
  }

  const fields = [getChannelField('h', 'H', hsl.h), getChannelField('s', 'S', hsl.s), getChannelField('l', 'L', hsl.l)]
  if (currentFormat.value === 'hsla') fields.push(getChannelField('a', 'A', formatAlpha(color.value.a)))
  return fields
})

watch(outputValue, (value) => {
  inputValue.value = value
  syncChannelInputValues()
})

watch(
  () => props.modelValue,
  (value) => {
    if (!isSameColor(value, outputValue.value)) {
      color.value = colorToHsv(value, color.value)
    }
  }
)

watch(
  () => props.format,
  (value) => {
    activeFormat.value = value
  }
)

onMounted(() => {
  inputValue.value = outputValue.value
  syncChannelInputValues()
  updateRect()
})

function getChannelValue(key: string, value: string | number) {
  return channelInputValues.value[key] ?? String(value)
}

function getChannelField(key: string, label: string, value: string | number): ColorPickerChannelField {
  const isAlpha = key === 'a'
  return {
    key,
    label,
    value: getChannelValue(key, value),
    type: isAlpha ? 'digit' : 'number',
    inputmode: isAlpha ? 'decimal' : 'numeric'
  }
}

function syncChannelInputValues() {
  const rgb = hsvToRgb(color.value)
  const hsl = rgbToHsl(rgb)
  const alpha = formatAlpha(color.value.a)

  if (isRgbFormat(currentFormat.value)) {
    channelInputValues.value = {
      r: String(rgb.r),
      g: String(rgb.g),
      b: String(rgb.b),
      a: alpha
    }
    return
  }

  channelInputValues.value = {
    h: String(hsl.h),
    s: String(hsl.s),
    l: String(hsl.l),
    a: alpha
  }
}

function isDisabled() {
  return props.disabled || props.readonly
}

function isQuickPresetActive(value: string) {
  return isSameColor(outputValue.value, value)
}

function getPresetStyle(value: string) {
  return objToStyle({ backgroundColor: value })
}

function handleQuickPresetClick(item: ColorPickerPreset) {
  if (isDisabled()) return
  updateColor(colorToHsv(item.value, color.value), false)
}

function updateColor(nextColor: ColorPickerHsv, custom = true, formattedValue?: string) {
  color.value = nextColor
  const value = formattedValue || formatColor(nextColor, currentFormat.value, props.showAlpha)
  emit('update:modelValue', value)
  emit('change', value)
  if (custom) emit('customChange', value)
  formItemValidate.value?.validateByTrigger('change')
}

function handleInput(event: any) {
  inputValue.value = getInputValue(event)
}

function handleInputConfirm() {
  if (isDisabled()) return
  const parsedColor = parseColor(inputValue.value)

  if (!parsedColor) {
    inputValue.value = outputValue.value
    return
  }

  updateColor(rgbToHsv(parsedColor))
}

function handleChannelInput(key: string, event: any) {
  channelInputValues.value = {
    ...channelInputValues.value,
    [key]: getNumericInputValue(key, getInputValue(event))
  }
}

function handleChannelConfirm() {
  if (isDisabled()) return

  const getValue = (key: string) => Number(channelInputValues.value[key])
  const alpha = Number.isNaN(getValue('a')) ? color.value.a : clamp(getValue('a'), 0, 1)

  if (isRgbFormat(currentFormat.value)) {
    const r = getValue('r')
    const g = getValue('g')
    const b = getValue('b')

    if ([r, g, b].some((item) => Number.isNaN(item))) {
      syncChannelInputValues()
      return
    }

    updateColor(
      rgbToHsv({
        r: clamp(Math.round(r), 0, 255),
        g: clamp(Math.round(g), 0, 255),
        b: clamp(Math.round(b), 0, 255),
        a: currentFormat.value === 'rgba' ? alpha : color.value.a
      })
    )
    return
  }

  const h = getValue('h')
  const s = getValue('s')
  const l = getValue('l')

  if ([h, s, l].some((item) => Number.isNaN(item))) {
    syncChannelInputValues()
    return
  }

  updateColor(
    rgbToHsv(
      hslToRgb({
        h: clamp(Math.round(h), 0, 360),
        s: clamp(Math.round(s), 0, 100),
        l: clamp(Math.round(l), 0, 100),
        a: currentFormat.value === 'hsla' ? alpha : color.value.a
      })
    )
  )
}

function handleFormatClick(format: ColorPickerFormat) {
  if (isDisabled() || activeFormat.value === format) return
  activeFormat.value = format
  emit('update:format', format)
  updateColor(color.value)
}

function handleFormatMenuClick({ index }: { index: number }) {
  const nextFormat = formatOptions.value[index]
  if (nextFormat) handleFormatClick(nextFormat)
}

function handleCopyClick() {
  if (isDisabled()) return
  uni.setClipboardData({
    data: outputValue.value,
    showToast: false,
    success: () => {
      emit('copy', outputValue.value)
    }
  })
}

function updateDragValue(type: ColorPickerDragType, event: any) {
  if (type === 'palette') {
    const saturation = getPercentByRect(event, panelRect.value)
    const brightness = 100 - getPercentByRect(event, panelRect.value, true)
    updateColor({ ...color.value, s: saturation, v: brightness })
  }
}

async function handleDragStart(type: ColorPickerDragType, event: any) {
  if (isDisabled()) return
  await updateRect()
  updateDragValue(type, event)
}

function handleDragMove(type: ColorPickerDragType, event: any) {
  if (isDisabled()) return
  updateDragValue(type, event)
}

async function updateRect() {
  await getRect(`#${panelId.value}`, false, proxy)
    .then((rect) => {
      panelRect.value = rect
    })
    .catch(() => {})
}

defineExpose<ColorPickerExpose>({
  updateRect
})
</script>

<style lang="scss">
@use './index.scss';
</style>
