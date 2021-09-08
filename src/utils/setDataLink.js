import Vue from 'vue';
import store from '@/store';
// 设置联动的图标的数据
export async function setLinkageData(value, selectedComponent, pickList = null) {
  let bindCharts = selectedComponent.setting.interaction.bindedList;
  // 没有关联图表不需要联动
  if (!bindCharts) {
    return;
  }
  // 获取需要筛选的维度信息(字段名是pickField)
  let limits = [];
  if (pickList) {
    limits = pickList.map(pickObj => {
      const { pickField, pickValue, index = 0 } = pickObj;
      let pickData = selectedComponent.setting.data[pickField][index];
      const { pivotschemaId, dataType, name } = pickData;
      let obj = {
        pivotschemaId,
        dataType,
        name,
        filterType: 1,
      };
      if (pickData.role === 1) {
        return { ...obj, value: [pickValue] };
      } else {
        return {
          ...obj,
          rules: [
            {
              condition: 'equal',
              action: 'equal',
              firstValue: pickValue,
              secondValue: '',
            },
          ],
        };
      }
    });
  } else {
    const pickData = selectedComponent.setting.data.dimensions[0];
    const { pivotschemaId, dataType, name } = pickData;
    limits = [
      {
        pivotschemaId,
        dataType,
        name,
        filterType: 1,
        value: [value],
      },
    ];
  }
  // 关联的每个图表进行数据筛选
  for (let chartId of bindCharts) {
    let chart = store.state.board.components.find(item => item.id === chartId);
    if (!chart) {
      continue;
    }
    Vue.set(chart.setting.data, 'dataLink', limits);
  }
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
