<template>
  <a-modal v-model="visible" title="选择地图" @ok="handleOk" @cancel="close">
    <div class="type-line">
      <span class="label">地图类型：</span>
      <a-select v-model="mapType" class="select-box">
        <a-select-option v-for="item in mapTypeList" :key="item.key" :value="item.key">
          {{ item.name }}
        </a-select-option>
      </a-select>
    </div>
    <div class="type-line" v-show="mapType !== 'country'">
      <span class="label">地图范围(省)：</span>
      <a-select v-model="province" class="select-box" @change="initCity">
        <a-select-option v-for="item in provinceList" :key="item.key">
          {{ item.name }}
        </a-select-option>
      </a-select>
    </div>
    <div class="type-line" v-show="mapType === 'city'">
      <span class="label">地图范围(市)：</span>
      <a-select v-model="city" class="select-box">
        <a-select-option v-for="item in cityList" :key="item.key">
          {{ item.name }}
        </a-select-option>
      </a-select>
    </div>
  </a-modal>
</template>
<script>
const regionList = [
  {
    key: 'guangdong',
    name: '广东省',
    children: [
      { key: 'guangzhou', name: '广州市' },
      { key: 'shenzen', name: '深圳市' },
    ],
  },
  {
    key: 'hunan',
    name: '湖南省',
    children: [
      { key: 'zhangjiajie', name: '张家界' },
      { key: 'changsha', name: '长沙' },
    ],
  },
];
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      mapTypeList: [
        { key: 'country', name: '中国地图' },
        { key: 'province', name: '省级地图' },
        { key: 'city', name: '市级地图' },
      ],
      provinceList: [
        { key: 'guangdong', name: '广东省' },
        { key: 'hunan', name: '湖南省' },
      ],
      cityList: [
        { key: 'guangzhou', name: '广州市' },
        { key: 'shenzhen', name: '深圳市' },
      ],
      mapType: 'city',
      province: 'guangdong',
      city: 'guangzhou',
    };
  },
  methods: {
    /**
     * @description 改变地图层级初始化选中的地区
     */
    initCity(value) {
      this.cityList = regionList.find(item => item.key === value).children;
      this.city = this.cityList[0].key;
    },
    /**
     * @description 关闭弹窗
     */
    close() {
      this.$emit('close');
    },
    /**
     * @description 确定，回传显示的区域
     */
    handleOk() {
      const resultRegion = {
        country: 'china',
        province: this.province,
        city: this.city,
      };
      this.close();
      this.$emit('ok', resultRegion[this.mapType]);
    },
  },
};
</script>
<style lang="less" scoped>
.type-line {
  margin-bottom: 20px;
  display: flex;
  flex-direction: row;
  &:last-child {
    margin: 0;
  }
  .label {
    margin-right: 20px;
    width: 100px;
  }
  .select-box {
    flex: 1;
  }
}
</style>
