import { mutationTypes as boardMutaion } from '@/store/modules/board';
import cloneDeep from 'lodash/cloneDeep';
import html2canvas from 'html2canvas';
import JSPDF from 'jspdf';
import { mapGetters } from 'vuex';
// import { Loading } from 'element-ui';
/**
 * @description 下载图片
 */
function download(content, name, type) {
  let a = document.createElement('a');
  a.style.display = 'none';
  if (type === 'img') {
    let blob = dataURLToBlob(content.toDataURL('image/png'));
    a.setAttribute('href', URL.createObjectURL(blob));
  } else {
    a.setAttribute('href', encodeURI(content));
  }
  // 这块是保存图片操作  可以设置保存的图片的信息
  a.setAttribute('download', name);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
/**
 * @description 图片格式转换方法
 */
function dataURLToBlob(dataurl) {
  let arr = dataurl.split(',');
  let mime = arr[0].match(/:(.*?);/)[1];
  let bstr = atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
/**
 * @description 导出成pdf
 */

function exportPdf(canvas, name) {
  // 开始将图片转换为PDF
  var pdf = new JSPDF('p', 'mm', 'a4'); // A4纸，纵向
  var ctx = canvas.getContext('2d');
  console.log(canvas.height);
  var a4w = 170;
  var a4h = 257; // A4大小，210mm x 297mm，四边各保留20mm的边距，显示区域170x257
  var imgHeight = Math.floor((a4h * canvas.width) / a4w); // 按A4显示比例换算一页图像的像素高度
  var renderedHeight = 0;

  while (renderedHeight < canvas.height) {
    var page = document.createElement('canvas');
    page.width = canvas.width;
    page.height = Math.min(imgHeight, canvas.height - renderedHeight); // 可能内容不足一页

    // 用getImageData剪裁指定区域，并画到前面创建的canvas对象中
    page
      .getContext('2d')
      .putImageData(
        ctx.getImageData(0, renderedHeight, canvas.width, Math.min(imgHeight, canvas.height - renderedHeight)),
        0,
        0,
      );
    pdf.addImage(
      page.toDataURL('image/jpeg', 1.0),
      'JPEG',
      10,
      10,
      a4w,
      Math.min(a4h, (a4w * page.height) / page.width),
    ); // 添加图像到页面，保留10mm边距

    renderedHeight += imgHeight;
    if (renderedHeight < canvas.height) {
      pdf.addPage();
    } // 如果后面还有内容，添加空白页
  }
  pdf.save(`${name}.pdf`);
}
const ContenxtmenuMethodMixin = {
  computed: {
    ...mapGetters(['fileName', 'pageList']),
  },
  methods: {
    /**
     * @description 右键菜单——复制图表
     */
    async handleCopyComponent(e, item, component) {
      // 新增图表
      const result = await this.$server.screenManage.addToGetChartId();
      if (result && result.code === 200) {
        let copyChart = cloneDeep(component); // 深拷贝一个对象并修改默认信息，
        // 修改复制出来的位置信息
        copyChart.setting.style.position.left += 20;
        copyChart.setting.style.position.top += 20;
        // 修改id
        copyChart.id = result.data.id;
        this.$store.commit(boardMutaion.ADD_COM, {
          component: copyChart,
        });
      } else {
        this.$message(result.msg || '添加图表失败');
      }
    },
    /**
     * @description 右键菜单——删除图表
     */
    handleDeleComponent(e, item, component, index) {
      this.$store.commit(boardMutaion.DELE_COM, {
        component,
        index,
      });
    },
    /**
     * @description 设置图表层级
     * @param {string} pos 执行方法
     */
    handleSetZIndex(pos, e, item, component, index) {
      this.$store.commit(boardMutaion.SET_POSITION, {
        method: pos,
        index,
      });
    },
    /**
     * @description 导出图片
     */
    handleExportImg(e, item, component, index, vm) {
      const clone = vm.$el.cloneNode(true);
      clone.removeChild(clone.childNodes[0]);
      clone.removeChild(clone.childNodes[0]);
      clone.style.position = 'relative';
      const canvas = vm.$el.querySelector('canvas');
      if (canvas) {
        const cloneCanvas = clone.querySelector('canvas');
        const newCtx = cloneCanvas.getContext('2d');
        newCtx.drawImage(canvas, 0, 0);
      }
      const dom = document.querySelector('.drawing-board-wrapper') || document.querySelector('.drawing-board-preview');
      dom.append(clone);
      html2canvas(clone, {
        width: clone.clientWidth,
        height: clone.clientHeight,
        scale: 1,
        dpi: 300,
        letterRendering: true,
        scrollY: 0,
        scrollX: 0,
        useCORS: true, // 【重要】开启跨域配置
        allowTaint: true,
      }).then(canvas => {
        clone.remove();
        download(canvas, component.setting.style.title.text + '.png', 'img');
      });
    },
    /**
     * @description 导出大屏
     */
    handleExportScreen(e, item, vm) {
      const screen = vm.$refs['js-board-grid'];
      const cloneScreen = screen.cloneNode(true);
      cloneScreen.style.position = 'relative';
      const canvasList = screen.querySelectorAll('canvas');
      const cloneCanvasList = cloneScreen.querySelectorAll('canvas');
      for (let i = 0; i < canvasList.length; i++) {
        const newCtx = cloneCanvasList[i].getContext('2d');
        newCtx.drawImage(canvasList[i], 0, 0);
      }
      const dom = document.querySelector('.drawing-board-wrapper') || document.querySelector('.drawing-board-preview');
      dom.append(cloneScreen);
      html2canvas(cloneScreen, {
        width: cloneScreen.clientWidth,
        height: cloneScreen.clientHeight,
        scale: 1,
        dpi: 300,
        letterRendering: true,
        scrollY: 0,
        scrollX: 0,
        useCORS: true, // 【重要】开启跨域配置
        allowTaint: true,
      }).then(canvas => {
        cloneScreen.remove();
        exportPdf(canvas, vm.screenName);
      });
    },
    /**
     * @description 右键菜单——查看图表数据
     */
    async handleChartDataComponent(e, item, component) {
      console.log(e, item, component);
      // 判断当前图表数据为服务数据
      if (this.$children[0].isServerData()) {
        let dom = document.querySelector('.board-canvas');
        this.$message.config({
          getContainer: () => dom,
        });
        this.$message.error('该图表没有拖入图表数据');
        return;
      }

      // let dataList = await this.getChartData(component);
      // 查看数据弹出展示窗
      // if (type === 'view') {
      //   this.showChartData(this.chartData);
      //   return
      // }
      // return dataList
    },
    // 查看/导出数据 -- 构造数据
    // async getChartData(component) {
    //   console.log(this);
    //   let tabName = '';
    //   this.pageList.forEach(item => {
    //     if (component.tabId === item.id) {
    //       tabName = item.name;
    //     }
    //   })
    //   let params = {
    //     id: component.id,
    //     type: component.type,
    //     screenName: this.fileName,
    //     tabName: tabName,
    //     graphName: component.graphName,
    //   };
    //   let loadingInstance = Loading.service({
    //     lock: true,
    //     text: '加载中...',
    //     target: 'body',
    //     background: 'rgb(255, 255, 255, 0.6)'
    //   });
    //   let res = await this.$server.screenManage.getGraphInfo(params);
    //   loadingInstance.close();
    //   if (res.code !== 200) {
    //     this.$message.error(res.msg || '请重新操作')
    //     return;
    //   }

    //   let source = res.data || [];

    //   let columns = [];
    //   let rows = [];
    //   let tableName = [];
    //   let exportList = [];

    //   if (this.currSelected.setting.chartType === 'v-map') {
    //     await Promise.all(
    //       Object.keys(source).map(async item => {
    //         if (source[item]) {
    //           let aliasKeys = this.handleTableColumns(
    //             Object.keys(source[item][0]),
    //             item
    //           )
    //           columns.push(aliasKeys)
    //           let type = '填充'
    //           let row = []
    //           if (item === 'fillList') {
    //             row = await handleReturnChartData(
    //               source[item],
    //               this.currSelected.setting,
    //               false,
    //               aliasKeys.filter(item => item.role === 2)
    //             )
    //             type = '填充'
    //           } else if (item === 'labelList') {
    //             row = await handleReturnChartData(
    //               source[item],
    //               this.currSelected.setting,
    //               true,
    //               aliasKeys.filter(item => item.role === 2)
    //             )
    //           }
    //           rows.push(row)
    //           tableName.push(type)
    //           let aliasObj = {}
    //           aliasKeys.forEach((alias, index) => {
    //             aliasObj['name' + index] = alias['colName']
    //           })
    //           let cunstomRow = source[item].map(row => {
    //             let obj = {}
    //             aliasKeys.forEach((alias, index) => {
    //               obj['name' + index] = row[alias['colName']]
    //             })
    //             return obj
    //           })
    //           let titleRow = { name0: type, name1: '', name2: '' }
    //           cunstomRow = [titleRow, aliasObj].concat(cunstomRow)
    //           exportList = cunstomRow.concat(exportList)
    //         }
    //       })
    //     )
    //   } else {
    //     // 处理空数据
    //     columns = [this.handleTableColumns(Object.keys(source[0]))]
    //     source = await handleReturnChartData(
    //       source,
    //       this.currSelected.setting,
    //       false,
    //       columns[0].filter(item => item.role === 2)
    //     )
    //     rows = [source]
    //     exportList = source
    //   }
    //   this.chartData = {
    //     columns,
    //     rows,
    //     tableName,
    //   };
    //   return exportList;
    // },
    // 处理表头, 按拖入的维度度量顺序排列
    // handleTableColumns(keys, label) {
    //   const apiData = this.currSelected.setting.api_data
    //   let fieldList = []
    //   if (label && label == 'labelList') {
    //     // 地图 -- 标记点数据
    //     fieldList = []
    //       .concat(apiData.labelDimensions)
    //       .concat(apiData.labelMeasures)
    //   } else {
    //     fieldList = [].concat(apiData.dimensions).concat(apiData.measures)
    //   }
    //   const column = []
    //   fieldList.map(item => {
    //     if (keys.includes(item.alias)) {
    //       column.push({
    //         alias: item.alias,
    //         colName: this.formatAggregator(item),
    //         role: item.role
    //       })
    //     }
    //   })
    //   return column
    // },
  },
};

export default ContenxtmenuMethodMixin;
