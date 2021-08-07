class MapTable extends React.PureComponent {
  constructor(props) {
      super(props)

      this.state = {
          myChart: null,
          echart_id: 'map' + new Date().getTime(),
          level: 0,
          dataJson: {
              南沙区: nansha,
              从化区: conghua,
              增城区: zengcheng,
              天河区: tianhe,
              海珠区: haizhu,
              番禺区: panyu,
              白云区: baiyun,
              花都区: huadu,
              荔湾区: liwan,
              越秀区: yuexiu,
              黄埔区: huangpu
          },
          selectMap: '',
          showModal: false
      }
      this.LineRef = React.createRef()
      this.goPre = this.goPre.bind(this)
      this.open = this.open.bind(this)
      this.close = this.close.bind(this)
  }

  initGuangzhou(value) {
      const option = {
          tooltip: {
              trigger: 'item',
              type: 'cross',
              alwaysShowContent: false,
              bordeRadius: 4,
              borderWidth: 1,
              borderColor: 'rgba(6,138,239,1)',
              backgroundColor: 'rgba(6,138,239,0.8)',
              padding: 0,
              // position: "top",
              textStyle: {
                  fontSize: 12,
                  color: '#333'
              },
              extraCssText: 'z-index:100',
              formatter: function(params) {
                  if (params.data && params.data.data) {
                      var dom = `
                      <div style="padding:10px 15px;color:#fff;font-weight: bold;font-size: 16px;">
                          <div style="line-height: 28px">
                          ${params.data.data ? params.data.data.title : ''}
                          </div>
                          <ul style="padding:0;">`
                      for (let item of params.data.data.list) {
                          dom += `<li style="line-height: 25px;list-style-type:none;">
                          <span>${item.name}</span>
                          <span>：${item.value}</span></li>`
                      }
                      dom += `</ul></div>`
                  return dom
                  }
              }
          },
          series: [
              {
                  type: 'map',
                  mapType: 'guangzhou', // 自定义扩展图表类型
                  geoIndex: 1,
                  aspectScale: 1, // 长宽比
                  layoutCenter: ['10%', '50%'],
                  showLegendSymbol: true, // 存在legend时显示
                  label: {
                      normal: {
                          show: true,
                          textStyle: {
                              color: '#fff',
                              fontSize: 12
                          }
                      },
                      emphasis: {
                          show: true,
                          textStyle: {
                              color: '#fff',
                              fontWeight: 'bold'
                          }
                      }
                  },
                  roam: false,
                  zoom: 1.1,
                  itemStyle: {
                      normal: {
                          areaColor: 'rgba(38,195,241,0.2)',
                          borderColor: '#26C3F1',
                          borderWidth: 2
                          // shadowColor: "#4341c9",
                      },
                      emphasis: {
                          areaColor: '#26C3F1'
                      }
                  },
                  markPoint: {
                      symbol: 'pin',
                      symbolSize: 10,
                      itemStyle: {
                          normal: {
                              color: '#F4697A'
                          }

                      },
                      label: {
                          normal: {
                              show: false
                          }
                      },
                      data: [
                          /* 从化区 */
                          {
                              name: '24',
                              coord: [113.876037, 23.785344]
                          },
                          /* 花都区 */
                          {
                              name: '26',
                              coord: [113.425598, 23.309468]
                          },
                          /* 白云区 */
                          {
                              name: '1',
                              coord: [113.263966, 23.162091]
                          },
                          /* 黄埔区 */
                          {
                              name: '5',
                              coord: [113.505249, 23.074678]
                          },
                          /* 增城区 */
                          {
                              name: '10',
                              coord: [113.768920, 23.175713]
                          },
                          /* 荔湾区 */
                          {
                              name: '13',
                              coord: [113.216857, 23.117627]
                          },
                          // 越秀区
                           {
                              name: '16',
                              coord: [113.245697, 23.162457]
                          },
                          // 天河区
                          {
                              name: '2',
                              coord: [113.378906, 23.208533]
                          },
                          // 海珠区
                          {
                              name: '12',
                              coord: [113.392639, 23.084785]
                          },
                           // 番禺区
                          {
                              name: '27',
                              coord: [113.497009, 22.925512]
                          },
                           // 南沙区
                          {
                              name: '29',
                              coord: [113.442891, 22.802281]
                          }
                      ]
                  },
                  data: value
              }
          ]
      }
      return option
  }

  initArea(selectedPro, value) {
          const { dataJson } = this.state
          const dataValue = {
              南沙区: [
                  {
                          name: '29',
                          coord: [113.442891, 22.802281]
                      }
              ],
              从化区: [
                  {
                          name: '24',
                          coord: [113.562891, 23.402281]
                      }
              ],
              增城区: [
                  {
                          name: '10',
                          coord: [113.802891, 23.282281]
                      }
              ],
              天河区: [
                  {
                          name: '2',
                          coord: [113.365079, 23.138764]
                      }
              ],
              海珠区: [
                   {
                      name: '12',
                      coord: [113.282891, 23.082281]
                  }
              ],
              番禺区: [
                  {
                          name: '27',
                          coord: [113.332891, 23.002281]
                      }
              ],
              白云区: [
                  {
                          name: '1',
                          coord: [113.263966, 23.162091]
                      }
              ],
              花都区: [
                  {
                          name: '26',
                          coord: [113.352891, 23.472281]
                      }
              ],
              荔湾区: [
                  {
                          name: '13',
                          coord: [113.202891, 23.072281]
                      }
              ],
              越秀区: [
                  {
                          name: '16',
                          coord: [113.282891, 23.122281]
                      }
              ],
              黄埔区: [
                  {
                          name: '5',
                          coord: [113.562891, 23.182281]
                      }
              ]
          }
          let areaData = null
          for (let item of value) {
              if (item.name === selectedPro) {
                  dataValue[selectedPro][0].value = item.data
              }
              areaData = item.data.area
          }
          if (!dataJson[selectedPro]) {
               return
           }

           const option = {
              tooltip: {
                  trigger: 'item',
                  type: 'cross',
                  alwaysShowContent: false,
                  bordeRadius: 4,
                  borderWidth: 1,
                  borderColor: 'rgba(6,138,239,1)',
                  backgroundColor: 'rgba(6,138,239,0.8)',
                  padding: 0,
                  // position: "top",
                  textStyle: {
                      fontSize: 12,
                      color: '#333'
                  },
                  extraCssText: 'z-index:100',
                  formatter: function(params) {
                      if (params.data && params.data.areadata) {
                          var dom = `
                              <div style="padding:10px 15px;color:#fff;font-weight: bold;font-size:16px;">
                                  <div style="line-height: 28px">
                                  ${params.data.areadata.title}
                                  </div>
                                  <ul style="padding:0;">`
                              for (let item of params.data.areadata.list) {
                                  dom += `<li style="line-height: 25px;list-style-type:none;">
                                  <span>${item.name}</span>
                                  <span>：${item.value}</span></li>`
                              }
                              dom += `</ul></div>`
                          return dom
                      }
                  }
              },
              series: {
                  name: '选择器',
                   type: 'map',
                   mapType: selectedPro,
                   geoIndex: 1,
                   aspectScale: 1, // 长宽比
                   layoutCenter: ['10%', '50%'],
                   // left: '20%',
                   // top: '10%',
                   roam: false,
                   zoom: 1,
                   selectedMode: 'single',
                   label: {
                      normal: {
                          show: true,
                          textStyle: {
                              color: '#fff',
                              fontSize: 12
                          }
                      },
                      emphasis: {
                          show: true,
                          textStyle: {
                              color: '#fff',
                              fontWeight: 'bold'
                          }
                      }
                   },
                   itemStyle: {
                      normal: {
                          areaColor: 'rgba(38,195,241,0.2)',
                          borderColor: '#26C3F1',
                          borderWidth: 2
                          // shadowColor: "#4341c9",
                      },
                      emphasis: {
                          areaColor: '#26C3F1'
                      }
                   },
                  markPoint: {
                          symbol: 'pin',
                          symbolSize: 30,
                          itemStyle: {
                              normal: {
                                  color: '#F4697A'
                              }
                          },
                          label: {
                              normal: {
                                  show: false
                              }
                          },
                          data: dataValue[selectedPro]
                      },
                   data: areaData
              }
           }
          return option
  }

  // 初始化生命周期
  componentDidMount() {
      const {
          data,
          formData
      } = this.props
      const { dataJson } = this.state

      const value = data.records
      const area = formData.area

      const areaJson = {
              南沙区: 'nansha',
              从化区: 'conghua',
              增城区: 'zengcheng',
              天河区: 'tianhe',
              海珠区: 'haizhu',
              番禺区: 'panyu',
              白云区: 'baiyun',
              花都区: 'huadu',
              荔湾区: 'liwan',
              越秀区: 'yuexiu',
              黄埔区: 'huangpu'
          }

      var myChart = echarts.init(document.getElementById(this.state.echart_id))
      var option = {}
      if (area === '广州市') {
          echarts.registerMap('guangzhou', guangzhouJson)
          // 绘制图表
          option = this.initGuangzhou(value)
      } else {
          echarts.registerMap(area, dataJson[area])
          option = this.initArea(area, value)
      }

      this.setState({
          myChart
       })
      myChart.setOption(option)

      const that = this
      // if (area === '广州市') {
          myChart.on('click', function (params) {
              if (area === '广州市') {
                  if (formData[areaJson[params.name]] !== '') {
                      window.location.href = formData[areaJson[params.name]]
                  }
              } else {
                  that.setState(() => ({ showModal: true }))
              }

              // for (let item of value) {
              //     if (item.name === params.name) {
              //         that.setState({
              //             level: 1,
              //             selectMap: item.name
              //         })
              //
              //         that.props.onChange(item);
              //         var selectedPro = params.name;
              //
              //          echarts.registerMap(selectedPro, dataJson[selectedPro]);
              //
              //         option = that.initArea(selectedPro, value)
              //         myChart.setOption(option, true);
              //     }
              // }
           })
      // }
  }

  // 获取Echart图宽高
   getEchartWidth () {
      const offsetWidth = this.LineRef.current.offsetWidth
       if (offsetWidth && offsetWidth > 0) {
           this.LineRef.current.style.width = offsetWidth
       }
      const offsetHeight = this.LineRef.current.offsetHeight
       if (offsetHeight && offsetHeight > 0) {
           this.LineRef.current.style.height = offsetHeight
       }
       this.resized()
  }

  componentDidUpdate(prevProps) { // 点击菜单栏触发这个事假
      const {
          data,
          formData
      } = this.props
      const { dataJson, myChart } = this.state

      const value = data.records
      const area = formData.area
      const areaJson = {
              南沙区: 'nansha',
              从化区: 'conghua',
              增城区: 'zengcheng',
              天河区: 'tianhe',
              海珠区: 'haizhu',
              番禺区: 'panyu',
              白云区: 'baiyun',
              花都区: 'huadu',
              荔湾区: 'liwan',
              越秀区: 'yuexiu',
              黄埔区: 'huangpu'
          }

      if (myChart) {
          var option = {}
          if (area === '广州市') {
              echarts.registerMap('guangzhou', guangzhouJson)
              // 绘制图表
              option = this.initGuangzhou(value)
          } else {
              echarts.registerMap(area, dataJson[area])
              option = this.initArea(area, value)
          }
          myChart.setOption(option)

          const that = this
          // if (area === '广州市') {
              myChart.on('click', function (params) {
                  if (area === '广州市') {
                      if (formData[areaJson[params.name]] !== '') {
                          window.location.href = formData[areaJson[params.name]]
                      }
                  } else {
                      that.setState(() => ({ showModal: true }))
                  }

                  // for (let item of value) {
                  //     if (item.name === params.name) {
                  //         that.setState({
                  //             level: 1,
                  //             selectMap: item.name
                  //         })
                  //         that.props.onChange(item);
                  //         var selectedPro = params.name;
                  //
                  //          echarts.registerMap(selectedPro, dataJson[selectedPro]);
                  //
                  //         option = that.initArea(selectedPro, value)
                  //         myChart.setOption(option, true);
                  //     }
                  // }
               })
          // }
      }

      setTimeout(() => {
           this.getEchartWidth() // 延迟获取容器的宽高,缺点有移动效果
       }, 200)
   }

   resized() {
       const { myChart } = this.state
       myChart.resize()
   }

   goPre() {
       const { data } = this.props
       const value = data.records
       if (this.state.level > 0) {
           this.setState({
               level: 0
           })
           var option = this.initGuangzhou(value)
           const { myChart } = this.state
           myChart.setOption(option)
       }
   }

   close() {
      this.setState(() => ({ showModal: false }))
    }

    open(e) {
      e.preventDefault()
      this.setState(() => ({ showModal: true }))
    }

  renderModal() {
      return (
        <Modal
          animation={true}
          show={this.state.showModal}
          onHide={this.close}
          className='map_modal'
        >
          <Modal.Header closeButton>
              <Modal.Title>网格详细信息列表</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className='map_table'>
                <table>
                    <tr>
                      <th>指标名称</th>
                        <th>网格1</th>
                        <th>网格2</th>
                    </tr>
                    <tr>
                        <td>111</td>
                        <td>2222</td>
                        <td>3333</td>
                    </tr>
                </table>
            </div>
          </Modal.Body>
        </Modal>
      )
  }

  render() {
      const {
          height
      } = this.props

      const { level } = this.state

      return (
          <div>
              <div className='map_wrap'>
              {
                  level === 1 &&
                  <div className='backbtn' onClick={this.goPre}>
                       <img src={require('./images/icon_last_blue.png')} />
                      返回
                  </div>
              }
              <div id={this.state.echart_id} style={{ height }}></div>
              <div ref={this.LineRef} style={{ height }}></div>
              {/* <div className='map_data'> */}
                  {/* <div className='table_title'>黄埔区分公司</div> */}
                  {/* <ul className='table_list'> */}
                      {/* <li><span>总体收入</span><span className='num'>300万</span></li> */}
                      {/* <li><span>电视ARPU值</span><span className='num'>34</span></li> */}
                      {/* <li><span>宽带ARPU值</span><span className='num'>40</span></li> */}
                  {/* </ul> */}
              {/* </div> */}
          </div>
              {this.renderModal()}
          </div>
      )
  }
}
