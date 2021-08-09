/**
*@example
*const dragdrop = new DragDrop(dragdom);
*dragdrop.init({
  createPlaceholder,
  ondragstart,
  ondragmove,
  ondragend,
  ondrop
})
*/
export default class DragDrop {
  /**
   * Creates an instance of DragDrop.
   * @author evan
   * @param {*} drag 拖拽元素
   * @param {*} drop 放置元素
   * @param {*} placeholder 占位元素
   * @memberof DragDrop
   */
  constructor(drag = '', drop = '', placeholder = '') {
    this.drag = drag;
    this.drop = drop;
    this.placeholder = placeholder;
    this.options = {
      createPlaceholder: '',
      ondragstart: '',
      ondragmove: '',
      ondragend: '',
      ondrop: '',
    };
  }

  /**
   * 初始化
   * @param {object} options 配置项
   * @param {function} options.createPlaceholder 自定义创建占位元素
   * @param {function} options.ondragstart 拖拽开始
   * @param {function} options.ondragmove 拖拽移动
   * @param {function} options.ondragend 拖拽释放
   * @param {function} options.ondrop 拖入放置区
   * @memberof DragDrop
   */
  init(options) {
    this.options = Object.assign({}, this.options, options);
    this.drag.addEventListener(
      'mousedown',
      event => {
        const { createPlaceholder, ondragstart, ondragmove, ondragend, ondrop } = this.options;

        const dragRect = this.drag.getBoundingClientRect();
        // 鼠标距离左边框距离 = 鼠标点击位置 - 目标视图窗左边
        let shiftX = event.clientX - dragRect.left;
        let shiftY = event.clientY - dragRect.top;

        // 移动
        const moveAt = (target, pageX, pageY) => {
          target.style.left = pageX - shiftX + 'px';
          target.style.top = pageY - shiftY + 'px';
        };

        const onMouseMove = event => {
          if (!this.placeholder) {
            // 如果没有则创建
            this.placeholder = createPlaceholder(this, event);

            if (!this.placeholder) {
              // 确保创建成功
              return console.error(`the placeholder is null, you have create`);
            }

            document.body.appendChild(this.placeholder);

            // 拖拽刚开始
            if (ondragstart) {
              ondragstart(this, event);
            }
          }

          // 拖拽移动
          if (ondragmove) {
            ondragmove(this, event);
          }

          moveAt(this.placeholder, event.clientX, event.clientY);

          // 放开鼠标
          this.placeholder.onmouseup = () => {
            document.removeEventListener('mousemove', onMouseMove);
            this.placeholder.onmouseup = null;
            document.body.removeChild(this.placeholder);
            // 拖放结束
            if (ondragend) {
              ondragend(this, event);
            }
            if (this.drop) {
              if (ondrop) {
                ondrop(this, event);
              }
              this.drop = null;
            }

            this.placeholder = '';
          };

          this.placeholder.ondragstart = function () {
            return false;
          };
        };

        document.addEventListener('mousemove', onMouseMove);
        document.onmouseup = function () {
          document.removeEventListener('mousemove', onMouseMove);
          document.onmouseup = null;
        };
      },
      false,
    );
  }
  /**
   * @description 校验鼠标是否在放置区中
   * @param {*} mouseEvent 鼠标
   * @param {*} target 放置区
   * @memberof DragDrop
   */
  checkMouseInTarget(mouseEvent, target) {
    if (target) {
      const x = mouseEvent.clientX;
      const y = mouseEvent.clientY;
      const left = target.getBoundingClientRect().left;
      const right = target.getBoundingClientRect().right;
      const top = target.getBoundingClientRect().top;
      const bottom = target.getBoundingClientRect().bottom;
      return x >= left && x <= right && y >= top && y <= bottom;
    } else {
      return false;
    }
  }
}
