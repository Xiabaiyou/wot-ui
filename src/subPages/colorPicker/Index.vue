<template>
  <page-wraper>
    <view class="page-color-picker">
      <demo-group :title="$t('zu-jian-lei-xing')">
        <demo-group-item :title="$t('ji-chu-mo-shi')">
          <wd-color-picker v-model="basicModeColor" mode="basic" format="rgba" />
          <view class="page-color-picker__value">{{ $t('dang-qian-yan-se') }}：{{ basicModeColor }}</view>
        </demo-group-item>
        <demo-group-item :title="$t('gao-ji-mo-shi')">
          <wd-color-picker v-model="advancedModeColor" mode="advanced" format="rgba" />
          <view class="page-color-picker__value">{{ $t('dang-qian-yan-se') }}：{{ advancedModeColor }}</view>
        </demo-group-item>
        <demo-group-item title="选择主题色">
          <view class="page-color-picker__preset-list">
            <view
              v-for="item in externalPresets"
              :key="item.value"
              class="page-color-picker__preset"
              :class="{ 'is-active': !showPresetPicker && presetColor === item.value }"
              @click="handlePresetClick(item.value)"
            >
              <view class="page-color-picker__preset-color" :style="{ backgroundColor: item.value }"></view>
              <view class="page-color-picker__preset-label">{{ item.label }}</view>
            </view>
            <view class="page-color-picker__preset" :class="{ 'is-active': showPresetPicker }" @click="handleCustomPresetClick">
              <view class="page-color-picker__preset-color page-color-picker__preset-color--custom">
                <view class="page-color-picker__preset-custom-line"></view>
              </view>
              <view class="page-color-picker__preset-label">自定义</view>
            </view>
          </view>
          <wd-color-picker v-if="showPresetPicker" v-model="presetColor" />
          <view class="page-color-picker__value">{{ $t('dang-qian-yan-se') }}：{{ presetColor }}</view>
        </demo-group-item>
        <demo-group-item :title="$t('zi-ding-yi-yan-se')">
          <wd-color-picker v-model="customColor" format="rgba" />
          <view class="page-color-picker__value">{{ $t('dang-qian-yan-se') }}：{{ customColor }}</view>
        </demo-group-item>
        <demo-group-item :title="$t('zi-ding-yi-chu-fa-qi')">
          <view class="page-color-picker__trigger" @click="showTriggerPicker = !showTriggerPicker">
            <view class="page-color-picker__trigger-color" :style="{ backgroundColor: triggerColor }"></view>
            <view class="page-color-picker__trigger-text">{{ triggerColor }}</view>
          </view>
          <wd-color-picker v-if="showTriggerPicker" v-model="triggerColor" format="rgba" />
          <view class="page-color-picker__value">{{ $t('dang-qian-yan-se') }}：{{ triggerColor }}</view>
        </demo-group-item>
      </demo-group>

      <demo-group :title="$t('zu-jian-zhuang-tai')">
        <demo-group-item :title="$t('jin-yong-zhuang-tai')">
          <wd-color-picker v-model="disabledColor" disabled />
        </demo-group-item>
      </demo-group>

      <demo-group :title="$t('zu-jian-yang-shi')">
        <demo-group-item :title="$t('wu-tou-ming-du')">
          <wd-color-picker v-model="hexColor" :show-alpha="false" />
          <view class="page-color-picker__value">{{ $t('dang-qian-yan-se') }}：{{ hexColor }}</view>
        </demo-group-item>
      </demo-group>
    </view>
  </page-wraper>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const basicModeColor = ref('rgba(255, 122, 0, 0.88)')
const advancedModeColor = ref('rgba(142, 43, 226, 0.92)')
const presetColor = ref('#2f65f6')
const showPresetPicker = ref(false)
const customColor = ref('rgba(142, 43, 226, 0.92)')
const showTriggerPicker = ref(false)
const triggerColor = ref('rgba(47, 101, 246, 0.9)')
const disabledColor = ref('#8a2be2')
const hexColor = ref('#f45ca8')
const externalPresets = [
  { label: '默认蓝', value: '#2f65f6' },
  { label: '活力橙', value: '#ff7a00' },
  { label: '薄荷绿', value: '#28c76f' },
  { label: '樱花粉', value: '#f45ca8' },
  { label: '紫罗兰', value: '#8a2be2' },
  { label: '朱砂红', value: '#ff4757' }
]

function handlePresetClick(value: string) {
  presetColor.value = value
  showPresetPicker.value = false
}

function handleCustomPresetClick() {
  showPresetPicker.value = true
}
</script>

<style lang="scss" scoped>
.page-color-picker {
  :deep(.demo-group-item__title) {
    padding: $padding-loose $padding-loose $padding-main;
    color: $text-main;
    font-size: $typography-title-size-main;
    font-weight: $font-weight-bold;
    line-height: $typography-title-line-height-size-main;
  }

  &__preset-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax($n-60, 1fr));
    column-gap: $spacing-loose;
    row-gap: $spacing-main;
    margin-bottom: $spacing-loose;
  }

  &__preset {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: $text-secondary;
  }

  &__preset.is-active &__preset-color {
    border-color: $primary-6;
    box-shadow: inset 0 0 0 $stroke-bold $base-white;
  }

  &__preset-color {
    width: $n-36;
    height: $n-36;
    border: $stroke-bold solid $border-light;
    border-radius: $radius-full;
    box-sizing: border-box;
  }

  &__preset-color--custom {
    position: relative;
    overflow: hidden;
    background: conic-gradient(#ff4757, #ff7a00, #fadb14, #28c76f, #24c6dc, #2f65f6, #8a2be2, #ff4757);
  }

  &__preset-custom-line {
    position: absolute;
    top: 50%;
    left: 50%;
    width: $n-40;
    height: $stroke-bold;
    background: $base-white;
    box-shadow: 0 0 0 $stroke-light rgba(0, 0, 0, 0.08);
    transform: translate(-50%, -50%) rotate(-45deg);
    transform-origin: center;
  }

  &__preset-label {
    margin-top: $spacing-super-tight;
    color: inherit;
    font-size: $typography-label-size-main;
    line-height: $typography-label-line-height-size-main;
  }

  &__trigger {
    display: flex;
    align-items: center;
    gap: $spacing-tight;
    width: fit-content;
    padding: $padding-tight $padding-loose;
    border: $stroke-light solid $border-light;
    border-radius: $radius-main;
  }

  &__trigger-color {
    width: $n-24;
    height: $n-24;
    border-radius: $radius-full;
    border: $stroke-light solid $border-light;
    box-sizing: border-box;
  }

  &__trigger-text {
    color: $text-main;
    font-size: $typography-body-size-main;
    line-height: $typography-body-line-height-size-main;
  }

  &__value {
    margin-top: $spacing-loose;
    color: $text-secondary;
    font-size: $typography-body-size-main;
    line-height: $typography-body-line-height-size-main;
  }
}
</style>
