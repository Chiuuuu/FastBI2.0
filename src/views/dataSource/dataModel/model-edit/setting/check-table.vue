<template>
  <a-modal
    class="widthModal"
    :visible="isShow"
    title="查看宽表"
    width="1000px"
    :confirmLoading="confirmLoading"
    okText="导出宽表"
    :destroyOnClose="true"
    :okButtonProps="{
      props: { disabled: data.length > 0 ? false : true },
    }"
    @cancel="handleClose"
  >
    <template #footer>
      <a-button key="back" @click="handleClose">
        取消
      </a-button>
      <a-button
        key="submit"
        type="primary"
        v-if="hasEditPermission"
        :loading="confirmLoading"
        @click="handleExport"
      >
        导出宽表
      </a-button>
    </template>
    <a-spin :spinning="loading">
      <a-empty v-if="data.length === 0" class="main-empty">
        <span slot="description">此宽表无数据</span>
      </a-empty>
      <div class="table-area" v-else>
        <table class="table">
          <thead>
            <tr>
              <th>
                <div class="txt-wrap">
                  <div class="txt txt-order">序号</div>
                  <div class="hr" data-resize="true"></div>
                </div>
              </th>
              <template v-for="(item,index) in columnsList">
                <th :key="item.title">
                  <div class="wrap">
                    <!-- <div class="menu-left">
                      <i class="u-icn u-icn-string"></i>
                    </div> -->
                    <div class="txt" :title="item.name">
                      <span class='txt-title'>{{item.name}}</span>
                      <span class='columns-type'>{{setColumnsType(columnsList[index])}}</span>
                    </div>
                  </div>
                </th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item,index) in data" :key="index">
              <td><div class="txt txt-order">{{index+1}}</div></td>
              <td v-for="(subitem,subIndex) in item" :key="subIndex">
                <div class="txt" :title="subitem">{{subitem}}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </a-spin>
  </a-modal>
</template>

<script>
import { hasPermission } from '@/utils/permission'
export default {
  name: 'checkTable',
  props: {
    isShow: Boolean,
    detailInfo: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      columns: [],
      columnsList: [],
      data: [],
      loading: true,
      confirmLoading: false
    }
  },
  watch: {
    isShow: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.handleGetData()
        }
      }
    }
  },
  computed: {
    hasEditPermission() {
      return hasPermission(this.$store.state.common.privileges, this.$PERMISSION_CODE.OPERATOR.export)
    }
  },
  methods: {
    /**
     * 重置data数据
    */
    handleResetData() {
      Object.assign(this.$data, this.$options.data())
    },
    /**
     * 设置表头类型
    */
    setColumnsType(item) {
      const type = item.convertType.toUpperCase()
      switch (type) {
        case 'VARCHAR':
          return '字符串'
        case 'TIMESTAMP':
          return '时间'
        case 'DATE':
          return '日期'
        case 'BIGINT':
          return '整数'
        case 'DECIMAL':
          return '数值'
        case 'DOUBLE':
          return '小数'
        default:
          return '未知类型'
      }
    },
    /**
     * 获取数据
    */
    async handleGetData() {
      this.handleResetData()

      // 设置表头
      // this.handleFormatTableColumn()

      const params = {
        ...this.detailInfo,
        pivotSchema: {
          ...this.$parent.handleConcat() // 处理维度度量
        }
      }
      const result = await this.$server.dataModel.getWidthTableInfo(params)

      if (result.code === 200) {
        this.columnsList = result.data.columnNameList
        this.data = result.data.rows
        this.$nextTick(() => {
          this.loading = false
        })
      } else {
        this.$message.error(result.msg)
      }
    },
    /**
     * 表格column处理
     */
    handleFormatTableColumn() {
      this.columns = []
      // 注意先执行维度的
      this.handleDoWithColumn(this.$parent.dimensions)
      this.handleDoWithColumn(this.$parent.measures)
    },
    /**
     * 处理表头
    */
    handleDoWithColumn(obj) {
      if (obj) {
        Object.keys(obj).map(key => {
          const keyArry = obj[key]
          keyArry.forEach((item, index) => {
            if (item.visible) {
              this.columns.push({
                title: item.alias
              })
            }
          })
        })
      }
    },
    async handleExport() {
      this.confirmLoading = true
      const params = {
        ...this.detailInfo,
        pivotSchema: {
          ...this.$parent.handleConcat() // 处理维度度量
        }
      }
      const result = await this.$server.dataModel.actionDownloadfile(params).finally(() => {
        this.confirmLoading = false
      })

      if (result['code'] && result['code'] !== 200) {
        // xlsx有错的情况，将blob对象转成json
        const reader = new FileReader()
        reader.readAsText(result.data)
        reader.onload = () => {
          const readerResult = JSON.parse(reader.result) // 此处的msg就是后端返回的msg内容
          this.$message.error(readerResult.msg)
        }
        return
      }
      let blob = new Blob([result], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      let url = window.URL.createObjectURL(blob) // 通过URL.createObjectURL生成文件路径
      let a = document.createElement('a') // 创建a标签
      a.style.display = 'none'
      a.href = url // 设置href属性为文件路径，download属性可以设置文件名称
      a.download = '宽表数据.xlsx'

      document.querySelectorAll('body')[0].appendChild(a) // 将a标签添加到页面并模拟点击
      a.click()
      window.URL.revokeObjectURL(url) // 释放掉blob对象
      this.handleClose()
    },
    handleClose() {
      this.$emit('close')
    }
  }
}
</script>
<style lang="less" scoped>
@deep: ~'>>>';
.widthModal {
  @{deep} .ant-modal-body{
    padding: 0;
  }
}
.table-area {
  overflow: auto;
  height: calc(60vh - 10px);
}
.table {
  table-layout: fixed;
  min-width: 100%;
  white-space: nowrap;
  th {
    background: #fff;
  }
  td {
    white-space: pre-wrap;
    word-wrap: break-word;
    word-break: break-all;
  }
  th,td {
    padding: 0 12px;
    height: 30px;
    line-height: 30px;
    border: 1px solid #efefef;
  }
  .txt-wrap {
    position: relative;
    min-width: 10px;
    width: 30px;
    .hr {
      width: 3px;
      height: 30px;
      border: none;
      cursor: col-resize;
      position: absolute;
      top: 0;
      right: -20px;
    }
  }
  .txt {
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 168px;
    white-space: nowrap;
    .txt-title {
      max-width: 100px;
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: bottom;
    }
  }
  .columns-type {
    font-size: 12px;
    font-weight: 100;
    color: #9c9c9c;
    margin-left: 5px;
  }
  .txt-order {
    width: 50px;
  }
  .menu-left {
    float: left;
    position: relative;
  }
  .wrap .txt {
    width: auto;
  }
  tbody tr:nth-child(odd) {
    background: #f5f5f5;
  }
}
</style>
