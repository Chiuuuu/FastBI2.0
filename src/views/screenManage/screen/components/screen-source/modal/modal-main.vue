<template>
  <div class="container">
    <!-- 搜索栏 -->
    <a-form-model class="material-search-area" layout="inline" :model="searchForm">
      <a-form-model-item prop="keywords">
        <a-input v-model="searchForm.keywords" placeholder="请输入关键字"></a-input>
      </a-form-model-item>
      <a-form-model-item>
        <a-button type="primary" @click="handleGetData">搜索</a-button>
      </a-form-model-item>
    </a-form-model>
    <!-- 搜索栏end -->

    <!-- 素材列表 -->
    <a-spin :spinning="spinning" class="material-list-spin scrollbar">
      <div class="material-list-area">
        <!-- 图片 -->
        <div class="material-list-item" v-for="item in materialList" :key="item.id">
          <img class="image" :src="handleImgUrl(item)" :alt="item.name" @click="handleSelectImage(item)" />
          <div>{{ item.name }}</div>
        </div>
      </div>
    </a-spin>
    <!-- 素材列表end -->

    <!-- 分页器 -->
    <a-pagination
      class="material-pagination"
      showQuickJumper
      showSizeChanger
      :current="pagination.current"
      :pageSize="pagination.pageSize"
      :total="pagination.total"
      :show-total="total => `共${total}条记录`"
      @change="handlePageChange"
      @showSizeChange="handleSizeChange"
    ></a-pagination>
    <!-- 分页器end -->
  </div>
</template>

<script>
import paginationMixin from '@/mixins/pagination';
export default {
  name: 'screenSourceMain',
  mixins: [paginationMixin],
  inject: ['getCategoryId'],
  data() {
    return {
      spinning: false,
      // 搜索栏
      searchForm: {
        keywords: '',
      },
      materialList: [],
    };
  },
  methods: {
    /**
     * @description 处理img的路径
     */
    handleImgUrl(item) {
      return process.env.VUE_APP_SERVICE_URL + item.filePath;
    },
    /**
     * @description 选中素材
     */
    handleSelectImage(item) {
      this.$emit('sourceSelect', item);
    },
    /**
     * @description 获取素材列表
     */
    async handleGetData() {
      this.spinning = true;
      const result = await this.$server.screenMaterial
        .getMaterialList({
          id: this.getCategoryId(),
          name: this.searchForm.keywords,
          current: this.pagination.current,
          pageSize: this.pagination.pageSize,
        })
        .finally(() => {
          this.spinning = false;
        });
      if (result.code === 200) {
        this.materialList = result.rows;
        this.pagination.total = result.total;
      } else {
        this.$message.error(result.msg || '查询失败');
      }
    },
  },
};
</script>

<style lang="less" scoped>
.container {
  display: flex;
  flex-direction: column;
  background: #fff;
  height: 100%;
  padding-left: 15px;
  padding-bottom: 15px;
  color: #020510;

  .material-search-area {
    display: flex;
    align-items: center;
    height: 32px;
    padding-left: 10px;
  }

  .material-list-spin {
    flex: 1;
    overflow-y: auto;
  }
  .material-list-area {
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
  }

  .material-pagination {
    width: 100%;
    height: 32px;
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
  }

  .material-list-item {
    width: 180px;
    height: 120px;
    padding: 10px;

    .image {
      width: 160px;
      height: 90px;
      cursor: pointer;
    }
  }
}
</style>
