<template>
  <div class="material-list-item">
    <!-- 标题 -->
    <div class="title-area">
      <div style="padding-top:20px" v-if="mode === 'show'">{{ data.name }}</div>
      <a-form-model v-else ref="form" :model="form" :rules="rules">
        <a-form-model-item prop="name">
          <a-input
            ref="input"
            v-model="form.name"
            @keyup.enter.stop="handleResetNameBlur"
            @blur="handleResetNameBlur"
          ></a-input>
        </a-form-model-item>
      </a-form-model>
    </div>

    <!-- 图片 -->
    <div class="image-area" @click="handlePreviewImage">
      <img class="image" :src="imageUrl" :alt="data.name" />
    </div>

    <!-- 操作栏 -->
    <div class="controller">
      <a-popconfirm title="是否确定删除？" ok-text="确定" cancel-text="取消" @confirm="handleDelete">
        <a :class="{ 'disabled': data.parentId == 1 }">删除</a>
      </a-popconfirm>
      <a :class="{ 'disabled': data.parentId == 1 }" @click="handleReset">重命名</a>
      <a-popconfirm ok-text="确定" cancel-text="取消" @confirm="handleChangeParent">
        <i slot="icon"></i>
        <a-select slot="title" v-model="parentId">
          <a-select-option
            v-for="item in categoryList"
            :value="item.id"
            :key="item.id"
          >{{ item.name }}</a-select-option>
        </a-select>
        <a :class="{ 'disabled': data.parentId == 1 }">移动到分类</a>
      </a-popconfirm>
    </div>
    <!-- 操作栏end -->
  </div>
</template>

<script>
import commonValidateField from '@/utils/validator'
export default {
  name: 'MaterialListItem',
  inject: ['getCategoryList', 'getCategoryId'],
  props: {
    data: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      parentId: this.getCategoryId(), // 分类id
      mode: 'show',
      form: {
        name: ''
      },
      rules: {
        name: [
          {
            required: true,
            message: '请输入素材名称'
          },
          {
            min: 1,
            max: 10,
            message: '请输入1~10个字的素材名称'
          },
          commonValidateField.noEmoji({ title: '素材名称' })
        ]
      }
    }
  },
  computed: {
    categoryList() {
      return this.getCategoryList().filter(n => n.id !== 1)
    },
    imageUrl() {
      return process.env.VUE_APP_SERVICE_URL + this.data.filePath
    }
  },
  methods: {
    // 显示时截掉文件后缀
    formatName(name) {
      const index = name.lastIndexOf('.')
      return name.slice(0, index)
    },
    // http交互时带上当前最新名字+后缀
    getHoleName(name) {
      const index = this.data.name.lastIndexOf('.')
      return name + this.data.name.slice(index)
    },
    handlePreviewImage() {
      let imageUrl = this.imageUrl
      const index = imageUrl.indexOf('/thumbnail')
      imageUrl = imageUrl.slice(0, index) + imageUrl.slice(index + 10)
      this.$emit('preview', imageUrl)
    },
    handleReset() {
      this.mode = 'edit'
      this.form.name = this.formatName(this.data.name)
      this.$nextTick(() => {
        this.$refs.input.focus()
      })
    },
    handleResetNameBlur() {
      if (this.mode === 'show') return
      this.$refs.form.validate(async (ok) => {
        if (ok) {
          const result = await this.$server.screenMaterial.updateMaterial({
            id: this.data.id,
            name: this.getHoleName(this.form.name),
            parentId: this.parentId
          })
          if (result.code === 200) {
            this.mode = 'show'
            this.data.name = this.getHoleName(this.form.name)
            this.form.name = ''
          } else {
            this.mode = 'show'
            this.$message.error(result.msg || '请求失败')
          }
        }
      })
    },
    async handleDelete() {
      const result = await this.$server.screenMaterial.deleMaterial({
        id: this.data.id,
        name: this.data.name,
        parentId: this.parentId
      })
      if (result.code === 200) {
        this.$message.success('删除成功')
        this.$emit('refresh')
      } else {
        this.$message.error(result.msg || '请求失败')
      }
    },
    async handleChangeParent() {
      const result = await this.$server.screenMaterial.actionMoveMaterial({
        id: this.data.id,
        name: this.data.name,
        parentId: this.parentId,
        oldGroupId: this.getCategoryId()
      })
      if (result.code === 200) {
        this.$message.success('移动成功')
        this.$emit('refresh')
      } else {
        this.$message.error(result.msg)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.material-list-item {
  width: 200px;
  height: 250px;
  padding: 10px;

  .title-area {
    height: 60px;
  }

  .image-area {
    width: 100%;
    height: 148px;
    vertical-align: middle;
    cursor: pointer;
  }

  .image {
    width: 100%;
    height: 148px;
  }

  .controller {
    display: flex;
    justify-content: space-between;

    .disabled {
      color: #ccc;
      pointer-events: none;
      cursor: default;
    }
  }
}
</style>
