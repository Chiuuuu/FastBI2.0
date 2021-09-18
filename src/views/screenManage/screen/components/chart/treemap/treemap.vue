<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import { mutationTypes as boardMutation } from '@/store/modules/board';
import defaultData from './default-data';
import minBy from 'lodash/minBy';
import maxBy from 'lodash/maxBy';
import mergeWith from 'lodash/mergeWith';
import Node from './node';
import { setLinkageData, resetOriginData } from '@/utils/setDataLink';
/**
 * @description 矩形树图
 */
export default {
  name: `${BoardType.ChartBar}View`,
  extends: BaseChart,
  data() {
    return {
      treeRoot: '', // 树根节点
      isRenderMeasure: false, // 根据度量渲染
      defaultDimensions: [
        {
          name: '公司',
        },
        {
          name: '部门名称',
        },
        {
          name: '员工姓名',
        },
      ],
      defaultMeasures: [
        {
          name: 'bumenTableid',
        },
      ],
      currentSeriesIndex: null, // 图表联动选中的下标
      currentDataIndex: null, // 图表联动选中的下标
    };
  },
  methods: {
    /**
     * @description 获取拖入的维度度量列数据
     */
    getFieldList() {
      const { data } = this.options;
      return [].concat(data.dimensions).concat(data.measures);
    },
    /**
     * @description 判断是否获取服务端数据
     */
    isServerData() {
      const { data } = this.options;
      return data.dataModelId && data.dimensions.length && data.measures.length;
    },
    /**
     * @description 转换成等比
     * @param {array} list 列表数据
     * @param {array} title 标题
     * @param {object} dimensions 维度
     * @param {object} currentDimension 当前的维度
     * @param {number} level 层级
     */
    changeToAverage(list, title, dimensions, currentDimension, level) {
      if (list && list.length) {
        list.forEach(item => {
          if (dimensions.length - 1 !== level) {
            item.value = [1];
          } else {
            item.value.unshift(1);
          }
          this.changeToAverage(item.children, title, dimensions, currentDimension, level + 1);
        });
      }
    },
    /**
     * @description 列表转成树形结构数据
     * @param {object} root 根节点
     * @param {array} list 列表数据
     * @param {object} options 配置项
     * @param {array} options.dimensions 维度
     * @param {array} options.measures 度量
     * @param {number} options.level 层级
     * @param {boolean} options.isNode 是否为节点
     * @param {array} options.pieces 分段数据
     */
    conversionTree(root, list, options) {
      const { dimensions, measures, level, isNode, pieces } = options;

      const rootValue = root.value;

      if (dimensions.length === level) {
        // 最外层子节点的时候需要将最里面的父节点值进行添加
        const last = root.parentValue[root.parentValue.length - 1];
        root.value.push(last);
        return;
      }

      // 是否为外层
      const isEnd = dimensions.length === level + 1;

      // map数据结构进行记录
      const map = new Map();

      // 存放叶子节点
      const nodeChild = [];

      list.forEach(data => {
        // 根据是否为节点获取自身属性
        const props = isNode ? data.getProps() : data;

        // 创建一个叶子节点
        const node = new Node(props);

        // 获取拖拽进来的维度名称
        const key = node.props[dimensions[level].name];
        const selfValue = node.props[measures[0].name];

        if (!key) return;

        if (!map.has(key)) {
          // 不存在则创建
          map.set(key, nodeChild.length);

          const parent = new Node(props);
          parent.setField('name', key);
          parent.setField('parentValue', rootValue);

          // 设置自身当前值
          // 自身值始终为一个数组（除了根节点）
          // 并且第一个表示为自身当前值
          if (typeof parent.parentValue[0] !== 'undefined') {
            parent.setField('value', [selfValue, parent.parentValue[0]]);
          } else {
            parent.setField('value', [selfValue]);
          }

          if (!isEnd) {
            parent.add(node);
          }

          nodeChild.push(parent);
        } else {
          // 存在则继续添加
          const parent = nodeChild[map.get(key)];

          // 父节点的自身值要继续叠加
          const sum = parent.value[0] + selfValue;
          parent.value.splice(0, 1, sum);

          if (!isEnd) {
            parent.children.push(node);
          }
        }
      });

      // 子节点
      root.children = nodeChild;
      if (nodeChild && nodeChild.length) {
        nodeChild.forEach((data, nodeIndex) => {
          if (data.children && data.children) {
            const root = nodeChild[nodeIndex];
            if (level === 0) {
              // 设置分段的数据
              const item = {
                label: data.name,
                value: data.value[0],
              };
              const replaceIndex = pieces.findIndex(i => i.label === item.label);
              if (pieces.length && replaceIndex > -1) {
                // 记录最大值
                item.value = Math.max(pieces[replaceIndex].value, item.value);
                pieces.splice(replaceIndex, 1, item);
              } else {
                pieces.push(item);
              }
            }
            // 递归调用设置
            this.conversionTree(
              root,
              data.children,
              Object.assign({}, options, {
                level: level + 1,
                isNode: true,
              }),
            );
          }
        });
      }
    },
    doWithVisualMap(dimension, pieces) {
      const {
        style: { echart },
      } = this.options;

      if (!this.isRenderMeasure) {
        return Object.assign({}, echart.visualMap, {
          dimension,
          pieces,
          inRange: { color: echart.customPiecewiseColors },
        });
      } else {
        const visualMap = {
          show: true,
          type: 'continuous',
          max: maxBy(pieces, 'value').value,
          min: minBy(pieces, 'value').value,
          dimension: dimension + 1,
          inRange: { color: echart.customContinuousColors },
        };
        return visualMap;
      }
    },
    /**
     * @description 处理标签字体等
     * 1. 当在初始化的时候设置添加label.show为false
     * 2. 并且矩形树图需要重新设置一遍
     * 3. 如果不进行以上两项，会报错
     */
    doWithLabel(echart) {
      const label = Object.assign({}, echart.customSeries.label, {
        formatter: this.doWithFormatter(echart),
      });
      this.chartInstane.setOption({
        series: [
          {
            label,
          },
        ],
      });
    },
    doWithFormatter(echart) {
      let formatter = params => {
        const target = params.data;
        const result = echart['customFormatterLabel'].map(item => {
          if (target.props) {
            return target.props[item];
          } else {
            return target.children[0].props[item];
          }
        });
        return result.toString();
      };
      return formatter;
    },
    /**
     * @description 处理鼠标移入提示框内容
     */
    doWithTooltip(echart) {
      const tooltip = Object.assign({}, echart.tooltip, {
        formatter: this.doWithFormatterTooltip(echart),
      });
      this.chartInstane.setOption({
        tooltip,
      });
    },
    doWithFormatterTooltip(echart) {
      let formatter = params => {
        const target = params.data;
        const result = echart['customFormatterTooltip'].map(item => item + '：' + target.props[item]);
        return result.join('<br/>');
      };
      return formatter;
    },
    doWithOptions(fetchData, originDimensions, measures) {
      const pieces = [];
      this.treeRoot = new Node();
      const {
        style: { echart },
      } = this.options;

      const cache = [].concat(originDimensions);
      // 将当前选中的颜色提到最高父级
      const pop = cache.splice(echart.customPiecesIndex, 1)[0];
      cache.unshift(pop);
      this.isRenderMeasure = echart.customPiecesIndex > originDimensions.length - 1;

      // 如果是按度量分配颜色就从维度的最后开始
      // 当前维度提到最高层级, index为0
      const cachePiecesIndex = 0;
      const dimensions = cache.slice(this.isRenderMeasure ? originDimensions.length - 1 : cachePiecesIndex);

      this.conversionTree(this.treeRoot, fetchData.data, {
        dimensions, // 维度
        measures, // 度量
        level: 0, // 层级
        isNode: false, // 是否为节点
        pieces: pieces, // 分段数据
      });

      let visualMap;

      const showWay = {
        measure: () => {
          const dimensionIndex = originDimensions.length - cachePiecesIndex - 1;
          visualMap = this.doWithVisualMap(dimensionIndex, pieces);
        },
        average: () => {
          const dimensionIndex = originDimensions.length - cachePiecesIndex;
          const currentDimension = dimensions[cachePiecesIndex];
          this.changeToAverage(this.treeRoot.children, pieces, dimensions, currentDimension, 0);
          visualMap = this.doWithVisualMap(dimensionIndex, pieces);
        },
      };

      const fn = showWay[echart.customShowWay];
      if (!fn) {
        return console.error(`There is no method: [${echart.customShowWay}]`);
      }
      fn();

      // 这里不能设置label，因为如果当label.show为false会报错
      const options = mergeWith(
        {},
        echart,
        {
          visualMap,
          series: [
            {
              type: 'treemap',
              nodeClick: false,
              leafDepth: null,
              breadcrumb: {
                show: false,
              },
              roam: false, // 缩放
              data: this.treeRoot.children,
            },
          ],
        },
        this.customizer,
      );
      console.log(options);
      return options;
    },
    customizer(objValue, srcValue) {
      if (Array.isArray(objValue)) {
        return (objValue = srcValue);
      }
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      this.shapeUnit.changeLodingChart(true);
      const res = await this.$server.common
        .getData('/screen/graph/v2/getData', {
          id: this.shapeUnit.component.id,
          tabId: this.shapeUnit.component.tabId,
          type: this.shapeUnit.component.type,
          ...this.options.data,
        })
        .finally(() => {
          this.shapeUnit.changeLodingChart(false);
        });
      if (res.code === 500) {
        this.$message.error('isChange');
        return;
      }
      // 在isEmpty改变前判断维度度量数据有没有变
      let needChangeFormatterList = this.isEmpty !== '';
      this.isEmpty = res.data && res.data.length ? false : true;
      if (this.isEmpty) {
        return;
      }
      // 记录维度度量给下一次获取数据判断有没有变动
      this.serverData = {
        data: res.data,
      };
      this.treeRoot = '';

      const formatterList = res.data[0] ? Object.keys(res.data[0]) : [];
      let mergeEchart = {
        customPiecesIndex: 0,
      };
      if (needChangeFormatterList) {
        mergeEchart.customFormatterTooltip = mergeEchart.customFormatterLabel = formatterList;
      }
      // 获取数据之后需要重置配色方案
      this.$store.commit(boardMutation.SET_STYLE, {
        style: {
          echart: mergeEchart,
        },
        replaceMerge: needChangeFormatterList ? ['customFormatterLabel', 'customFormatterTooltip'] : null,
        updateCom: this.shapeUnit.component,
      });
    },
    /*
     * 处理默认数据
     */
    getDefaultData() {
      this.serverData = null;
      this.treeRoot = '';
      // 在isEmpty改变前判断维度度量数据有没有变
      let needChangeFormatterList = this.isEmpty !== '';
      this.isEmpty = false;
      let mergeEchart = {
        customPiecesIndex: 0,
      };
      if (needChangeFormatterList) {
        (mergeEchart.customFormatterLabel = ['bumenTableid']),
          (mergeEchart.customFormatterTooltip = ['员工姓名', '部门名称', '公司', 'bumenTableid']);
      }
      // 获取数据之后需要重置配色方案
      this.$store.commit(boardMutation.SET_STYLE, {
        style: {
          echart: mergeEchart,
        },
        replaceMerge: needChangeFormatterList ? ['customFormatterLabel', 'customFormatterTooltip'] : null,
        updateCom: this.shapeUnit.component,
      });
    },
    /**
     * @description 更新图表样式
     */
    updateChartStyle() {
      if (this.isEmpty || !this.chartInstane) return;
      // 解决：已拖入维度/度量的图表，退出编辑大屏，再次进入时先显示默认图表数据，之后再显示已拖入的图表数据
      if (this.isServerData() && !this.serverData) {
        return;
      }
      let newOptions;
      if (this.serverData) {
        newOptions = this.doWithOptions(this.serverData, this.options.data.dimensions, this.options.data.measures);
      } else {
        newOptions = this.doWithOptions(defaultData, this.defaultDimensions, this.defaultMeasures);
      }
      this.updateSaveChart(newOptions);
      this.doWithLabel(this.options.style.echart);
      this.doWithTooltip(this.options.style.echart);
    },
    /**
     * @description 添加点击事件(图表联动)
     */
    addClick() {
      // 设置点击数据进行联动
      this.chartInstane.on('click', this.handleDataClick);
      // 设置点击空白重置联动
      this.chartInstane.getZr().on('click', this.handleChartClick);
    },
    /**
     * @description 处理点击数据显示选中效果
     */
    handleDataClick(e) {
      const options = this.chartInstane.getOption();
      if (!this.options.style.echart.customIsOpenDataLink) {
        return;
      }
      // 重复点击选中项
      if (e.dataIndex === this.currentDataIndex && e.seriesIndex === this.currentSeriesIndex) {
        // 重置图表
        this.resetChartSelect(options);
        return;
      }
      // 记录当前选择数据的index
      this.currentDataIndex = e.dataIndex;
      this.currentSeriesIndex = e.seriesIndex;
      setLinkageData(e.name, this.shapeUnit.component);
    },
    /**
     * @description 处理图表点击事件(点击非数据区域重置)
     */
    handleChartClick(params) {
      let hasSelected = this.currentDataIndex || this.currentDataIndex === 0;
      // 没有选中数据不需要执行重置
      if (typeof params.target === 'undefined' && hasSelected) {
        // 重置图表
        const options = this.chartInstane.getOption();
        this.resetChartSelect(options);
      }
    },
    /**
     * @description 取消选中
     */
    resetChartSelect(options) {
      // 还原数据
      resetOriginData(this.shapeUnit.component);
      this.chartInstane.clear();
      this.chartInstane.setOption(options);
      this.currentDataIndex = this.currentSeriesIndex = '';
    },
  },
};
</script>
