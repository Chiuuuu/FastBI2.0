<template>
  <a-modal
    class="widthModal"
    :visible="isShow"
    :title="item.name"
    :bodyStyle="bodyStyle"
    width="1000px"
    @cancel="handleClose"
  >
    <template #footer>
      <a-button key="back" @click="handleClose">
        取消
      </a-button>
    </template>
    <a-button
      class="arrow arrow-left"
      :disabled="colPagination.config.page === 1"
      type="primary"
      icon="left"
      @click="handleChangePage('minus')"
    />
    <a-button
      class="arrow arrow-right"
      :disabled="colPagination.config.page * colPagination.config.size >= colPagination.config.total"
      type="primary"
      icon="right"
      @click="handleChangePage('add')"
    />
    <a-spin style="padding: 0 50px;" :spinning="loading">
      <div class="table-area scrollbar">
        <table class="table">
          <thead>
            <tr>
              <th>
                <div class="txt-wrap">
                  <div class="txt txt-order">序号</div>
                  <div class="hr" data-resize="true"></div>
                </div>
              </th>
              <template v-for="item in colPagination.currentCol">
                <th :key="item.name">
                  <div class="wrap">
                    <div class="txt" :title="item.name">
                      <span class='txt-title'>{{item.name}}</span>
                    </div>
                  </div>
                </th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item,index) in colPagination.tableData" :key="index">
              <td><div class="txt txt-order">{{index+1}}</div></td>
              <td
                v-for="(col, i) in colPagination.currentCol"
                :key="i"
                :title="item[col.name]"
              ><div class="txt" :title="item[col.name]">{{ item[col.name] }}</div></td>
            </tr>
          </tbody>
        </table>
        <a-empty v-if="colPagination.tableData.length === 0" class="main-empty"></a-empty>
      </div>
    </a-spin>
  </a-modal>
</template>

<script>
import ColPagination from '@/utils/table-col-pagination'
export default {
  name: 'renderTableInfo',
  props: {
    isShow: Boolean,
    item: {
        type: Object,
        default: () => {}
    }
  },
  data() {
    return {
      bodyStyle: { height: 'calc(100vh - 240px)', 'overflow-y': 'auto', padding: '0' },
      colPagination: new ColPagination({
        total: 0,
        size: 50,
        page: 1
      }),
      data: [],
      loading: true
    }
  },
  watch: {
    isShow: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.colPagination = this.$options.data().colPagination
          this.handleGetData()
        }
      }
    }
  },
  methods: {
    /**
     * 获取数据
    */
    async handleGetData() {
      const { size, page } = this.colPagination.config
      if (!this.colPagination.validPageSection()) {
        this.loading = true
        const result = await this.$server.dataModel.getTableDetailInfo({
          tableName: this.item.name,
          tableId: this.item.id,
          databaseId: this.item.databaseId,
          current: page,
          columnSize: size
        })

        if (result.code === 200) {
          this.colPagination.config.total = result.data.total
          this.colPagination.handleColCache(result.data.columnNameList, result.data.rows)
          this.$nextTick(() => {
            this.loading = false
          })
        } else {
          this.$message.error(result.msg, 1).then(() => {
            this.loading = false
          })
        }
      }
    },
    handleChangePage(type) {
      if (type === 'add') {
        this.colPagination.config.page++
      } else if (type === 'minus') {
        this.colPagination.config.page--
      }
      this.handleGetData()
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
  height: calc(100vh - 240px);
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
.arrow {
  position: absolute;
  z-index: 2001;
  top: 50%;
  height: 100px;
  width: 23px;
}
.arrow-left {
  left: 10px;
}
.arrow-right {
  right: 10px;
}
</style>
