export const Utils = {
  isType(target, type) {
    let targetType = Object.prototype.toString
      .call(target)
      .slice(8, -1)
      .toLowerCase()
    return targetType === type.toLowerCase()
  },
  hasClass: function(target, className, isRef) {
    let classNames = isRef ? target : target.className || ''
    return (' ' + classNames + ' ').indexOf(' ' + className + ' ') === -1
  },
  addClass: function(target, className, isRef) {
    let classNames = isRef ? target : target.className || ''
    if (this.hasClass(target, className, isRef)) {
      target.className = classNames ? classNames + ' ' + className : className
    }
  },
  removeClass: function(target, className, isRef) {
    let classNames = isRef ? target : target.className || ''
    target.className = (' ' + classNames + ' ')
      .replace(' ' + className + ' ', ' ')
      .trim()
  }
}
