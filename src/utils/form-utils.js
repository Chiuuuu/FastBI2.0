export function trimFormData(form) {
  const obj = {}
  for (const key in form) {
    if (typeof form[key] === 'string') {
      obj[key] = form[key].trim()
    } else {
      obj[key] = form[key]
    }
  }
  return obj
}
