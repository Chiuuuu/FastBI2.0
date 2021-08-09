<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import { mutationTypes as boardMutation } from '@/store/modules/board';
import defaultData from './default-data';
import minBy from 'lodash/minBy';
import maxBy from 'lodash/maxBy';
import merge from 'lodash/merge';
import Node from './node';
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
    };
  },
  methods: {
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
        });
      } else {
        const visualMap = {
          show: true,
          type: 'continuous',
          max: maxBy(pieces, 'value').value,
          min: minBy(pieces, 'value').value,
          dimension: dimension + 1,
        };
        return visualMap;
      }
    },
    doWithFormatter(echart) {
      const isAverage = echart.customShowWay === 'average';
      const ways = {
        name: '{b}',
        value: isAverage ? `{@[1]}` : `{@[0]}`,
        all: isAverage ? `{b}\n{@[1]}` : `{b}\n{@[0]}`,
      };
      const formatter = ways[echart.customFormatterWay] || ways.all;
      return formatter;
    },
    /**
     * @description 处理标签字体等
     * 1. 当在初始化的时候设置添加label.show为false
     * 2. 并且矩形树图需要重新设置一遍
     * 3. 如果不进行以上两项，会报错
     */
    doWithLabel(echart) {
      const label = Object.assign({}, echart.customLabel, {
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
    doWithOptions(fetchData, originDimensions, measures) {
      const pieces = [];
      this.treeRoot = new Node();
      const {
        style: { echart },
      } = this.options;

      const cache = [].concat(originDimensions);
      this.isRenderMeasure = echart.customPiecesIndex > originDimensions.length - 1;

      // 如果是按度量分配颜色就从维度的最后开始
      const dimensions = cache.slice(this.isRenderMeasure ? originDimensions.length - 1 : echart.customPiecesIndex);

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
          const dimensionIndex = originDimensions.length - echart.customPiecesIndex - 1;
          visualMap = this.doWithVisualMap(dimensionIndex, pieces);
        },
        average: () => {
          const dimensionIndex = originDimensions.length - echart.customPiecesIndex;
          const currentDimension = dimensions[echart.customPiecesIndex];
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
      const options = merge({}, echart, {
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
      });
      console.log(options);
      return options;
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      console.log('从这里获取服务端数据');
      this.treeRoot = '';
      this.serverData = {
        data: [
          {
            数量: 100,
            城市: '广州市',
            地区: '广东',
          },
          {
            数量: 88,
            城市: '青海',
            地区: '山东',
          },
          {
            数量: 78,
            城市: '徐州',
            地区: '安徽省',
          },
          {
            数量: 60,
            城市: '南宁',
            地区: '广西省',
          },
          {
            数量: 26,
            城市: '厦门',
            地区: '福建',
          },
          {
            数量: 11,
            城市: '呼噜木齐',
            地区: '新疆',
          },
          {
            数量: 36,
            城市: '衡阳',
            地区: '湖南',
          },
          {
            数量: 65,
            城市: '杭州市',
            地区: '江苏',
          },
        ],
      };

      const measures = [
        {
          name: '数量',
        },
      ];

      const dimensions = [
        {
          name: '地区',
        },
        {
          name: '城市',
        },
      ];
      const options = this.doWithOptions(this.serverData, dimensions, measures);
      this.updateSaveChart(options);
      // 获取数据之后需要重置配色方案
      this.$store.commit(boardMutation.SET_STYLE, {
        style: {
          echart: {
            customPiecesIndex: 0,
          },
        },
      });
    },
    /*
     * 处理默认数据
     */
    getDefaultData() {
      this.serverData = null;
      this.treeRoot = '';
      let options = this.doWithOptions(defaultData, this.defaultDimensions, this.defaultMeasures);
      this.updateSaveChart(options);

      this.doWithLabel(this.options.style.echart);

      // 获取数据之后需要重置配色方案
      this.$store.commit(boardMutation.SET_STYLE, {
        style: {
          echart: {
            customPiecesIndex: 0,
          },
        },
      });
    },
    /**
     * @description 更新图表样式
     */
    updateChartStyle() {
      if (!this.chartInstane) return;
      let newOptions;
      if (this.serverData) {
        newOptions = this.doWithOptions(this.serverData, this.options.data.dimensions, this.options.data.measures);
      } else {
        newOptions = this.doWithOptions(defaultData, this.defaultDimensions, this.defaultMeasures);
      }

      this.updateSaveChart(newOptions);
      this.doWithLabel(this.options.style.echart);
    },
  },
};
</script>
