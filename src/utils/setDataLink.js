import Vue from 'vue';
import store from '@/store';
// 设置联动的图标的数据
export async function setLinkageData(pickValue, selectedComponent) {
  let bindCharts = selectedComponent.setting.interaction.bindedList;
  // 没有关联图表不需要联动
  if (!bindCharts) {
    return;
  }
  // 获取需要筛选的维度信息
  let dimensionData = { pivotschemaId: 0, dataType: 0, name: '' }; //  selectedComponent.setting.data.dimensions[0];
  dimensionData.value = pickValue;
  // 关联的每个图表进行数据筛选
  for (let chartId of bindCharts) {
    let chart = store.state.board.components.find(item => item.id === chartId);
    if (!chart) {
      continue;
    }
    getBindData(chart, dimensionData);
  }
}
// 获取联动数据筛选数据,不需要保存
async function getBindData(chart, dimensionData) {
  const data = chart.setting.data;
  // 进行过数据筛选的不再执行联动
  if (data.options.fileList.length) {
    return;
  }
  let { pivotschemaId, dataType, value, name } = dimensionData;
  let dimensionsLimit = [{ pivotschemaId, type: 1, dataType, value, name }];
  Vue.set(chart.setting.data, 'dataLink', dimensionsLimit);
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
