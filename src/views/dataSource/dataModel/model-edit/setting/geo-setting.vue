<template>
  <a-modal
    :visible="isShow"
    title="创建地理字段"
    okText="确定"
    width="750px"
    destroyOnClose
    @ok="handleSave"
    @cancel="handleClose"
  >
    <div class="cacsader">
      <span>国家： </span>
      <a-select
        :default-value="countryData[0]"
        style="width: 100px"
        @change="handlecountryChange"
      >
        <a-select-option
          v-for="country in countryData"
          :key="country"
        >
          {{ country }}
        </a-select-option>
      </a-select>
      <span>省市： </span>
      <a-select
        v-model="province"
        style="width: 100px"
        @change="handleprovinceChange"
      >
        <a-select-option v-for="pro in provinces" :key="pro">
          {{ pro }}
        </a-select-option>
      </a-select>
      <span>城市： </span>
      <a-select
        v-model="city"
        style="width: 100px"
        @change="handlecityChange"
      >
        <a-select-option v-for="city in cities" :key="city">
          {{ city }}
        </a-select-option>
      </a-select>
      <span>区县： </span>
      <a-select v-model="area" style="width: 100px">
        <a-select-option v-for="area in areas" :key="area">
          {{ area }}
        </a-select-option>
      </a-select>
    </div>
    <div class="geo-contain">
      <div class="geo-map"></div>
      <div class="geo-set">
        <div class="set-head">
          <span class="g-s-s">地区匹配</span>
          <span class="g-s-r">(6个未匹配项)</span>
        </div>
        <div class="set-select">
          <div>
            <span class="s-s-s">请选择匹配字段: </span>
          </div>
          <div>
            <a-select default-value="分公司" style="width: 390px">
              <a-select-option value="分公司">
                分公司
              </a-select-option>
            </a-select>
          </div>
        </div>
        <div class="set-table">
          <a-table :columns="colu" :data-source="datas">
            <span slot="config">
              <a>请选择配置项</a>
            </span>
          </a-table>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script>

const colu = [
  {
    title: '您的数据',
    dataIndex: 'data'
  },
  {
    title: '匹配到',
    dataIndex: 'config',
    scopedSlots: {
      customRender: 'config'
    }
  }
]

const datas = [
  {
    data: '天河'
  },
  {
    data: '海珠'
  }
]
const countryData = ['中国']
const proData = {
  中国: ['广东省', '浙江省']
}
const cityData = {
  广东省: ['广州市', '肇庆市', '深圳市'],
  浙江省: ['宁波市', '温州市', '杭州市']
}
const areaData = {
  广州市: ['海珠区', '越秀区', '荔湾区'],
  深圳市: ['罗湖区', '福田区', '南山区'],
  肇庆市: ['怀集县', '四会市', '封开县'],
  宁波市: ['镇海区', '宁海区', '象山区'],
  温州市: ['文成区', '苍南区', '平阳区'],
  杭州市: ['上城区', '下城区', '富阳区']
}

export default {
  name: 'geoSetting',
  props: {
    isShow: Boolean
  },
  data() {
    return {
      colu,
      countryData,
      proData,
      cityData,
      areaData,
      datas,
      provinces: proData[countryData[0]],
      province: proData[countryData[0]][0],
      cities: cityData[proData[countryData[0]][0]],
      city: cityData[proData[countryData[0]][0]][0],
      areas: areaData[cityData[proData[countryData[0]][0]][0]],
      area: areaData[cityData[proData[countryData[0]][0]][0]][0]
      // key: value
    }
  },
  methods: {
    handlecountryChange(value) {
      this.provinces = proData[value]
      this.province = proData[value][0]
      this.handleprovinceChange(proData[value][0])
    },
    handleprovinceChange(value) {
      this.cities = cityData[value]
      this.city = cityData[value][0]
      this.handlecityChange(cityData[value][0])
    },
    handlecityChange(value) {
      this.areas = areaData[value]
      this.area = areaData[value][0]
    },
    handleSave() {
      this.handleClose()
    },
    handleClose() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="less">
.cacsader {
  height: 30px;
  line-height: 30px;
}
</style>
