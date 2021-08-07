<template>
  <a-modal
    :visible="isShow"
    title="Union"
    :getContainer="() => $parent.$refs.rightBody"
    :mask-closable="false"
    :z-index="500"
    @ok="handleSave"
    @cancel="handleClose"
  >
    <a-form-model
      ref="form"
      :model="form"
      :rules="rules"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
    >
      <a-form-model-item label="表名称" prop="name">
        <a-input v-model="form.name" placeholder="请输入表名称" />
      </a-form-model-item>
      <a-form-model-item label="合并方式" prop="uniq">
        <a-radio-group v-model="form.uniq">
          <a-radio :value="false">
            不去重
          </a-radio>
          <a-radio :value="true">
            去重
          </a-radio>
        </a-radio-group>
      </a-form-model-item>
    </a-form-model>
    <div
      class="union-list"
      @dragover.prevent.stop
      @drop.stop="handleDrop"
    >
      <div class="union-table" :title="table.name" v-for="(table, index) in unionList" :key="table.id">
        <span>{{ table.name }}</span>
        <a-icon v-if="index !== 0" type="delete" @click.stop="handleDeleteUnion(table, index)"></a-icon>
      </div>
    </div>
  </a-modal>
</template>

<script>
import omit from 'lodash/omit'
export default {
  name: 'unionSetting',
  inject: ['nodeStatus'],
  props: {
    isShow: Boolean,
    unionData: {
      type: [ Object, Array ],
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      form: {
        name: '',
        uniq: false
      },
      rules: {
        name: [
          { required: true, message: '请输入表名称' },
          { min: 1, max: 50, message: '请输入1-50个字符的表名称' }
        ]
      },
      unionList: []
    }
  },
  watch: {
    isShow: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          const nodeProps = this.unionData.getProps()
          if (nodeProps.type !== 2) {
            // 不是合并类型
            this.form.name = nodeProps.name + '_Union'
            this.unionList = [].concat([omit(nodeProps, 'union')])
          } else {
            this.form.name = nodeProps.name
            const { connectType, tableList } = nodeProps.union
            this.form.uniq = connectType
            this.unionList = [...tableList]
          }
        }
      }
    }
  },
  methods: {
    handleDrop() {
      const nodeData = this.nodeStatus.dragNode
      const data = {
        tableId: nodeData.id,
        name: nodeData.name,
        datamodelId: this.unionList[0].datamodelId,
        type: nodeData.type
      }
      this.unionList.push(data)
    },
    handleSave() {
      this.$refs.form.validate(async (ok) => {
        if (ok) {
          const hasUnionLength = this.unionList.length
          if (hasUnionLength > 1) {
            const params = {
              connectType: this.form.uniq,
              tableList: this.unionList
            }
            const result = await this.$server.dataModel.actionVerifyUnionTable(params)
            if (result.code === 200) {
              this.$emit('success', {
                node: this.unionData,
                union: params,
                form: this.form
              })
              this.handleClose()
            } else {
              this.$message.error(result.msg || '请求错误')
            }
          } else {
            this.$message.error('从左侧列表中拖入需要union的表')
          }
        }
      })
    },
    handleDeleteUnion(tabel, index) {
      this.unionList.splice(index, 1)
    },
    handleClose() {
      this.form = this.$options.data().form
      this.unionList.splice(0)
      this.$emit('close')
    }
  }
}
</script>
