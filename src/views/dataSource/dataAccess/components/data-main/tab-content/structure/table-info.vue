<template>
  <a-modal
    title="查看表信息"
    width="920px"
    :bodyStyle="bodyStyle"
    :footer="null"
    :visible="show"
    @cancel="$emit('close')"
  >
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
    <a-spin style="padding: 0 50px" :spinning="spinning">
      <div class="table-area scrollbar">
        <table class="check-table">
          <thead>
            <tr>
              <th>序号</th>
              <th v-for="(item, index) in colPagination.currentCol" :key="index" :title="item['COLUMN_NAME']">
                {{ item['COLUMN_NAME'] }}
                <span class="type">{{ item['TYPE_NAME'] | formatType }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in colPagination.tableData" :key="index">
              <td>{{ index + 1 }}</td>
              <td
                v-for="(col, i) in colPagination.currentCol"
                :key="i"
                :title="item[col['COLUMN_NAME']]"
              >{{ item[col['COLUMN_NAME']] }}</td>
            </tr>
          </tbody>
        </table>
        <a-empty class="table-empty" v-if="colPagination.tableData.length === 0"></a-empty>
      </div>
    </a-spin>
  </a-modal>
</template>

<script>
import ColPagination from '@/utils/table-col-pagination'
export default {
  name: 'tableInfo',
  props: {
    show: Boolean,
    tableId: String
  },
  data() {
    return {
      spinning: false,
      bodyStyle: { height: 'calc(100vh - 240px)', 'overflow-y': 'auto', padding: '0' },
      colPagination: new ColPagination({
        total: 0,
        size: 50,
        page: 1
      })
    }
  },
  filters: {
    formatType: function(value) {
      switch (value) {
        case 'BIGINT':
        case 'INT':
          return '整数'
        case 'DECIMAL':
          return '数值'
        case 'TIMESTAMP':
        case 'TIME':
          return '日期时间'
        case 'DATE':
          return '日期'
        case 'DOUBLE':
          return '小数'
        case 'VARCHAR':
          return '字符串'
        default:
          return '字符串'
      }
    }
  },
  watch: {
    show(newValue, oldValue) {
      if (newValue) {
        this.colPagination = this.$options.data().colPagination
        this.handleGetTableInfo()
      }
    }
  },
  methods: {
    handleGetTableInfo() {
      const { size, page } = this.colPagination.config
      if (!this.colPagination.validPageSection()) {
        this.spinning = true
        const params = {
          id: this.tableId,
          size: size,
          page: page
        }
        this.$server.dataAccess
          .getTableInfo(params)
          .then((res) => {
            if (res.code === 200) {
              this.colPagination.config.total = res.total
              this.colPagination.handleColCache(res.tableDataInfo.headers, res.tableDataInfo.rows)
            } else {
              this.$message.error(res.msg)
            }
          })
          .finally(() => {
            this.spinning = false
          })
      }
    },
    handleChangePage(type) {
      if (type === 'add') {
        this.colPagination.config.page++
      } else if (type === 'minus') {
        this.colPagination.config.page--
      }
      this.handleGetTableInfo()
    }
  }
}
</script>

<style lang="less" scoped>
.table-area {
  overflow: auto;
  height: calc(100vh - 240px);
}
.check-table {
  width: 100%;
  border: 1px solid #e8e8e8;
  td,
  th {
    font-size: 14px;
    height: 21px;
    padding: 8px;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  th {
    background: #f8f8fa;
  }
  tr {
    border-top: 1px solid #e8e8e8;
    border-bottom: 1px solid #e8e8e8;
  }
  .type {
    font-size: 12px;
    color: #9c9c9c;
    font-weight: normal;
  }
}
.table-empty {
  padding: 20px 0;
  margin: 0;
  border-right: 1px solid #e8e8e8;
  border-left: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
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
