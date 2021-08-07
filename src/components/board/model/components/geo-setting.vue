<template>
  <a-modal
    :visible="isShow"
    :title="`创建地理字段(${region})`"
    okText="确定"
    width="750px"
    destroyOnClose
    @ok="handleSave"
    @cancel="handleClose"
  >
    <div class="cacsader">
      <span>请选择匹配的范围： </span>
      <span>国家： </span>
      <a-select
        :default-value="countryData[0]"
        style="width: 100px"
        @change="handlecountryChange"
      >
        <a-select-option v-for="country in countryData" :key="country">
          {{ country }}
        </a-select-option>
      </a-select>
      <span>省市： </span>
      <a-select
        v-model="province"
        style="width: 100px"
        @change="handleprovinceChange"
      >
        <a-select-option
          v-for="pro in provinceList"
          :key="pro.name"
          :value="pro.name"
        >
          {{ pro.name }}
        </a-select-option>
      </a-select>
      <span>市级： </span>
      <a-select v-model="city" style="width: 100px" @change="handlecityChange">
        <a-select-option
          v-for="city in cityList"
          :key="city.name"
          :value="city.name"
        >
          {{ city.name }}
        </a-select-option>
      </a-select>
      <!-- <span>区县： </span> -->
      <!-- <a-select v-model="area" style="width: 100px">
        <a-select-option v-for="area in areas" :key="area">
          {{ area }}
        </a-select-option>
      </a-select> -->
    </div>
    <div class="geo-contain">
      <div class="geo-map">
        <div ref="mapChart" style="height: 100%"></div>
      </div>
      <div class="geo-set">
        <div class="set-head">
          <span class="g-s-s">地区匹配</span>
          <span class="g-s-r">({{ unmatchedLen }}个未匹配项)</span>
        </div>
        <!-- <div class="set-select">
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
        </div> -->
        <div class="set-table">
          <a-table
            :loading="loading"
            :columns="colu"
            :data-source="datas"
            :pagination="false"
            class="table-list"
          >
            <template slot="config" slot-scope="text, record">
              <a @click="openMatchWindow(record.key)">{{
                record.MathedVal || '请选择配置项'
              }}</a>
            </template>
          </a-table>
          <match-window
            v-if="visible"
            :visible="visible"
            :matchList="areas"
            @selectArea="selectArea"
            @close="visible = false"
          ></match-window>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script>
import optionObj from './mapOptions'
import echarts from 'echarts'
import guangZhouJson from '@/utils/guangdong.json'
import matchWindow from './matchWindow'
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

const datas = []
const countryData = ['中国']
const proData = {
  中国: ['广东省']
}
const cityData = {
  广东省: ['广州市']
  //   浙江省: ['宁波市', '温州市', '杭州市']
}
const areaData = {
  广州市: [
    '海珠区',
    '越秀区',
    '荔湾区',
    '增城区',
    '天河区',
    '白云区',
    '黄埔区',
    '番禺区',
    '花都区',
    '南沙区',
    '从化区'
  ]
  //   深圳市: ['罗湖区', '福田区', '南山区'],
  //   肇庆市: ['怀集县', '四会市', '封开县'],
  //   宁波市: ['镇海区', '宁海区', '象山区'],
  //   温州市: ['文成区', '苍南区', '平阳区'],
  //   杭州市: ['上城区', '下城区', '富阳区']
}
export default {
  components: { matchWindow },
  name: 'geoSetting',
  props: {
    isShow: Boolean,
    region: String,
    dimensionsData: Object,
    type: Number
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
      area: areaData[cityData[proData[countryData[0]][0]][0]][0],
      visible: false,
      currentKey: '',
      loading: false,
      condition: {}, // 返回的匹配字段
      provinceList: [
        {
          name: '广东省',
          adcode: '110000',
          parentId: '0',
          level: 1,
          cityList: [
            {
              name: '广州市',
              adcode: '110000',
              parentId: '0',
              level: 1
            }
          ]
        }
      ],
      cityList: []
    }
  },
  computed: {
    unmatchedLen() {
      let umatcheds = this.datas.filter(item => !item.MathedVal)
      return umatcheds.length
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.drawMap()
    })
    // this.getProvinceList()
    this.getDimensionsDatas()
  },
  methods: {
    async getProvinceList() {
      let res = await this.$server.screenManage.getGeoData()
      if (res.code === 200) {
        this.provinceList = res.data
      }
    },
    // 获取维度数据
    async getDimensionsDatas() {
      let params = {
        level: '3',
        fieldId:
          this.type === 3
            ? this.dimensionsData.pivotschemaId
            : this.dimensionsData.fieldId, // 接入类型fieldId和pivotschemaId都是pivotschemaId，数据模型fieldId取原fieldId
        country: '中国',
        province: '广东省',
        city: '广州市',
        pivotschemaId: this.dimensionsData.pivotschemaId
      }
      this.loading = true
      let res = await this.$server.screenManage.getGeoData(params)
      this.loading = false
      // 模型数据被删
      if (res.code === 500 && res.msg === 'IsChanged') {
        this.$message.error('模型数据不存在')
        return
      }
      if (res.code === 200) {
        // 获取所有维度数据列表
        this.condition = res.data.geoConfig.condition
        let dataList = []
        let keyList = Object.keys(this.condition)
        // 构造被匹配数据列表
        keyList.forEach((key, index) => {
          dataList.push({
            key: index + '',
            data: key,
            MathedVal: this.condition[key]
          })
        })
        this.datas = dataList
      } else {
        res.msg && this.$message.error(res.msg)
      }
    },
    drawMap() {
      this.myChart = echarts.init(this.$refs.mapChart)
      echarts.registerMap('guangzhou', guangZhouJson)
      let option = optionObj
      if (option && typeof option === 'object') {
        this.myChart.setOption(option, true)
      }
    },
    openMatchWindow(key) {
      this.keyword = ''
      this.visible = true
      this.currentKey = key
    },
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
    async handleSave() {
      //   if (this.unmatchedLen > 0) {
      //     this.$message.error(`还有未匹配项`)
      //     return
      //   }
      let params = {
        level: '3',
        fieldId:
          this.type === 3
            ? this.dimensionsData.pivotschemaId
            : this.dimensionsData.fieldId, // 接入类型fieldId和pivotschemaId都是pivotschemaId，数据模型fieldId取原fieldId
        country: '中国',
        province: '广东省',
        city: '广州市',
        pivotschemaId: this.dimensionsData.pivotschemaId,
        condition: this.condition
      }
      let res = await this.$server.screenManage.saveGeoData(params)
      if (res.code === 500) {
        this.$message.error(res.msg)
        return
      }
      if (res.code === 200) {
        this.$message.success('保存成功')
        this.$emit('close')
      }
    },
    // 匹配赋值
    selectArea(value) {
      let area = this.datas.find(item => item.key === this.currentKey)
      area.MathedVal = value
      this.condition[area.data] = value
      this.visible = false
    },
    handleClose() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="less" scoped>
.cacsader {
  height: 30px;
  line-height: 30px;
}
.area-list {
  margin-top: 20px;
  & > p {
    margin: 0;
    cursor: pointer;
  }
}
.table-list {
  height: 269px;
  overflow-y: scroll;
}
</style>
