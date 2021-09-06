<template>
  <a-tree
    class="limitTree"
    :tree-data="injectTreeData"
    :replace-fields="replaceFields"
    :selectable="false"
    :blockNode="true"
  >
    <template slot="custom" slot-scope="item" style="color: #f00; width: 100%">
      <a-row>
        <a-col :span="(injectRoleTab === 3 ? 22 : 24) - injectActionList.length * 2">
          <a-icon style="margin-right: 8px" v-if="item.fileType === 0" type="folder" />
          <a-icon style="margin-right: 8px" v-else type="file" />
          <span>{{ item.title }}</span>
        </a-col>
        <!-- 文件夹 -->
        <a-col v-if="item.fileType === 0" :span="injectActionList.length * 2">
          <a-checkbox-group :value="item.permissions" style="width: 100%">
            <a-row>
              <a-col
                span="5"
                v-for="(subitem, subindex) in injectActionList"
                :key="subitem.permission"
                :style="{
                  width: `${100 / injectActionList.length}%`,
                }"
              >
                <!-- 如果文件夹权限和文件的权限名对不上(如查看!=编辑),则空占位 -->
                <a-checkbox
                  v-if="injectFolderHeader.some(n => n.name === subitem.name)"
                  :class="`custom-checkbox-${subindex + 1}`"
                  :value="injectFolderHeader.find(n => n.name === subitem.name).permission"
                  @change="
                    e =>
                      onChange(
                        injectFolderHeader.find(n => n.name === subitem.name),
                        e,
                        item,
                      )
                  "
                  :disabled="isDisabled"
                ></a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-col>
        <!-- 普通对象 -->
        <a-col v-if="item.fileType === 1" :span="injectActionList.length * 2">
          <a-checkbox-group :value="item.permissions" style="width: 100%">
            <a-row>
              <a-col
                span="5"
                v-for="(subitem, subindex) in injectActionList"
                :key="subitem.permission"
                :style="{
                  width: `${100 / injectActionList.length}%`,
                }"
              >
                <a-checkbox
                  :class="`custom-checkbox-${subindex + 1}`"
                  :value="subitem.permission"
                  @change="e => onChange(subitem, e, item)"
                  :disabled="isDisabled"
                ></a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-col>
        <!-- 数据源最后再拼一个库组权限 -->
        <a-col v-if="injectRoleTab === 3 && item.fileType === 1" span="2">
          <a-button style="margin-left: 10px" size="small" type="primary" @click="$emit('setTable', item)">
            查看
          </a-button>
        </a-col>
      </a-row>
    </template>
  </a-tree>
</template>

<script>
export default {
  name: 'limitTree',
  inject: ['status', 'getProvideActionList', 'getProvideTreeData', 'getCurrentRoleTab', 'getFolderHeader'],
  data() {
    return {
      replaceFields: {
        key: 'id',
      },
    };
  },
  computed: {
    isDisabled() {
      return this.status === 'show';
    },
    injectActionList() {
      return this.getProvideActionList();
    },
    injectTreeData() {
      return this.getProvideTreeData();
    },
    injectRoleTab() {
      return this.getCurrentRoleTab();
    },
    injectFolderHeader() {
      return this.getFolderHeader();
    },
  },
  methods: {
    handleCheckbox(permission, checked, item) {
      const READ_PERMISSION = item.fileType === 0 ? 'folderRead' : 'read';
      const EDIT_PERMISSION = 'edit';
      const EDIT_LOCK_PERMISSION = 'lock';
      if (permission === READ_PERMISSION && !checked) {
        // 取消查看则清空
        item.permissions.splice(0);
        // 如果去除了文件的查看权限, 则子节点所有权限全部删除
        if (item.fileType === 0 && item.children && item.children.length > 0) {
          item.children.map(leaf => {
            this.handleCheckbox('read', checked, leaf);
          });
        } else if (item.fileType === 1 && item.dataBasePri) {
          // 将数据源的库权限清空
          item.dataBasePri.splice(0);
        }
      }

      if (checked) {
        if (
          item.permissions.length === 0 ||
          (!item.permissions.includes(READ_PERMISSION) && !item.permissions.includes(permission))
        ) {
          item.permissions.push(READ_PERMISSION);
          if (permission !== READ_PERMISSION) item.permissions.push(permission);

          // 数据源模块勾选查看时要将库组权限都勾上
          if (item.fileType === 1 && item.dataBasePri) {
            // 先清空
            item.dataBasePri.splice(0);
            // 插入源id, 表示下面库组全选
            item.dataBasePri.push(item.id);
          }
        } else if (item.permissions.includes(READ_PERMISSION) && !item.permissions.includes(permission)) {
          item.permissions.push(permission);
        }

        // 数据模型模块 勾选了编辑锁定权限同时要勾选编辑权限
        if (permission === EDIT_LOCK_PERMISSION && !item.permissions.includes(EDIT_PERMISSION)) {
          item.permissions.push(EDIT_PERMISSION);
        }

        // 如果子节点勾选了权限, 则父节点(文件夹)也要相应勾上查看权限
        if (item.fileType === 1 && +item.parentId) {
          const parent = this.injectTreeData.find(p => p.id === item.parentId);
          !parent.permissions.includes('folderRead') && this.handleCheckbox('folderRead', checked, parent);
        }
      } else {
        const index = item.permissions.indexOf(permission);
        if (index > -1) {
          item.permissions.splice(index, 1);
        }

        // 数据模型取消勾选编辑权限, 同时要去掉编辑锁定权限
        if (this.injectRoleTab === 2 && permission === EDIT_PERMISSION) {
          const lockIndex = item.permissions.indexOf(EDIT_LOCK_PERMISSION);
          if (lockIndex > -1) {
            item.permissions.splice(lockIndex, 1);
          }
        }
      }
      this.$emit('getChangeItem', this.injectRoleTab, item);
    },
    onChange(data, e, item) {
      const { permission } = data;
      const checked = e.target.checked;
      this.handleCheckbox(permission, checked, item);
    },
  },
};
</script>
<style lang="less" scoped>
@deep: ~'>>>';
.limitTree {
  padding-left: 16px;
  @{deep} li ul {
    padding: 0;
  }
}
</style>
