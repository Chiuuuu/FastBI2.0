<template>
  <a-spin class="sheet-table scrollbar" :spinning="spinning">
    <template v-if="currentFieldList.length > 0">
      <table>
        <thead class="sheet-head">
          <tr style="border: none">
            <th v-for="(item, index) in currentColumns" :key="item.dataIndex">
              <div class="cell-item">
                <template v-if="index === 0 || !showSwitch">
                  {{ item.title }}
                </template>
                <template v-else>
                  <DataType :item="item" v-on="$listeners" />
                </template>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="sheet-body scrollbar">
          <tr v-for="(item, index) in currentFieldList" :key="item.key">
            <td>
              <div class="cell-item">{{ index + 1 }}</div>
            </td>
            <td v-for="col in currentColumns.slice(1)" :key="col.dataIndex">
              <div class="cell-item">{{ item[col.dataIndex] }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
    <a-empty style="margin: 20px 0" v-else></a-empty>
  </a-spin>
</template>

<script>
import DataType from './data-type.vue';
export default {
  name: '',
  props: {
    spinning: Boolean,
    showSwitch: Boolean,
    currentFieldList: {
      type: Array,
      required: true,
      default() {
        return [];
      },
    },
    currentColumns: {
      type: Array,
      required: true,
      default() {
        return [];
      },
    },
  },
  components: {
    DataType,
  },
  data() {
    return {
      switching: false,
    };
  },
  methods: {},
};
</script>

<style lang="less" scoped>
@import '../tab-content/entry/read-file-table';
</style>
