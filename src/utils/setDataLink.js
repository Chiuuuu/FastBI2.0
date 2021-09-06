import Vue from 'vue';
import store from '@/store';
// 设置联动的图标的数据
export async function setLinkageData(pickValue, selectedComponent, pickField = 'dimensions') {
  let bindCharts = selectedComponent.setting.interaction.bindedList;
  // 没有关联图表不需要联动
  if (!bindCharts) {
    return;
  }
  // 获取需要筛选的维度信息(字段名是pickField)
  let pickData = selectedComponent.setting.data[pickField][0];
  pickData.value = pickValue;
  // 关联的每个图表进行数据筛选
  for (let chartId of bindCharts) {
    let chart = store.state.board.components.find(item => item.id === chartId);
    if (!chart) {
      continue;
    }
    getBindData(chart, pickData);
  }
}
// 获取联动数据筛选数据,不需要保存
async function getBindData(chart, pickData) {
  let { pivotschemaId, dataType, value, name } = pickData;
  let limits = [{ pivotschemaId, dataType, value, name, filterType: 1 }];
  Vue.set(chart.setting.data, 'dataLink', limits);
}
// 重置被联动的图标数据
export function resetOriginData(selectedComponent) {
  let bindCharts = selectedComponent.setting.interaction.bindedList;
  for (let chartId of bindCharts) {
    let chart = store.state.board.components.find(item => item.id === chartId);
    if (!chart) {
      continue;
    }
    // 删除联动数据
    Vue.delete(chart.setting.data, 'dataLink');
  }
}
