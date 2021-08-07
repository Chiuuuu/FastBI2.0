<template>
  <div class="box">
    <div class="item table-item">
      <h6
        class="dragable"
        style="border-color: rgb(8, 140, 237);"
      >
        {{ nodeData.props[`${title}`] }}
      </h6>
      <div v-if="nodeData.props.type === 2" class="union"></div>
      <span class="opt">
        <b class="num">{{joinLength}}</b>
      </span>
    </div>
    <div class="wrap">
      <show-tree-node
        v-for="(item, subindex) in nodeData.children"
        :key="subindex"
        :node-data="item"
        :title="title"
      ></show-tree-node>
    </div>
  </div>
</template>
<script>
export default {
  name: 'show-tree-node',
  props: {
    nodeData: {
      type: Object,
      default: function() {
        return {}
      }
    },
    title: {
      type: String,
      default: 'title'
    }
  },
  computed: {
    joinLength() {
      return this.nodeData.props.join && this.nodeData.props.join.conditions.length
    }
  }
}
</script>
<style lang="stylus" scoped>
.m-map {
    .box {
        white-space: nowrap;
        padding-right: 3px;
    }
    .item,
    .wrap {
        position: relative;
        display: inline-block;
        vertical-align: top;
    }
    .item {
        position: relative;
        line-height: 34px;
        margin-bottom: 5px;
        width: 150px;
        height: 36px;
        border: 1px solid #dedede;
        color: #666;
        border-radius: 2px;
        background: #f1f1f1;
        &.z-on {
            border-color: #4a91e3;
            box-shadow: 0 0 6px #4a91e3;
        }
        h6 {
            position: relative;
            z-index: 10;
            padding: 0 25px 0 10px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            background-color: #f1f0ff;
            text-align: center;
        }
        .union {
            position: absolute;
            top: 4px;
            left: 4px;
            display: block;
            width: 100%;
            height: 100%;
            border: 1px solid #d9d9d9;
        }
        .opt {
            position: absolute;
            z-index: 9;
            left: -68px;
            top: 50%;
            width: 26px;
            height: 26px;
            line-height: 26px;
            margin-top: -13px;
            text-align: center;
            border: 1px solid #ddd;
            border-radius: 50%;
            color: #999;
            background: #fff;
            b {
                display: block;
                font-size: 14px;
                color: #6b9de3;
                font-weight: 700;
                position: absolute;
                width: 100%;
                height: 26px;
                line-height: 26px;
            }
        }
    }
    .wrap {
        overflow: hidden;
        margin-left: 0;
        position: relative;
        .box {
            margin-left: 115px;
            &+.box>.item {
                &:before {
                    position: absolute;
                    left: -89px;
                    top: -10000px;
                    bottom: 25px;
                    border-left: 1px solid #dedede;
                    content: "";
                }
                &:after {
                    position: absolute;
                    top: 8px;
                    left: -89px;
                    width: 87px;
                    height: 10px;
                    border: 1px solid #dedede;
                    border-width: 0 0 1px 1px;
                    content: "";
                }
            }
            &:first-child>.item {
                z-index: 1;

                &:before {
                    position: absolute;
                    z-index: 200;
                    top: -1px;
                    left: -89px;
                    width: 1px;
                    height: 20px;
                    background: #fff;
                    content: "";
                }
                &:after {
                    position: absolute;
                    top: 19px;
                    left: -120px;
                    width: 120px;
                    border-top: 1px solid #dedede;
                    content: "";
                }
            }
        }
    }
}
</style>
