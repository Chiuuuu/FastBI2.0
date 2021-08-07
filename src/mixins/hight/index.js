import { setBaseProperty } from '@/api/canvasMaps/canvas-maps-request'
import { mapGetters, mapActions } from 'vuex'

export default {
  data() {
    return {
      fontFamilyList: [
        {
          label: '默认',
          value: 'not specified'
        },
        {
          label: 'simfang',
          value: 'simfang'
        },
        {
          label: '仿宋_GB2312',
          value: 'fangsong'
        },
        {
          label: 'times',
          value: 'times'
        },
        {
          label: '微软雅黑',
          value: 'msyh'
        },
        {
          label: 'simkai',
          value: 'simkai'
        },
        {
          label: '庞门正道标题体',
          value: 'pangmenzhengdao'
        },
        {
          label: 'HuXiaoBoNanShenTi-2',
          value: 'HuXiaoBoNanShenTi-2'
        },
        {
          label: '优设标题黑',
          value: 'youshe'
        },
        {
          label: 'digital-7-4',
          value: 'digital-7-4'
        }
      ],
      radioStyle: {
        display: 'flex',
        alignItems: 'center'
      }, // 单选radio样式
      formatList: [
        {
          label: '维度',
          value: '{point.name}'
        },
        {
          label: '度量',
          value: '{y}'
        },
        {
          label: '占比',
          value: '({point.percentage:.1f}%)'
        }
      ],
      themes: [
        {
          title: '默认',
          colors: [
            '#058DC7',
            '#50B432',
            '#ED561B',
            '#DDDF00',
            '#24CBE5',
            '#64E572',
            '#FF9655',
            '#FFF263',
            '#6AF9C4'
          ]
        },
        {
          title: 'westerns',
          colors: [
            '#516b91',
            '#59c4e6',
            '#edafda',
            '#93b7e3',
            '#a5e7f0',
            '#cbb0e3',
            ' #c05050',
            '#7eb00a',
            '#588dd5'
          ]
        },
        {
          title: 'wonderland',
          colors: [
            '#4ea397',
            '#22c3aa',
            '#7bd9a5',
            '#d0648a',
            '#f58db2',
            '#f2b3c9',
            '#5ab1ef',
            '#9a7fd1',
            '#c14089'
          ]
        },
        {
          title: 'walden',
          colors: [
            '#3fb1e3',
            '#6be6c1',
            '#626c91',
            '#a0a7e6',
            '#c4ebad',
            '#96dee8',
            '#dc69aa',
            '#07a2a4',
            '#a5e7f0'
          ]
        },
        {
          title: 'chalk',
          colors: [
            '#fc97af',
            '#87f7cf',
            '#f7f494',
            '#72ccff',
            '#f7c5a0',
            '#d4a4eb',
            '#d2f5a6',
            '#76f2f2',
            '#c9ab00'
          ]
        },
        {
          title: 'macarons',
          colors: [
            '#2ec7c9',
            '#b6a2de',
            '#ffb980',
            '#d87a80',
            '#8d98b3',
            '#e5cf0d',
            '#97b552',
            '#95706d',
            '#f5994e'
          ]
        },
        {
          title: 'purple-passion',
          colors: [
            '#9b8bba',
            '#e098c7',
            '#8fd3e8',
            '#71669e',
            '#cc70af',
            '#7cb4cc',
            '#59678c',
            '#6f5553',
            '#c14089'
          ]
        }
      ]
      // chooseTheme:"#058DC7,#50B432,#ED561B,#DDDF00,#24CBE5,#64E572,#FF9655,#FFF263,#6AF9C4"
      // chooseTheme:'默认'
    }
  },
  computed: {
    ...mapGetters(['currentSelected', 'currSelected']),
    // 维度度量合并列表
    concatDimAndMea() {
      const {
        dimensions = [],
        measures = []
      } = this.currSelected.setting.api_data
      return dimensions.concat(measures)
    }
  },
  methods: {
    ...mapActions(['updateChartData', 'refreshScreen']),
    // 设置自有属性
    setSelfProperty() {
      this.$store.dispatch('SetSelfProperty', this.HighConfig.setting.config)
      // 发送请求来保存数据
      setBaseProperty(this.currentSelected)
      this.updateChartData()
    },
    // 图例点击
    onRadioChange(source, key, value) {
      if (source === 'indicator') {
        this.$set(
          this.HighConfig.setting.config.plotOptions.pie.dataLabels,
          key,
          value
        )
      } else {
        this.$set(this.HighConfig.setting.config[source], key, value)
      }
      this.setSelfProperty()
    },
    // 点击显示/隐藏
    switchChange(checked, event) {
      // 阻止默认事件，取消收起
      event.stopPropagation()
      this.setSelfProperty()
    },
    // 图表 点击选择背景
    onBgChange(key, val) {
      this.$set(this.HighConfig.setting.background, key, val)
      this.setBackGround()
    },
    // 点击上传图形背景图
    addbgPhoto() {
      document.getElementById('bgPhoto').click()
    },
    setBackGround(val) {
      // if (val) {
      //   if(this.HighConfig.setting.background.hasOwnProperty('backgroundImage')){
      //     delete this.HighConfig.setting.background.backgroundImage;
      //   }
      // }
      this.$store.dispatch('SetBackGround', this.HighConfig.setting.background)
      setBaseProperty(this.currentSelected)
      this.updateChartData()
      // this.$store.dispatch('SetBackGround', this.backgroundApi)
      // 发送请求来保存数据
    },
    // 选择上传图片
    selectPhoto(e, key) {
      if (!e.target.files[0]) {
        return
      }
      const isLt2M = e.target.files[0].size / 1024 / 1024 < 5
      if (!isLt2M) {
        this.$message.error('图片大小不能超过5M!')
        return
      }
      var form = new FormData()
      form.append('avatarfile', e.target.files[0])
      this.$server.screenManage
        .actionUploadImage(form)
        .then(res => {
          if (res.code === 200) {
            let imageUrl = process.env.VUE_APP_SERVICE_URL + res.imgUrl
            if (key === 'backgroundImage') {
              // this.HighConfig.setting.background.backgroundColor='';
              this.HighConfig.setting.background['backgroundImage'] = imageUrl
              this.setBackGround()
            }
            // if (key === 'selfConfig') {
            //   data['imageUrl'] = imageUrl
            //   this.setSelfProperty()
            // }
            // if (key === 'backgroundApi') {
            //   data['backgroundSrc'] = imageUrl
            //   this.setBackGround()
            // }
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    getThemeColor(title) {
      let theme = this.themes.find(item => item.title === title)
      this.$set(this.HighConfig.setting.config, 'themeName', theme.title)
      this.$set(this.HighConfig.setting.config, 'colors', theme.colors)
      this.setSelfProperty()
    }
  }
}
