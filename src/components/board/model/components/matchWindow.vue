<template>
  <a-modal
    v-model="visible"
    :width="250"
    :dialog-style="{ top: '200px' }"
    :closable="false"
    @cancel="close"
  >
    <template slot="footer">
      <a-button key="cancel" type="primary" @click="close">
        取消
      </a-button>
    </template>
    <a-input
      v-model="keyword"
      placeholder="请输入关键字搜索"
      :maxLength="30"
      @pressEnter="search"
    >
      <a-icon slot="prefix" type="search" />
    </a-input>
    <div class="area-list">
      <p
        v-for="(item, index) in searchList"
        :key="index"
        @click="selectArea(item)"
      >
        {{ item }}
      </p>
    </div>
  </a-modal>
</template>
<script>
export default {
  props: {
    visible: Boolean,
    matchList: Array
  },
  data() {
    return {
      keyword: '',
      searchList: []
    }
  },
  mounted() {
    this.searchList = this.matchList
  },
  methods: {
    close() {
      this.$emit('close')
    },
    search() {
      if (this.keyword) {
        this.searchList = this.matchList.filter(
          item => item.indexOf(this.keyword) > -1
        )
      } else {
        this.searchList = this.matchList
      }
    },
    selectArea(val) {
      this.$emit('selectArea', val)
    }
  }
}
</script>
<style lang="less" scoped>
.area-list {
  margin-top: 20px;
  & > p {
    margin: 0;
    cursor: pointer;
  }
}
</style>
