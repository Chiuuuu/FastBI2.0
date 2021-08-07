<template>
  <div
    class="field-select"
    :class="isDimension ? 'is-dimension' : 'is-measure'"
    @click="handleClick"
  >
    <span>{{ text }}</span>
    <div class="caret-down"></div>
  </div>
</template>

<script>
import ContextMenu from '@/components/dataSource/contextmenu'

export default {
  name: 'fieldSelect',
  props: {
    isDimension: {
      type: Boolean,
      default: false
    },
    contextmenus: Array,
    text: [String, Number],
    selectData: Object
  },
  data() {
    return {
      contenxtmenu: ''
    }
  },
  methods: {
    handleClick(e) {
      e.stopPropagation()
      const that = this
      // 原始数据类型
      let _type = that.selectData.dataType
      console.log('原始数据', _type)
      this.contenxtmenu = new ContextMenu({
        vm: that,
        menus: that.contextmenus.map(item => {
          if (item.dataType === _type) {
            item.name = `还原为${item.name.split('为')[1]}`
          } else {
            item.name = `转换为${item.name.split('为')[1]}`
          }
          item.$$fun = function() {
            Array.prototype.push.call(arguments, that)
            item.onClick.apply(this, arguments)
          }
          return item
        }),
        target: e
      })
    }
  }
}
</script>

<style lang="less" scoped>
.field-select {
  position: relative;
  width: 100px;
  cursor: pointer;
}
.caret-down {
  width: 0;
  height: 0;
  border: 6px solid white;
  position: absolute;
  top: 14px;
  right: 10px;
  transform: translateY(-50%);
}
.is-dimension {
  color: #4a90e2;
  .caret-down {
    border-color: #4a90e2 transparent transparent transparent;
  }
}
.is-measure {
  color: #40c0a8;
  .caret-down {
    border-color: #40c0a8 transparent transparent transparent;
  }
}
</style>
