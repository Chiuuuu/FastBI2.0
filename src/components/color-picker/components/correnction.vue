<template>
  <div class="color-correction-wrapper" v-show="visible">
    <!-- 颜色版 start -->
    <div
      class="color-panel"
      ref="js-color-panel"
      @mousedown.stop="handleGetPanel"
    >
      <!-- 滑块 start -->
      <div class="color-panel-slider" ref="js-color-panel-slider"></div>
      <!-- 滑块 end -->
    </div>
    <!-- 颜色版 end -->
    <!-- 单色渐变条 start -->
    <div class="bar-block">
      <!-- 单色 start -->
      <div
        class="color-line"
        ref="js-color-hue"
        @mousedown.stop="handleGetHue"
      ></div>
      <!-- 单色 end -->
      <!-- 滑块 start -->
      <div class="color-line-slider" ref="js-color-hue-slider"></div>
      <!-- 滑块 end -->
    </div>
    <!-- 单色渐变条 end -->
    <!-- 透明度渐变条 start -->
    <div class="bar-block transparency">
      <!-- 单色 start -->
      <div
        class="color-line"
        ref="js-color-alpha"
        @mousedown.stop="handleGetAlpha"
      ></div>
      <!-- 单色 end -->
      <!-- 滑块 start -->
      <div class="color-line-slider" ref="js-color-alpha-slider"></div>
      <!-- 滑块 end -->
    </div>
    <!-- 透明度渐变条 end -->
  </div>
</template>
<script>
import Draggable from './draggable'
import { parseRGBA, RGBAToHSLA, HSVAToRGB, RGBToHSV } from '../converColor'

export default {
  name: 'ColorCorrenction',
  inject: ['colorPicker'],
  props: {
    visible: {
      // 是否显示
      type: Boolean,
      default: false
    },
    model: {
      // 数据的类型和值
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dragging: false,
      dom: {
        // 对应dom元素
        panel: '',
        panelSlider: '',
        hue: '',
        hueSlider: '',
        alpha: '',
        alphaSlider: ''
      },
      rect: {
        // dom元素对应的getBoundingClientRect的对象
        panel: '',
        panelSlider: '',
        hue: '',
        hueSlider: '',
        alpha: '',
        alphaSlider: ''
      }
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.init()
      }
    }
  },
  methods: {
    /*
     * 初始化
     */
    init() {
      this.$nextTick(() => {
        this.bindElement()
        this.initDomStyle()
        this.initSliderMousemove()
      })
    },
    /*
     * 绑定dom元素
     */
    bindElement() {
      this.dom.panel = this.$refs['js-color-panel']
      this.dom.panelSlider = this.$refs['js-color-panel-slider']
      this.dom.hue = this.$refs['js-color-hue']
      this.dom.hueSlider = this.$refs['js-color-hue-slider']
      this.dom.alpha = this.$refs['js-color-alpha']
      this.dom.alphaSlider = this.$refs['js-color-alpha-slider']
      this.bindRect()
    },
    /*
     * 设置dom元素对应的getBoundingClientRect
     */
    bindRect() {
      for (let key in this.dom) {
        this.rect[key] = this.dom[key].getBoundingClientRect()
      }
    },
    /*
     * 初始化dom元素的样式
     */
    initDomStyle() {
      const { h, a } = RGBAToHSLA(this.model.value, true)
      const { r, g, b } = parseRGBA(this.model.value)
      const { s, v } = RGBToHSV(r, g, b)
      this.setPanelStyle({
        backgroundColor: `hsla(${h},100%,50%,1)`
      })
      this.setPanelSliderStyle({
        left: `${Math.round(
          s * this.rect.panel.width - this.rect.panelSlider.width
        )}px`,
        top: `${Math.round((1 - v) * this.rect.panel.height)}px`
      })
      this.setHueSliderStyle(
        {
          left: `${Math.round((h / 360) * this.rect.hue.width)}px`
        },
        h
      )
      this.setAlphaStyle({
        background: `linear-gradient(to right, transparent, rgb(${r},${g},${b}))`
      })
      this.setAlphaSliderStyle({
        left: `${Math.round(a * this.rect.alpha.width)}px`
      })
    },
    /*
     * 设置dom元素的样式的公共方法
     * @params target 目标
     * @params style 需要改变的样式
     */
    setStyle(target, style) {
      for (let key in style) {
        target.style[key] = style[key]
      }
    },
    /*
     * 设置调色板的样式
     */
    setPanelStyle(style) {
      this.setStyle(this.dom.panel, style)
    },
    /*
     * 设置调色板滑块的样式
     */
    setPanelSliderStyle(style) {
      this.setStyle(this.dom.panelSlider, style)
    },
    /*
     * 设置色相板的样式
     */
    setHueStyle(style) {
      this.setStyle(this.dom.hue, style)
    },
    /*
     * 设置色相板滑块的样式
     */
    setHueSliderStyle(style, h) {
      this.colorPicker.model.cacheH = h
      this.setStyle(this.dom.hueSlider, style)
    },
    /*
     * 设置透明度板的样式
     */
    setAlphaStyle(style) {
      this.setStyle(this.dom.alpha, style)
    },
    /*
     * 设置透明度滑块的样式
     */
    setAlphaSliderStyle(style) {
      this.setStyle(this.dom.alphaSlider, style)
    },
    /*
     * 初始化对应滑块的拖拽
     */
    initSliderMousemove() {
      const panelSlider = new Draggable(this.dom.panelSlider)
      panelSlider.init({
        dragmove: this.panelSliderMousemove
      })

      const hueSlider = new Draggable(this.dom.hueSlider)
      hueSlider.init({
        dragmove: this.hueSliderMousemove
      })

      const alphaSlider = new Draggable(this.dom.alphaSlider)
      alphaSlider.init({
        dragmove: this.alphaSliderMousemove
      })
    },
    /*
     * 调色板样式改变公共方法
     */
    changePanelStyle(options) {
      const { shiftX, shiftY, h, s, v, a } = options
      const cacheH = this.colorPicker.model.cacheH
        ? this.colorPicker.model.cacheH
        : h
      const { r, g, b } = HSVAToRGB(cacheH, s, v, a, true)
      this.setPanelSliderStyle({
        left: `${shiftX - this.rect.panelSlider.width}px`,
        top: `${shiftY}px`
      })
      this.setAlphaStyle({
        background: `linear-gradient(to right, transparent, rgb(${r},${g},${b}))`
      })
      this.colorPicker.update(HSVAToRGB(cacheH, s, v, a))
    },
    /*
     * 点击获取调色板
     */
    handleGetPanel(event) {
      const { h, a } = RGBAToHSLA(this.model.value, true)
      const shiftX = event.clientX - this.rect.panel.left
      const shiftY = event.clientY - this.rect.panel.top
      const s = Math.round((shiftX / this.rect.panel.width) * 100)
      const v = Math.round(
        ((this.rect.panel.top + this.rect.panel.height - event.clientY) /
          this.rect.panel.height) *
          100
      )
      this.changePanelStyle({
        shiftX,
        shiftY,
        h,
        s,
        v,
        a
      })
    },
    /*
     * 调色板滑块拖拽方法
     */
    panelSliderMousemove(mouse) {
      const { h, a } = RGBAToHSLA(this.model.value, true)
      let shiftX = mouse.clientX - this.rect.panel.left
      let shiftY = mouse.clientY - this.rect.panel.top
      shiftX = Math.max(0, Math.min(shiftX, this.rect.panel.width))
      shiftY = Math.max(0, Math.min(shiftY, this.rect.panel.height))
      const s = Math.round((shiftX / this.rect.panel.width) * 100)
      const v = Math.round(
        ((this.rect.panel.top + this.rect.panel.height - mouse.clientY) /
          this.rect.panel.height) *
          100
      )
      this.changePanelStyle({
        shiftX,
        shiftY,
        h,
        s,
        v,
        a
      })
    },
    /*
     * 色相板样式改变公共方法
     */
    changeHueStyle(options) {
      const { hue, shiftX } = options
      const { r, g, b, a } = parseRGBA(this.model.value)
      const { s, v } = RGBToHSV(r, g, b)
      this.setPanelStyle({
        backgroundColor: `hsla(${hue},100%,50%,1)`
      })
      this.setAlphaStyle({
        background: `linear-gradient(to right, transparent, hsla(${hue},100%,50%, 1))`
      })
      this.setHueSliderStyle(
        {
          left: `${shiftX}px`
        },
        hue
      )
      this.colorPicker.update(
        HSVAToRGB(hue, Math.round(s * 100), Math.round(v * 100), a)
      )
    },
    /*
     * 点击获取色相板
     */
    handleGetHue(event) {
      const shiftX = event.clientX - this.rect.hue.left // panel.left;
      let hue = Math.round((shiftX / this.rect.hue.width) * 100) / 100
      hue = Math.round(hue * 360)
      this.changeHueStyle({
        shiftX,
        hue
      })
    },
    /*
     * 色相板滑块拖拽方法
     */
    hueSliderMousemove(mouse) {
      let shiftX = mouse.clientX - this.rect.hue.left
      shiftX = Math.max(0, Math.min(shiftX, this.rect.hue.width))
      let hue = Math.round((shiftX / this.rect.hue.width) * 100) / 100
      hue = Math.round(hue * 360)
      this.changeHueStyle({
        shiftX,
        hue
      })
    },
    /*
     * 透明度样式改变公共方法
     */
    changeAlphaStyle(options) {
      const { shiftX, alpha } = options
      const { r, g, b } = parseRGBA(this.model.value)
      const { h, s, v } = RGBToHSV(r, g, b)
      this.setAlphaSliderStyle({
        left: `${shiftX}px`
      })
      this.colorPicker.update(
        HSVAToRGB(h, Math.round(s * 100), Math.round(v * 100), alpha)
      )
    },
    /*
     * 点击获取透明度
     */
    handleGetAlpha(event) {
      const shiftX = event.clientX - this.rect.alpha.left
      let alpha = Math.round((shiftX / this.rect.alpha.width) * 100) / 100
      this.changeAlphaStyle({
        shiftX,
        alpha
      })
    },
    /*
     * 透明度滑块拖拽方法
     */
    alphaSliderMousemove(mouse) {
      let shiftX = mouse.clientX - this.rect.alpha.left
      shiftX = Math.max(0, Math.min(shiftX, this.rect.alpha.width))
      let alpha = Math.round((shiftX / this.rect.alpha.width) * 100) / 100
      this.changeAlphaStyle({
        shiftX,
        alpha
      })
    }
  }
}
</script>
