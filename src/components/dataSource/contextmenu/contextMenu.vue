<template>
  <div
    v-if="renderMenus.length > 0"
    class="m-overlay m-overlay-shadow"
    :style="styleObj"
  >
    <div class="m-ctxMenu" ref="ctxMenuRef">
      <ul>
        <li
          class="z-clickable"
          v-for="item in renderMenus"
          :key="item.name"
          @click="handleItemClick($event, item)"
        >
          <span
            >{{ item.name }}
            <a-icon type="right" class="icon-cart" v-if="hasChildren(item)"
          /></span>
          <ul class="sub" v-if="hasChildren(item)">
            <li
              class="z-clickable"
              v-for="subitem in item.children"
              :key="subitem.name"
              @click="handleItemClick($event, subitem)"
            >
              {{ subitem.name }}
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import { checkActionPermission } from '@/utils/permission'
export default {
  name: 'contextMenu',
  props: {
    vm: {
      type: Object,
      default: () => {}
    },
    menus: {
      type: Array,
      default: function() {
        return []
      }
    },
    target: {
      type: [MouseEvent, Object],
      default: () => {}
    },
    remove: {
      type: Function
    },
    customStyle: {
      type: Function
    }
  },
  data() {
    return {
      renderMenus: [],
      styleObj: {}
    }
  },
  watch: {
    menus: {
      immediate: true,
      handler(value) {
        if (value && Array.isArray(value)) {
          this.renderMenus = value.filter(item => {
            let hasPermission = true
            if (item['permission']) {
              const { OBJECT, OPERATOR } = item.permission

              const file = this.vm.file || this.vm.folder
              if (file && file.privileges) {
                // 根据接口返回的权限判断
                if (file.privileges.includes(0)) {
                  hasPermission = true
                } else {
                  hasPermission = file.privileges.includes(OPERATOR)
                }
              } else {
                // 如果 file.privileges 不存在则根据全局权限判断
                hasPermission = checkActionPermission(OBJECT, OPERATOR)
              }
            }
            if (hasPermission) return item
          })
        } else {
          throw new Error('数据不存在或者不是一个数组')
        }
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.doWithPosition()
    })
  },
  methods: {
    doWithPosition() {
      // 是否启用自定义设置，可以根据特殊情况自定义
      if (this.customStyle) {
        this.styleObj = this.customStyle()
        return
      } else if (!this.$refs.ctxMenuRef) {
        // 如果没渲染则直接返回
        this.styleObj = {}
        return
      }
      // 浏览器可视区域的高度(兼容处理)
      const clientHeight =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight
      // 获取列表高度
      const ctxMenuDomHeight = this.$refs.ctxMenuRef.offsetHeight
      // 点击目标的位置
      const targetY = this.target.clientY
      // 是否超过底部
      const isMoreThanBottom = targetY + ctxMenuDomHeight - clientHeight > 0
      const top = isMoreThanBottom ? targetY - ctxMenuDomHeight : targetY
      this.styleObj = {
        left: this.target.clientX + 'px',
        top: top + 'px'
      }
    },
    hasChildren(item) {
      return item['children'] && item.children.length
    },
    handleItemClick(event, item) {
      if (item.$$fun) {
        this.remove()
        item.$$fun(event, item)
      }
    }
  }
}
</script>
<style lang="less" scoped>
.m-overlay {
  position: absolute;
  z-index: 1002;
}
.m-overlay-shadow {
  width: 182px;
  -webkit-box-shadow: 0 2px 14px rgba(0, 0, 0, 0.15);
  -moz-box-shadow: 0 2px 14px rgba(0, 0, 0, 0.15);
  -ms-box-shadow: 0 2px 14px rgba(0, 0, 0, 0.15);
  -o-box-shadow: 0 2px 14px rgba(0, 0, 0, 0.15);
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.15);
}
.m-ctxMenu {
  background: #fff;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.16);
  border-radius: 2px;
  ul {
    margin: 0;
  }
  li {
    cursor: default;
    position: relative;
    font-size: 12px;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    -ms-box-sizing: border-box;
    -o-box-sizing: border-box;
    box-sizing: border-box;
    padding-left: 24px;
    padding-right: 18px;
    height: 32px;
    line-height: 32px;
    min-width: 180px;
    background-color: #fff;
    white-space: nowrap;
    &:hover {
      background-color: #e0e0e0;

      ul.sub {
        display: block;
      }
    }

    .icon-cart {
      position: absolute;
      right: 5px;
      top: 50%;
      transform: translateY(-50%);
    }

    ul.sub {
      display: none;
      position: absolute;
      left: -100%;
      top: 0;
      border: 1px solid #ccc;
      border-right: 0;
    }
  }
}
</style>
