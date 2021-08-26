import { mutationTypes as boardMutaion } from '@/store/modules/board';
import cloneDeep from 'lodash/cloneDeep';
import html2canvas from 'html2canvas';
import JSPDF from 'jspdf';
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
  },
};

export default ContenxtmenuMethodMixin;
