// 配置路径别名
var path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  // 配置基础链接地址，根据发布环境添加
  publicPath: process.env.NODE_ENV === 'production'
    ? ''
    : '/',
  outputDir: 'preview',
  // dev跨域问题
  devServer: {
    proxy: {
      [process.env.VUE_APP_BASE_API]: {
        target: process.env.VUE_APP_SERVICE_URL, // 测试服
        changeOrigin: true, // 是否跨域
        pathRewrite: {
            ['^' + process.env.VUE_APP_BASE_API]: ''
        }
      }

    }
  },
  pwa: {
    iconPaths: {
        favicon32: 'favicon.ico',
        favicon16: 'favicon.ico',
        appleTouchIcon: 'favicon.ico',
        maskIcon: 'favicon.ico',
        msTileImage: 'favicon.ico',
    }
  },
  productionSourceMap: false,
  lintOnSave: process.env.NODE_ENV !== 'production',
  configureWebpack: {
	  devtool: process.env.NODE_ENV === "production" ? 'false' : 'source-map',
	},
  assetsDir: 'static',
  filenameHashing: true, // 发布打包文件是否有哈希后缀
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src')) // key,value自行定义，比如.set('@@', resolve('src/components'))
  },
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
            'primary-color': '#617BFF',
            'link-color': '#1DA57A',
            'border-radius-base': '2px'
          },
          javascriptEnabled: true
        }
      }
    }
  }
}
