<template>
  <div class="color-block value">
    <div class="color-value-box">
      <!-- RGBA start -->
      <div class="color-value-block" v-if="model.type === 'RGBA'">
        <div class="color-value-unit">
          <input
            :value="R"
            @change="handleChangeUnitValue($event, 'RGBA', 0)"
          />
          <div class="title">R</div>
        </div>
        <div class="color-value-unit">
          <input
            :value="G"
            @change="handleChangeUnitValue($event, 'RGBA', 1)"
          />
          <div class="title">G</div>
        </div>
        <div class="color-value-unit">
          <input
            :value="B"
            @change="handleChangeUnitValue($event, 'RGBA', 2)"
          />
          <div class="title">B</div>
        </div>
        <div class="color-value-unit">
          <input
            :value="A"
            @change="handleChangeUnitValue($event, 'RGBA', 3)"
          />
          <div class="title">A</div>
        </div>
      </div>
      <!-- RGBA end -->
      <!-- HSVA start -->
      <div class="color-value-block" v-if="model.type === 'HSLA'">
        <div class="color-value-unit">
          <input
            :value="H"
            @change="handleChangeUnitValue($event, 'HSLA', 0)"
          />
          <div class="title">H</div>
        </div>
        <div class="color-value-unit">
          <input
            :value="S"
            @change="handleChangeUnitValue($event, 'HSLA', 1)"
          />
          <div class="title">S</div>
        </div>
        <div class="color-value-unit">
          <input
            :value="L"
            @change="handleChangeUnitValue($event, 'HSLA', 2)"
          />
          <div class="title">L</div>
        </div>
        <div class="color-value-unit">
          <input
            :value="A"
            @change="handleChangeUnitValue($event, 'HSLA', 3)"
          />
          <div class="title">A</div>
        </div>
      </div>
      <!-- HSVA end -->
      <!-- HEX start -->
      <div class="color-value-block hex" v-if="model.type === 'HEX'">
        <div class="color-value-unit">
          <input :value="HEX" @change="handleChangeUnitValue($event, 'HEX')" />
          <div class="title">HEX</div>
        </div>
      </div>
      <!-- HEX end -->
      <!-- 切换颜色显示类型 start -->
      <div class="color-model-change">
        <p @click="handleChange('up')">▲</p>
        <p @click="handleChange('down')">▼</p>
      </div>
      <!-- 切换颜色显示类型 end -->
    </div>
  </div>
</template>
<script>
import { parseRGBA, RGBAToHSLA, RGBAToHex } from '../converColor'

export default {
  name: 'ColorValueModel',
  inject: ['colorPicker'],
  props: {
    model: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      modelList: [
        {
          type: 'RGBA',
          value: []
        },
        {
          type: 'HSLA',
          value: []
        },
        {
          type: 'HEX',
          value: ''
        }
      ],
      R: '',
      G: '',
      B: '',
      A: '',
      H: '',
      S: '',
      L: '',
      HEX: ''
    }
  },
  watch: {
    model(val) {
      if (val) {
        this.init()
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const parse = {
        RGBA: this.parseRGBA,
        HEX: this.parseHEX,
        HSLA: this.parseHSLA
      }
      parse[this.model.type]()
    },
    parseHEX() {
      this.parseRGBA()
      this.HEX = this.model.origin
    },
    parseRGBA() {
      const { r, g, b, a } = parseRGBA(this.model.value)
      this.R = r
      this.G = g
      this.B = b
      this.A = a
    },
    parseHSLA() {
      const { h, s, l, a } = RGBAToHSLA(this.model.value, true)
      this.H = h
      this.S = s + '%'
      this.L = l + '%'
      this.A = a
    },
    handleChange(type) {
      const count = type === 'up' ? 1 : -1
      let index = this.modelList.findIndex(
        model => model.type === this.model.type
      )
      index += count
      if (index >= this.modelList.length) {
        index = 0
      }
      if (index < 0) {
        index = this.modelList.length - 1
      }
      this.model.type = this.modelList[index].type
      switch (this.model.type) {
        case 'RGBA':
          this.parseRGBA()
          break
        case 'HSLA':
          // eslint-disable-next-line no-case-declarations
          this.parseHSLA()
          break
        case 'HEX':
          this.HEX = RGBAToHex(this.model.value)
          break
      }
    },
    handleChangeUnitValue(event, type, index) {
      if (type === 'RGBA') {
        ;[this.R, this.G, this.B, this.A] = [
          this.R,
          this.G,
          this.B,
          this.A
        ].map((_val, _index) => {
          if (index === _index) {
            _val = event.target.value.trim()
          }
          return _val
        })
        this.colorPicker.update(`rgba(${this.R},${this.G},${this.B},${this.A})`)
      }
      if (type === 'HSLA') {
        ;[this.H, this.S, this.L, this.A] = [
          this.H,
          this.S,
          this.L,
          this.A
        ].map((_val, _index) => {
          if (index === _index) {
            _val = event.target.value.trim()
          }
          return _val
        })
        this.colorPicker.update(`hsla(${this.H},${this.S},${this.L},${this.A})`)
      }
      if (type === 'HEX') {
        this.colorPicker.update(event.target.value.trim())
      }
    }
  }
}
</script>
