<template>
  <div class="popover-row" :class="error ? 'z-err' : ''">
    <a-row>
      <a-col :span="10">
        <a-select
          show-search
          style="width: 100%"
          v-model="row.leftFieldId"
          :filter-option="filterOption"
          @change="value => handlePopoverSelectChange('left', value, row)"
        >
          <a-select-option
            v-for="item in popoverLeftList"
            :key="item.id"
            :valule="item.id"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-col>
      <a-col :span="2">
        <div class="equal">=</div>
      </a-col>
      <a-col :span="10">
        <a-select
          show-search
          style="width: 100%"
          v-model="row.rightFieldId"
          :filter-option="filterOption"
          @change="value => handlePopoverSelectChange('right', value, row)"
        >
          <a-select-option
            v-for="item in popoverRightList"
            :key="item.id"
            :valule="item.id"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-col>
      <a-col :span='2' class="delete" v-if="list.length > 1">
        <a-button type='link' @click="handledeleteCondition(index, row)"><a-icon type="delete" /></a-button>
      </a-col>
    </a-row>
    <div class="err-message">
      无法关联，字段数据类型不一致
    </div>
  </div>
</template>
<script>
import { Row } from 'ant-design-vue'
export default {
  name: 'TreeNodePopoverRow',
  props: {
    list: {
      type: Array,
      required: true,
      default: () => []
    },
    row: {
      type: Object,
      required: true,
      default: () => {}
    },
    index: {
      type: Number,
      required: true,
      default: 0
    },
    popoverLeftList: {
      type: Array,
      required: true,
      default: () => []
    },
    popoverRightList: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      error: false
    }
  },
  methods: {
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    handlePopoverSelectChange(type, value, row) {
        const leftNode = this.popoverLeftList.filter(item => item.id === (type === 'left' ? value : row.leftFieldId)).pop()
        const rightNode = this.popoverRightList.filter(item => item.id === (type === 'left' ? row.rightFieldId : value)).pop()

        if (leftNode && rightNode) {
            this.error = leftNode.dataType !== rightNode.dataType
            if (!this.error) {
              this.$emit('update-condition', this.index, row, this.$data)
            }
            this.$emit('change-status', this.index, row, this.$data)
        }
    },
    handledeleteCondition(index, row) {
        if (row.leftFieldId && row.rightFieldId) {
          this.$emit('dele-condition', index, row)
        }
        this.list.splice(index, 1)
    }
  }
}
</script>
