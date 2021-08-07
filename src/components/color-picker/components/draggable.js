export default class Draggable {
  constructor(drag) {
    this.drag = drag
    this.dragging = false
    this.options = {
      dragstart: '',
      dragmove: '',
      dragend: ''
    }
  }
  // 初始化
  init(options) {
    this.options = Object.assign({}, this.options, options)

    const { dragstart, dragmove, dragend } = this.options

    this.drag.addEventListener('mousedown', event => {
      event.preventDefault()
      event.stopPropagation()
      if (this.dragging) return
      this.dragging = true

      document.onselectstart = function() {
        return false
      }
      document.ondragstart = function() {
        return false
      }

      if (dragstart) {
        dragstart(event)
      }

      const onMouseMove = event => {
        if (!this.dragging) {
          this.dragging = true
        }
        if (dragmove) {
          dragmove(event)
        }
      }

      const onMouseUp = event => {
        document.removeEventListener('mousemove', onMouseMove, false)
        document.removeEventListener('mouseup', onMouseUp, false)
        document.onselectstart = null
        document.ondragstart = null
        if (this.dragging) {
          this.dragging = false
        }
        if (dragend) {
          dragend(event)
        }
      }

      document.addEventListener('mousemove', onMouseMove, false)
      document.addEventListener('mouseup', onMouseUp, false)
    })
  }
}
