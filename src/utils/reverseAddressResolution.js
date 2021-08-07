// 逆地址解析
import { message } from 'ant-design-vue'
export default function(position, citycode = '020', radius = 1000) {
  let promise = new Promise((resolve, reject) => {
    // position:[经度，纬度]
    if (!parseFloat(position[0]) || !parseFloat(position[1])) {
      return reject(new Error('根据经纬度查询地址失败'))
    }
    AMap.plugin('AMap.Geocoder', function() {
      const geocoder = new AMap.Geocoder({
        city: citycode, // 020:广州，默认：“全国”
        radius // 范围，默认：500
      })
      geocoder.getAddress(position, function(status, result) {
        if (status === 'complete' && result.regeocode) {
          return resolve(result.regeocode.addressComponent)
          // var address = result.regeocode.formattedAddress
        } else {
          //   message.error('根据经纬度查询地址失败')
          return reject(new Error('根据经纬度查询地址失败'))
        }
      })
    })
  })
  return promise
}
