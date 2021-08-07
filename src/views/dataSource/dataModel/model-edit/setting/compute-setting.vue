<template>
  <a-modal
    class="modModal"
    :visible="isShow"
    :title="'新建计算字段（' + computeType + '）'"
    width="1000px"
    :confirmLoading="confirmLoading"
    destroyOnClose
    :afterClose="handleAfterClose"
    @ok="handleSave"
    @cancel="handleClose"
  >
    <div class="mod">
      <div class="modal_l">
        <div class="set">
          <a-form-model
            ref="form"
            :model="form"
            :rules="rules"
            :label-col="{ span: 3 }"
            :wrapper-col="{ span: 20 }"
          >
            <a-form-model-item label="名称" prop="name">
              <a-input v-model="form.name" />
            </a-form-model-item>
            <a-form-model-item label="表达式">
              <div class="modal_dropdown">
                <a-dropdown v-model="dimensionsVisible" :trigger="['click']">
                  <div class="dropdown">插入维度</div>
                  <div slot="overlay" class="dropOverlay">
                    <a-input allowClear placeholder="请输入关键词" @change="handleSearch($event, 'dimensions')"></a-input>
                    <a-menu>
                      <a-menu-item
                        v-for="item in (searchDimensions || dimensions)"
                        :key="item.id"
                        @click="handleSelect(item, 'dimensions')"
                        >
                        {{ item.alias }}
                      </a-menu-item>
                    </a-menu>
                  </div>
                </a-dropdown>
                <a-dropdown v-model="measuresVisible" :trigger="['click']">
                  <div class="dropdown">插入度量</div>
                  <div slot="overlay" class="dropOverlay">
                    <a-input allowClear placeholder="请输入关键词" @change="handleSearch($event, 'measures')"></a-input>
                    <a-menu>
                      <a-menu-item
                        v-for="item in (searchMeasures || measures)"
                        :key="item.id"
                        @click="handleSelect(item, 'measures')"
                        >
                        {{ item.alias }}
                      </a-menu-item>
                    </a-menu>
                  </div>
                </a-dropdown>
              </div>
            </a-form-model-item>
          </a-form-model>
        </div>
        <div class="u-txtwrap u-code-input">
          <span class="u-errtip" :title="errorMessage">{{ errorMessage }}</span>
          <div class="u-txt u-txt-area expshow" ref="js-expshow"></div>
          <div class="dropp">
            <textarea
              id="demo"
              class="u-txt u-txt-area expinput u-code-input"
              row="5"
              spellcheck="false"
              ref="js-textarea"
              v-model="textareaValue"
              @scroll="handleScroll"
            ></textarea>
          </div>
        </div>
      </div>
      <div class="modal_r">
        <div class="bar">
          <a-input
            allowClear
            style="width: 140px"
            placeholder="请输入关键词"
            @change="handleSearch($event, 'expression')"
          ></a-input>
          <ul class="list">
            <li
              v-for="(express, index) in (searchExpression || expression)"
              class="list-item"
              :class="activeIndex === index ? 'active':''"
              :key="express.id"
              @dblclick="handleSelectExpression(express)"
              @click="getActiveIndex(express.id)"
            >{{ express.name }}</li>
          </ul>
        </div>
        <div class="text">
          <div class="tit">{{expression[activeIndex].expression}}</div>
          <div class="des">{{expression[activeIndex].description}}</div>
          <div class="example">
            <span class="title">示例: </span>
            <span v-html="explain"/>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script>
import { TokenStream } from './parse/TokenStream'
import { Parse } from './parse/Parse'
import { Verify } from './parse/Verify'
import findIndex from 'lodash/findIndex'
import debounce from 'lodash/debounce'
const expression = [
  {
    id: 'SUM',
    name: '求和聚合',
    expression: 'SUM(表达式)',
    description: '返回表达式中所有值的总和。SUM 只能用于数字字段。',
    example: 'SUM([销售额])',
    syntax: 'SUM(表达式)',
    groups: ['aggregator']
  },
  {
    id: 'MAX',
    name: '最大值聚合',
    expression: 'MAX(表达式)',
    description:
      '返回表达式在所有记录中的最大值。MAX只能用于数字、日期、日期时间字段。',
    example: 'MAX([访问量])',
    syntax: 'MAX(表达式)',
    groups: ['aggregator', 'date', 'logic']
  },
  {
    id: 'MIN',
    name: '最小值聚合',
    expression: 'MIN(表达式)',
    description:
      '返回表达式在所有记录中的最小值。MIN只能用于数字、日期、日期时间字段。',
    example: 'MIN([访问量])',
    syntax: 'MIN(表达式)',
    groups: ['aggregator', 'date', 'logic']
  },
  {
    id: 'COUNT',
    name: '计数聚合',
    expression: 'COUNT(表达式)',
    description:
      '返回表达式在所有记录中的计数值。',
    example: 'COUNT([访问量])',
    syntax: 'COUNT(表达式)',
    groups: ['aggregator', 'date', 'logic']
  },
  {
    id: 'COUNTD',
    name: '去重计数聚合',
    expression: 'COUNTD(表达式)',
    description:
      '返回表达式在所有记录中的去重计数值。',
    example: 'COUNTD([访问量])',
    syntax: 'COUNTD(表达式)',
    groups: ['aggregator', 'date', 'logic']
  },
  {
    id: '+',
    name: '加法',
    expression: '表达式1 + 表达式2\\\\数值',
    description:
      '当表达式1和表达式2的类型均为数值时，做算术加法；当它们的类型为字符串时，做字符串连接；当表达式1为日期\\\\日期时间时，做日期天数的加法。',
    example:
      '用法1，数值相加：[固定成本] + [非固定成本]；\n用法2，字符串连接：[省份] + "/" + [城市] ；\n用法3，日期\\\\日期时间增加天数：[订单日期]+10。',
    syntax: '表达式1 + 表达式2',
    groups: ['string', 'calculation']
  },
  {
    id: '-',
    name: '减法',
    expression: '表达式1 - 表达式2\\\\数值',
    description:
      '当表达式1和表达式2的类型均为数值时，做算术减法；当表达式1为日期\\\\日期时间时，做日期天数的减法。',
    example:
      '用法1，数值相减：[销售额] - [成本]；\n用法2，日期相减：[发货日期]-[订单日期]，得到日期天数；\n用法3，日期\\\\日期时间减少天数：[订单日期]-10。',
    syntax: '表达式1 - 表达式2',
    groups: ['string', 'calculation']
  },
  {
    id: '*',
    name: '乘法',
    expression: '表达式1 * 表达式2',
    description: '* 作为乘法运算符，只能用于数字字段。',
    example: '[单价] * [个数]',
    syntax: '表达式1 * 表达式2',
    groups: ['calculation']
  },
  {
    id: '/',
    name: '除法',
    expression: '表达式1 / 表达式2',
    description: '/ 作为除法运算符，只能用于数字字段。',
    example: '[总人口] / [城市数量]',
    syntax: '表达式1 / 表达式2',
    groups: ['calculation']
  },
  {
    id: 'ABS',
    name: '绝对值',
    expression: 'ABS(表达式)',
    description: '返回表达式在所有记录中的计数值。ABS只能用于数字字段。',
    example: 'ABS([总人口])',
    syntax: 'ABS(表达式)',
    groups: ['calculation']
  },
  {
    id: 'ROUND',
    name: '四舍五入',
    expression: 'ROUND(表达式, [位数])',
    description: '返回表达式在所有记录中的四舍五入后的值。ROUND只能用于数字字段。',
    example: 'ROUND([总人口], [位数])',
    syntax: 'ROUND(表达式, 1)',
    groups: ['calculation']
  }
]

export default {
  name: 'computeSetting',
  props: {
    isShow: Boolean,
    computeType: String,
    renameData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      cacheValidata: true, // 临时添加一个去校验判断
      expression,
      searchExpression: '',
      activeIndex: 0,
      textareaValue: '',
      errorMessage: '',
      form: {
        name: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入名称' },
          {
            type: 'string',
            min: 1,
            max: 20,
            message: '请输入1-20字符的名称'
          },
          { validator: this.validateName, trigger: ['change', 'blur'] }
        ]
      },
      confirmLoading: false,
      dimensionsVisible: false,
      measuresVisible: false,
      dimensions: '',
      searchDimensions: '',
      measures: '',
      searchMeasures: ''
    }
  },
  mounted () {
    this.debounceFn = debounce(this.check, 500)
  },
  computed: {
    isEdit() {
      return 'id' in this.renameData
    },
    explain() {
      return this.expression[this.activeIndex].example.replace(/\n/gm, '<br/>')
    },
    sourceDimensions() {
      return [...this.$parent.detailInfo.pivotSchema.dimensions, ...this.$parent.cacheDimensions]
    },
    sourceMeasures() {
      return [...this.$parent.detailInfo.pivotSchema.measures, ...this.$parent.cacheMeasures]
    }
  },
  watch: {
    isShow: {
      immediate: true,
      handler(value) {
        if (value) {
          this.errorMessage = ''
          this.dimensions = this.getDM(this.sourceDimensions)
          this.measures = this.getDM(this.sourceMeasures)
          this.textareaValue = this.renameData.raw_expr
          this.form = Object.assign(this.form, {
            name: this.renameData.alias
          })
        } else {
          this.dimensions = ''
          this.measures = ''
          this.textareaValue = ''
          this.form = this.$options.data().form
        }
      }
    },
    textareaValue(val) {
      if (val === '' && this.isShow) {
        this.errorMessage = '表达式不能为空'
      }
      this.$nextTick(() => {
        this.$refs['js-expshow'].innerHTML = ''
        this.getExpshow(val)
      })
    }
  },
  methods: {
    validateName(rule, value, callback) {
      const arry = [...this.sourceDimensions, ...this.sourceMeasures]
      const item = arry.filter(item => item.alias === value).pop()
      if (item && !this.isEdit) {
        callback(new Error('名称已存在'))
      } else {
        callback()
      }
    },
    /**
     * 获取维度度量
    */
    getDM(list) {
      if (list && list.length) {
        return list.filter(item => {
          return item.visible && item.produceType === 0
        })
      }
      return list
    },
    handleSelect(item, type) {
      if (item) {
        this[`${type}Visible`] = false
        this.$nextTick(() => {
          this.insertText(this.$refs['js-textarea'], `[${item.alias}]`)
        })
      } else {
        this.$message.error('获取失败')
      }
    },
    preventDefault(e) {
      e.preventDefault()
      return false
    },
    /**
     * 获取activeIndex
    */
    getActiveIndex(value) {
      this.activeIndex = findIndex(this.expression, {
        id: value
      })
    },
    /**
     * 搜索框
    */
    change(value) {
      this.getActiveIndex(value)
      this.handleSelectExpression(this.expression[this.activeIndex])
    },
    /**
     * 维度度量关键词搜索
     */
    handleSearch: debounce(function(event, type) {
      const value = event.target.value
      if (type === 'dimensions') {
        this.searchDimensions = value ? this.filterSearch(this.dimensions, value, 'alias') : ''
      } else if (type === 'measures') {
        this.searchMeasures = value ? this.filterSearch(this.measures, value, 'alias') : ''
      } else if (type === 'expression') {
        this.searchExpression = value ? this.filterSearch(this.expression, value, 'name') : ''
      }
    }, 500),
    /**
     * 过滤返回关键词搜索
     */
    filterSearch(list, value, key) {
      if (list && list.length) {
        return list.filter(item => item[key].toLowerCase().indexOf(value.toLowerCase()) >= 0)
      }
      return list
    },
    filterOption(value, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(value.toLowerCase()) >= 0
    },
    // 暂时使用的方法，把原生表达式的[]替换掉
    reverse(str) {
      const pairList = [...this.sourceDimensions, ...this.sourceMeasures]
      const matchArry = str.match(/(\[)(.*?)(\])/g)
      if (matchArry) {
        matchArry.forEach(value => {
          const matchStr = value.match(/(\[)(.+)(\])/)
          const key = matchStr[2] ? matchStr[2] : ''
          const item = pairList.filter(item => {
            return item.alias === key
          }).pop()
          if (key && item) {
            // 要用三个$才能变成2个$
            str = str.replace(value, '$$$' + item.id)
          }
        })
      }
      return str
    },
    handleSave() {
      this.$refs.form.validate(async (ok) => {
        if (ok) {
          if (!this.textareaValue) {
            this.errorMessage = '表达式不能为空'
            return false
          } else if (this.errorMessage) {
            return false
          } else {
            this.errorMessage = ''
            const params = {
              name: this.form.name,
              datamodelId: this.$parent.model === 'add' ? this.$parent.addModelId : this.$parent.modelId,
              role: this.computeType === '维度' ? 1 : 2,
              raw_expr: this.textareaValue,
              expr: this.reverse(this.textareaValue)
            }
            if (this.isEdit) {
              const updateData = Object.assign({}, this.renameData, params, {
                alias: params.name
              })
              this.$emit('success', updateData)
            } else {
              this.confirmLoading = true
              const result = await this.$server.dataModel.addCustomizModelPivotschema(params).finally(() => {
                this.confirmLoading = false
              })

              if (result.code === 200) {
                this.$emit('success', result.data)
              } else {
                this.$message.error(result.msg || '请求错误')
              }
            }
          }
        } else {
          return false
        }
      })
    },
    handleClose() {
      this.$emit('close')
    },
    handleAfterClose() {
      this.textareaValue = ''
      this.form = this.$options.data().form
    },
    /**
     * 编辑器展示
    */
    getExpshow(val) {
      const tokenStream = new TokenStream(val)
      const str = tokenStream.getTokenArray()
      // console.log('词法分析', str)
      this.generator(str)
      this.debounceFn(val)
    },
    /**
     * 生成对应的词法
    */
    generator(ary = []) {
      ary.forEach((element) => {
        const span = document.createElement('span')
        span.className = `tok-${element.type}`
        span.innerHTML = `${element.value}`
        this.$refs['js-expshow'].appendChild(span)
      })
    },
    /**
     * textarea模拟滚动
    */
    handleScroll(event) {
      this.$refs['js-expshow'].scrollLeft = event.target.scrollLeft
      this.$refs['js-expshow'].scrollTop = event.target.scrollTop
    },
    /**
     * 校验和计算
    */
    check(str) {
      try {
        this.cacheValidata = true
        const parse = new Parse(str, [...this.sourceDimensions, ...this.sourceMeasures])
        const ast = parse.parseAST()
        console.log('语法树', ast)
        const type = this.computeType === '维度' ? 'dimessions' : 'measures'
        const verify = new Verify(type)
        const result = verify.validate(ast)
        console.log('结果', result)
        // if (result) this.errorMessage = ''
        if (this.cacheValidata) this.errorMessage = ''
      } catch (error) {
        this.cacheValidata = false
        console.log(error.message)
        this.errorMessage = error.message
      }
    },
    /**
     * 右侧栏选中
    */
    handleSelectExpression(express) {
      this.insertText(this.$refs['js-textarea'], express.syntax)
    },
    /**
     * 插入到光标处
    */
    insertText(el, text) {
      if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
        return
      }
      if (document.selection) {
          el.focus()
          var cr = document.selection.createRange()
          cr.text = text
          cr.collapse()
          cr.select()
      } else if (el.selectionStart || el.selectionStart === 0) {
          var start = el.selectionStart
          var end = el.selectionEnd
          el.value = el.value.substring(0, start) + text + el.value.substring(end, el.value.length)
          el.selectionStart = el.selectionEnd = start + text.length
      } else {
        el.value += text
      }
      this.textareaValue = el.value
    }
  }
}
</script>
<style lang="less" scoped src="./editor.less"></style>
<style lang="less">
.tok-alias {
  // 别名
  color: #0b4cfc;
}
.tok-integer {
  // inter类型
  color: #0c980c;
}
.tok-float {
  // 浮点型
  color: #0c980c;
}
.tok-string {
  // 字符串，双引号
  color: #0c980c;
}
.tok-special {
  // 特殊字符
  color: #9f9f9f;
}
.tok-fname {
  // 运算函数名称
  color: #30a4c4;
}
.tok-aggregator {
  // 聚合函数
  color: #f8b90b;
}
.tok-spaces {
  // 空格
  white-space: pre;
}
.tok-tail {
  //
  white-space: pre;
  color: #f00300;
}
.tok-zone {
  background-color: rgba(0, 153, 255, 0.32);
}
.tok-boundary {
  border-right: 1px solid #000;
}
</style>
