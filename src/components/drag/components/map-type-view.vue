<template>
  <a-modal
    v-model="visible"
    title="选择地图"
    @ok="handleOk"
    @cancel="closeChild"
  >
    <div class="type-line">
      <span class="label">地图类型：</span>
      <a-select v-model="mapType" style="width: 300px">
        <a-select-option
          v-for="item in mapTypeList"
          :key="item.key"
          :value="item.key"
          @change="region = ''"
        >
          {{ item.name }}
        </a-select-option>
      </a-select>
    </div>
    <div class="type-line" v-show="mapType !== 1">
      <span class="label">地图范围：</span>
      <a-select v-model="region" style="width: 300px">
        <a-select-option v-for="item in regionList" :key="item.key">
          {{ item.name }}
        </a-select-option>
      </a-select>
    </div>
  </a-modal>
</template>
<script>
export default {
  props: ['visible'],
  data() {
    return {
      mapTypeList: [
        // { key: 1, name: '中国地图' },
        // { key: 2, name: '省级地图' },
        { key: 3, name: '市级地图' }
      ],
      provinceList: [
        { key: 1, name: '广东省' }
        //   { key: 2, name: '湖南省' }
      ],
      cityList: [
        { key: 1, name: '广州市' }
        //   { key: 2, name: '深圳市' }
      ],
      mapType: 3,
      region: 1
    }
  },
  computed: {
    regionList() {
      if (this.mapType === 2) {
        return this.provinceList
      }
      if (this.mapType === 3) {
        return this.cityList
      }
      return []
    }
  },
  methods: {
    handleOk() {
      this.$emit('ok')
    },
    closeChild() {
      this.$emit('close')
    }
  }
}
</script>
<style lang="less" scoped>
.type-line {
  margin-bottom: 20px;
  &:last-child {
    margin: 0;
  }
  .label {
    margin-right: 20px;
  }
}
</style>
