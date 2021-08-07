<!-- 8-14 数据模型侧栏 -->
<template>
  <div class="board-model" :style="config.style">
    <div style="height: 100%">
      <div class="model-header" v-show="config.title.enable">
        <a-icon
          class="model-back"
          v-if="!model"
          type="arrow-left"
          @click="back"
        />
        <span class="model-span" v-if="modelExpand">{{
          config.title.text
        }}</span>
        <a-icon
          class="model-icon"
          :type="modelExpand ? 'menu-unfold' : 'menu-fold'"
          @click="toCollapse"
        />
      </div>
      <!-- 操作界面 -->
      <div v-if="modelExpand" style="height: calc(100% - 150px)">
        <div class="model-operation" v-if="model">
          <div class="operation">
            <a-radio-group
              v-model="resourceType"
              button-style="solid"
              style="width: 100%"
            >
              <a-radio-button
                :value="8"
                style="width: 50%"
                @click.native="changeAddType(8)"
              >
                数据模型
              </a-radio-button>
              <a-radio-button
                :value="3"
                style="width: 50%"
                @click.native="changeAddType(3)"
              >
                数据接入
              </a-radio-button>
            </a-radio-group>
          </div>
          <div class="operation cls-frstsel">
            <a-select v-model="resourceId" style="width: 62%">
              <a-select-option
                class="cls-mode-sel"
                v-for="item in disableItem"
                :value="item.tableId"
                :key="item.id"
                @mouseover="getHover(item.tableId)"
              >
                <a-tooltip :title="item.resourceName">
                  {{ item.resourceName }}
                </a-tooltip>
                <a-icon
                  class="cls-close"
                  v-show="item.tableId === hoveDataModelId"
                  @click="getDelDataModel(item.screenId, item.tableId)"
                  type="close-circle"
                />
              </a-select-option>
            </a-select>
            <a-button
              style="margin-left: 8px"
              @click="resourceType === 8 ? modelAdd() : sourceAdd()"
              >添加</a-button
            >
          </div>
          <div class="operation">
            {{ searchValue }}
            <a-select
              show-search
              :value="searchValue"
              placeholder="请输入关键字搜索"
              style="width: 100%"
              :default-active-first-option="false"
              :show-arrow="false"
              :filter-option="false"
              :not-found-content="null"
              @search="handleSearch"
              @change="handleChange"
            >
              <template>
                <a-select-option v-for="d in searchResult" :key="d.id">{{
                  d.alias
                }}</a-select-option>
              </template>
            </a-select>
            <!-- <a-input-search placeholder="请输入关键字搜索" style="width:90%" @change="searchChange" /> -->
          </div>
          <!-- 维度度量 -->
          <div class="operation_main">
            <div class="operation" flex="dir:top">
              <div class="header">
                <span class="d_h_s">维度</span>
                <!-- <a-icon class="dicon" type="plus" /> -->
                <!-- @click="openModal('维度')" -->
              </div>
              <!-- <b-scrollbar style="height: 100%;"> -->
              <div class="mea_main">
                <a-collapse
                  class="scrollbar"
                  style="height: 100%; overflow: scroll; margin-top: 10px"
                  v-model="dimensionsKey"
                  :bordered="false"
                >
                  <a-collapse-panel
                    v-for="(item, index) in dimensions"
                    :key="String(index)"
                    :header="item[0] ? item[0].tableName : ''"
                    :style="customStyle"
                  >
                    <ul class="filewrap">
                      <li
                        v-for="(item2, index2) in item"
                        class="filelist"
                        :class="[
                          { active: item2.id === searchSelected },
                          { error: item2.status === 1 }
                        ]"
                        :key="index2 + '_'"
                        :draggable="item2.status === 0"
                        @click="fileClick(item2.id, item2.status)"
                        @dragstart="dragstart(item2, 'dimensions', $event)"
                        @dragend="dragsend(item2, $event)"
                        @contextmenu.prevent="showMore(item2)"
                      >
                        <img src="@/assets/images/icon_dimension.png" />
                        <span :class="{ error: item2.status !== 0 }">{{
                          item2.alias
                        }}</span>
                        <a-dropdown
                          :trigger="['click', 'contextmenu']"
                          v-if="!dimensionsChecked.includes(item2.id)"
                          v-model="item2.showMore"
                        >
                          <a-icon class="icon-more" type="caret-down" />
                          <a-menu slot="overlay">
                            <a-menu-item key="3" @click="changeItem(item2, 2)"
                              >转为度量</a-menu-item
                            >
                            <a-sub-menu
                              key="4"
                              title="创建地理字段"
                              @click="openGeoSetting(item2)"
                            >
                              <!-- <a-menu-item>国家</a-menu-item>
                              <a-menu-item>省市</a-menu-item> -->
                              <a-menu-item>城市</a-menu-item>
                              <!-- <a-menu-item>区县</a-menu-item> -->
                            </a-sub-menu>
                          </a-menu>
                        </a-dropdown>
                      </li>
                    </ul>
                  </a-collapse-panel>
                </a-collapse>
              </div>
              <!-- </b-scrollbar> -->
            </div>
            <div class="operation scrollbar" flex="dir:top">
              <div class="header">
                <span class="d_h_s">度量</span>
                <!-- <a-icon class="dicon" type="plus" /> -->
                <!-- @click="openModal('度量')" -->
              </div>
              <!-- <b-scrollbar style="height: 100%;"> -->
              <div class="mea_main">
                <a-collapse
                  class="scrollbar"
                  style="height: 100%; overflow: scroll; margin-top: 10px"
                  v-model="measuresKey"
                >
                  <a-collapse-panel
                    v-for="(item, index) in measures"
                    :key="String(index)"
                    :header="item[0].tableName"
                    :style="customStyle"
                  >
                    <ul class="filewrap">
                      <li
                        v-for="(item2, index2) in item"
                        class="filelist"
                        :class="[
                          { active: item2.id === searchSelected },
                          { error: item2.status === 1 }
                        ]"
                        :key="index2 + '_'"
                        :draggable="item2.status === 0"
                        @click="fileClick(item2.id, item2.status)"
                        @dragstart="dragstart(item2, 'measures', $event)"
                        @dragend="dragsend(item2, $event)"
                        @contextmenu.prevent="showMore(item2)"
                      >
                        <img src="@/assets/images/icon_measure.png" />
                        <span :class="{ error: item2.status !== 0 }">{{
                          item2.alias
                        }}</span>
                        <a-dropdown
                          :trigger="['click', 'contextmenu']"
                          v-if="!measuresChecked.includes(item2.id)"
                          v-model="item2.showMore"
                        >
                          <a-icon class="icon-more" type="caret-down" />
                          <a-menu slot="overlay">
                            <a-menu-item key="3" @click="changeItem(item2, 1)"
                              >转为维度</a-menu-item
                            >
                          </a-menu>
                        </a-dropdown>
                      </li>
                    </ul>
                  </a-collapse-panel>
                </a-collapse>
              </div>
              <!-- </b-scrollbar> -->
            </div>
          </div>
          <compute-setting
            :is-show="visible"
            :compute-type="computeType"
            @close="close"
          ></compute-setting>
          <geo-setting
            v-if="createMapVisible"
            :is-show="createMapVisible"
            region="城市"
            :dimensions-data="createdMapData"
            :type="resourceType"
            @close="createMapVisible = false"
            @handleSave="handleSave"
          ></geo-setting>
        </div>
        <!-- 初始界面 -->
        <div class="model-contain" v-else style="height: 100%">
          <div class="model-search">
            <a-input-search
              placeholder="输入关键字搜索"
              style="width: 90%; margin-left: 15px"
              @change="modelSearch"
            />
          </div>
          <!-- <b-scrollbar style="height: 100%;"> -->
          <!--大屏数据-->
          <add-data-list
            :type="resourceType"
            :data-list="dataList"
            :disable-list="disableId"
            @fileHandle="fileHandle"
            :key="key"
          ></add-data-list>
          <!-- </b-scrollbar> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { deepClone } from '@/utils/deepClone'
import debounce from 'lodash/debounce'
import { menuSearchLoop } from '@/utils/menuSearch'
import { Loading } from 'element-ui'
import ComputeSetting from '@/views/dataSource/dataModel/model-edit/setting/compute-setting'
import GeoSetting from './components/geo-setting'
import AddDataList from './components/addDataList'
export default {
  name: 'BoardModel',
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  components: { ComputeSetting, GeoSetting, AddDataList },
  data() {
    return {
      customStyle:
        'background: #ffffff;border-radius: 4px;border: 0;overflow: hidden;color:red !important;',
      modelKey: ['0', '1', '2', '3', '4', '5', '6', '7'],
      dimensionsKey: ['0', '1', '2', '3'], // 默认展开
      measuresKey: ['0', '1', '2', '3'],
      model: true,
      dimensions: [], // 维度列表
      measures: [], // 度量列表
      resourceId: '',
      disableId: [], // 已经选中的数据模型无法点击
      searchValue: undefined, // 搜索的维度度量
      searchList: [], // 维度度量整合成一个数组可供搜索
      searchResult: [], // 维度度量搜索结果列表
      searchSelected: '', // 搜索选中的维度度量
      dimensionsChecked: [], // 选中的维度id
      measuresChecked: [], // 选中的度量id
      visible: false,
      createMapVisible: false,
      computeType: '',
      detailInfo: {}, // 聚合运算数据
      cacheDimensions: [],
      cacheMeasures: [], // 缓存自定义度量
      createdMapData: {},
      resourceType: 8, // 当前数据类型标识（接入:3|模型:8）
      dataList: [], // 显示的菜单列表
      modelList: [], // 模型菜单
      sourceList: [], // 接入菜单
      key: 0, // 刷新菜单
      hoveDataModelId: '' // 悬浮选中的数据模型id
    }
  },
  computed: {
    ...mapGetters([
      'modelExpand',
      'dataModel',
      'screenId',
      'selectedModelList',
      'currentSelected',
      'currSelected',
      'canvasMap'
    ]),
    // 过滤模型列表
    savedModels() {
      return this.selectedModelList.filter(item => item.resourceType === 8)
    },
    // 过滤接入列表
    savedSources() {
      return this.selectedModelList.filter(item => item.resourceType === 3)
    },
    // 根据类型显示对应列表
    disableItem() {
      return this.resourceType === 8 ? this.savedModels : this.savedSources
    }
  },
  watch: {
    selectedModelList: {
      handler(val) {
        if (val.length > 0) {
          if (!val.find(item => item.id === this.resourceId)) {
            if (this.resourceType === 8) {
              this.resourceId =
                this.savedModels.length > 0 ? this.savedModels[0].tableId : ''
            } else {
              this.resourceId =
                this.savedSources.length > 0 ? this.savedSources[0].tableId : ''
            }
            this.model = true
          }
        } else {
          // 模型列表为空清空当前度量列表(文本框选择度量列表)
          this.resourceId = ''
          this.$store.dispatch('SetModelMeasures', [])
        }
        this.disableId = val.map(item => item.tableId)
      },
      deep: true
    },
    currSelected: {
      handler(val) {
        if (val) {
          if (val.datamodelId !== '0' && val.datamodelId !== 0) {
            this.resourceId = val.datamodelId
            this.resourceType = val.setting.resourceType
          }
          this.dimensionsChecked = []
          if (
            val.setting.api_data.dimensions &&
            val.setting.api_data.dimensions.length > 0
          ) {
            val.setting.api_data.dimensions.map(item => {
              this.dimensionsChecked.push(item.id)
            })
          }
          this.measuresChecked = []
          if (
            val.setting.api_data.measures &&
            val.setting.api_data.measures.length > 0
          ) {
            val.setting.api_data.measures.map(item => {
              this.measuresChecked.push(item.id)
            })
          }
        }
      },
      deep: true
    },
    resourceId(val) {
      // 没有选中数据，清空维度度量信息
      if (!val) {
        this.dimensions = []
        this.measures = []
        return
      }
      if (this.selectedModelList.length === 0) {
        return
      }
      this.getPivoSchemaList(val)
    }
  },
  methods: {
    ...mapActions(['getScreenDetail']),
    // 数据模型搜索
    modelSearch: debounce(function(event) {
      const value = event.target.value
      if (value) {
        this.handleGetSearchList(value)
      } else {
        this.dataList =
          this.resourceType === 8 ? this.modelList : this.sourceList
        // 强制刷新菜单
        this.key++
      }
    }, 400),
    // 切换数据类型
    changeAddType(type) {
      // 没有切换数据类型
      if (type === this.resourceType) {
        return
      }
      this.resourceType = type
      // 默认取对应类型列表第一个值
      if (type === 8) {
        this.resourceId =
          this.savedModels.length > 0 ? this.savedModels[0].tableId : ''
      } else {
        this.resourceId =
          this.savedSources.length > 0 ? this.savedSources[0].tableId : ''
      }
      // 当前没有选中数据清空维度度量
      if (!this.resourceId) {
        this.dimensions = []
        this.measures = []
      }
    },
    // 搜索关键字
    handleGetSearchList(value) {
      // 按模型/接入搜索
      if (this.resourceType === 8) {
        this.dataList = this.search(this.modelList, value)
      } else {
        this.dataList = this.search(this.sourceList, value)
      }
      // 强制刷新菜单
      this.key++
    },
    // 搜索关键字
    search(list, value) {
      let result = []
      list.map(item => {
        const newItem = menuSearchLoop(item, value)
        if (newItem) {
          result.push(newItem)
        }
      })
      return result
    },
    // 点击展开收起
    toCollapse() {
      this.$emit('on-toggle', this.modelExpand)
    },
    // 添加数据模型
    modelAdd() {
      if (this.modelList.length > 0) {
        this.dataList = this.modelList
        this.model = !this.model
        return
      }
      this.getModelList().then(res => {
        if (res) {
          this.model = !this.model
        }
      })
    },
    // 添加数据接入
    sourceAdd() {
      if (this.sourceList.length > 0) {
        this.dataList = this.sourceList
        this.model = !this.model
        return
      }
      this.getSourceList().then(res => {
        if (res) {
          this.model = !this.model
        }
      })
    },
    // 获取数据接入列表
    async getSourceList() {
      let catalog = await this.$server.common.getMenuList(
        '/datasource/catalog/list/1'
      )
      if (catalog.code === 200) {
        catalog.rows.map(item => {
          item.selected = false
          item.showMore = false
        })
        this.sourceList = catalog.rows
        this.dataList = catalog.rows
        return true
      }
      return false
    },
    back() {
      if (
        this.currSelected &&
        this.currSelected.datamodelId !== '0' &&
        this.currSelected.datamodelId !== 0
      ) {
        this.resourceId = this.currSelected.datamodelId
        this.resourceType = this.currSelected.setting.resourceType
      }
      this.model = true
    },
    // 点击选中模型
    fileHandle(item) {
      this.model = !this.model
      this.$store.dispatch('SetDataModel', item)
      this.saveData(item)
    },
    // 保存选中的模型
    async saveData(item) {
      let params = {
        screenId: this.screenId,
        resourceName: item.name,
        datasourceId: '',
        databaseId: '',
        tableId: item.id
      }
      // 数据接入
      if (item.resourceType === 3) {
        params = {
          ...params,
          datasourceId: item.datasourceId,
          databaseId: item.databaseId,
          tableId: item.id,
          origin: 3 // 数据源:3,模型:8
        }
      } else {
        // 模型
        params.origin = 8 // 数据源:3,模型:8
      }
      await this.$server.screenManage.screenModuleSave(params)
      item.resourceName = item.name
      item.tableId = item.id
      let list = this.selectedModelList.concat([item])
      this.$store.dispatch('dataModel/setSelectedModelList', list)
      this.resourceId = item.id
    },
    // 拖动开始 type 拖拽的字段类型维度或者度量
    dragstart(item, type, event) {
      item.file = type
      item.resourceType = this.resourceType
      event.dataTransfer.setData('dataFile', JSON.stringify(item))
      this.$store.dispatch('SetDragFile', type)
    },
    // 拖动结束
    dragsend() {
      this.$store.dispatch('SetDragFile', '')
    },
    // 点击维度度量 取消选中效果
    fileClick(id, status) {
      if (id === this.searchSelected) {
        this.searchSelected = ''
      }
    },
    // 数据模型列表
    async getModelList() {
      return this.$server.screenManage.getCatalogList().then(res => {
        if (res.code === 200) {
          res.data.map(item => {
            item.selected = false
            item.showMore = false
          })
          this.modelList = res.data
          this.dataList = res.data
          return true
        }
      })
    },
    // 维度度量搜索
    handleSearch(value) {
      if (value) {
        let result = []
        this.searchList.map(item => {
          if (item.alias.includes(value)) {
            result.push(item)
          }
        })
        if (result.length === 0) {
          result = [{ alias: '没有符合的搜索结果', id: 11 }]
        }
        this.searchResult = result
      } else {
        this.searchResult = []
      }
    },
    // 选择搜索的维度度量
    handleChange(value) {
      this.searchSelected = value
    },
    // 右键显示更多
    showMore(item) {
      item.showMore = true
    },
    openModal(computeType) {
      this.visible = true
      if (computeType) this.computeType = computeType
    },
    openGeoSetting(item) {
      item.modelId = this.resourceId
      this.createdMapData = item
      this.createMapVisible = true
      item.showMore = false
    },
    close() {
      this.visible = false
    },
    // 转为维度或者度量
    changeItem(item, num) {
      let params = {
        screenTableId: item.screenTableId,
        datamodelId: item.datamodelId,
        pivotschemaId: item.pivotschemaId,
        role: num, // 转成维度传1，转成度量传2
        screenId: this.screenId
      }
      this.$server.screenManage.screenModuleTransform(params).then(res => {
        if (res.code === 200) {
          this.getPivoSchemaList(this.resourceId, 2)
        }
      })
    },
    // 维度、度量列表
    getPivoSchemaList(id, type = 1) {
      let loadingInstance = Loading.service({
        lock: true,
        text: '加载中...',
        target: 'body',
        background: 'rgb(255, 255, 255, 0.6)'
      })
      this.$server.screenManage
        .getPivoSchemaList(id, this.screenId, type)
        .then(res => {
          if (res.code === 200) {
            res.data.dimensions.map(item => {
              item.showMore = false
            })
            res.data.measures.map(item => {
              item.showMore = false
            })
            let datas = res.data
            let dimensions = datas.dimensions
            let measures = datas.measures
            this.dimensions = this.transData(dimensions)
            dimensions = dimensions.map(item => {
              return { ...item, visible: true, produceType: 0 }
            })
            this.measures = this.transData(measures)
            measures = measures.map(item => {
              return {
                ...item,
                visible: true,
                produceType: 0,
                resourceType: this.resourceType
              }
            })
            this.$store.dispatch('SetModelMeasures', measures)
            this.searchList = [...dimensions, ...measures]

            this.detailInfo.pivotSchema = {
              dimensions,
              measures
            } // 聚合运算数据

            // 获取被删除的数据(status===1)
            this.$emit('getErrorData', {
              dimensions: dimensions.filter(item => item.status === 1),
              measures: measures.filter(item => item.status === 1)
            })
          }
        })
        .finally(() => {
          loadingInstance.close()
        })
    },
    transData(data) {
      const result = Object.values(
        data.reduce((obj, cur) => {
          if (obj[cur.tableNo]) {
            Object.prototype.toString.call(obj[cur.tableNo]) ===
            '[object Array]'
              ? obj[cur.tableNo].push(cur)
              : (obj[cur.tableNo] = [obj[cur.tableNo], cur])
          } else {
            obj[cur.tableNo] = [cur]
          }
          return obj
        }, {})
      )
      return result
    },
    handleSave(datas) {
      let selected = this.canvasMap.find(
        item => item.id === this.currentSelected
      )
      selected.setting.api_data.mapDatas = datas
    },
    getHover(val) {
      let datamoel = this.canvasMap.map(x => x.datamodelId)
      if (!datamoel.includes(val)) {
        this.hoveDataModelId = val
      } else {
        this.hoveDataModelId = ''
      }
    },
    async getDelDataModel(screenId, tableId) {
      console.log('****', this.screenId)
      let res = await this.$server.dataModel.delDataModel(
        this.screenId,
        tableId
      )
      if (res.code === 200) {
        this.$message.success('删除成功')
        this.getScreenDetail({
          id: this.$route.query.id,
          tabId: this.$route.query.tabId
        })
      } else {
        this.$message.error(res.msg || res || '删除失败')
      }
    }
  }
}
</script>

<style lang="stylus">
.ant-collapse > .customStyle > .ant-collapse-header {
  color: #ccc;
}

.disable, .disable .ant-collapse-header {
  color: #ccc !important;
}

.mod {
  width: 100%;
  height: 350px;
  display: flex;
  justify-content: space-between;

  .modal_l {
    .modal_dropdown {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;
      width: 257px;

      .dropdown {
        position: relative;
        width: 120px;
        height: 32px;
        line-height: 1.5;
        border: 1px solid #d9d9d9;
        padding: 4px 11px;
        cursor: pointer;

        &::after {
          content: '';
          display: block;
          width: 0;
          height: 0;
          border-style: solid dashed dashed;
          border-width: 6px 5px;
          border-color: #aaa transparent transparent transparent;
          position: absolute;
          right: 12px;
          top: 12px;
        }
      }
    }
  }

  .modal_r {
    width: 365px;
    padding: 20px 10px 32px;
    background: rgba(246, 246, 246, 1);
    display: flex;
    justify-content: space-around;

    .bar {
      width: 140px;
    }

    .descript {
      margin-top: 13px;
      margin-left: 11px;
    }

    .list {
      height: calc(100% - 32px);
      border: 1px solid #d9d9d9;
      background-color: #fff;
      overflow-y: auto;
    }

    .list-item {
      padding: 5px 12px;
      line-height: 22px;
      cursor: pointer;

      &.active {
        background-color: #40c0a8;
        color: #fff;
      }
    }

    .text {
      padding: 10px 10px 10px 20px;
      font-size: 12px;
      max-height: 260px;
      overflow: auto;

      .tit {
        padding-bottom: 10px;
        font-weight: bolder;
      }

      .des {
        word-break: break-all;
        line-height: 18px;
      }

      .example {
        margin-top: 10px;
        line-height: 15px;

        span.title {
          font-weight: bolder;
        }
      }
    }
  }
}

.cacsader {
  display: flex;
  justify-content: space-around;
}

.geo-contain {
  display: flex;
  justify-content: space-between;

  .geo-map {
    width: 188px;
    height: 279px;
    padding: 10px;
    background: rgba(248, 248, 248, 1);
    margin-top: 19px;
  }

  .geo-set {
    width: 580px;

    .set-head {
      background: rgba(248, 248, 248, 1);
      margin-left: 18px;
      margin-top: 19px;
      height: 36px;
      display: flex;
      justify-content: space-between;

      .g-s-s {
        font-size: 14px;
        font-family: Microsoft YaHei;
        font-weight: 400;
        color: rgba(1, 4, 15, 1);
        line-height: 35px;
        margin-left: 12px;
      }

      .g-s-r {
        font-size: 14px;
        font-family: Microsoft YaHei;
        font-weight: 400;
        color: rgba(252, 92, 92, 1);
        line-height: 35px;
        margin-right: 12px;
      }
    }

    .set-select {
      display: flex;
      justify-content: space-between;
      margin-left: 18px;
      margin-top: 14px;

      .s-s-s {
        font-size: 14px;
        font-family: Microsoft YaHei;
        font-weight: 400;
        color: rgba(1, 4, 15, 1);
      }
    }

    .set-table {
      margin-top: 10px;
      margin-left: 30px;
      width: 90%;
    }
  }
}
.cls-frstsel{
  .cls-close{
    display: none;
  }
}
.cls-close {

  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 999;
  font-size: 15px;
}
</style>
