export function addClass(target, name) {
  const n = target.className || ''
  ;(' ' + n + ' ').indexOf(' ' + name + ' ') === -1 &&
    (target.className = n ? n + ' ' + name : name)
}

export function removeClass(target, name) {
  const n = target.className || ''
  target.className = (' ' + n + ' ').replace(' ' + name + ' ', ' ').trim()
}
