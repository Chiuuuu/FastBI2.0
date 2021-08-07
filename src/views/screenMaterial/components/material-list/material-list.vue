<template>
  <div class="material-list">
    <template v-if="materialList.length > 0">
      <MaterialListItem v-for="item in materialList" :key="item.id" :data="item" v-on="$listeners" />
    </template>
    <a-empty class="material-list-empty" :imageStyle="{ height: '200px' }" v-else></a-empty>
  </div>
</template>

<script>
import MaterialListItem from './material-list-item.vue'
export default {
  name: 'MaterialList',
  props: {
    materialList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  components: {
    MaterialListItem
  },
  data() {
    return {

    }
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
.material-list {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}
.material-list-empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-90px, -115px);
}
</style>
