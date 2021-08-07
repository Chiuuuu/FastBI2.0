# 关于API的规范化编写(统一使用驼峰命名方式)

## 增删改查保存和其它行为(例子在下面)
1. 新增: 前缀'add'    + XXXXX
2. 删除: 前缀'dele'   + XXXXX
3. 更改: 前缀'put'    + XXXXX
4. 查询: 前缀'get'    + XXXXX
5. 保存: 前缀'save'   + XXXXX
6. 动作: 前缀'action' + XXXXX (除去以上5种)

## 关于方法函数的注释
1. 声明函数的作用，使用 @description
2. 参数说明，使用 @param {类型} 参数名称 参数说明
  2.1 如果是Object类型，先声明Object类型，@param {bject} params 参数说明
  2.2 然后声明其属性值，@param {string} params.属性名 参数说明
3. 如果是可选参数，使用[], @param {类型} [参数] 参数说明
4. 返回值使用 @returns {类型} 参数名称 参数说明

```js
/**
 * @description 新增文件夹
 * @param {Object} params 请求参数
 * @param {string} params.name 名称
 * @returns
 */
addMenuFolder(params) {},

/**
 * @description 根据id删除菜单
 * @param {String} url 请求地址
 * @param {String | Number} id 菜单id
 * @returns
 */
deleMenuById(url, id) {},

/**
 * @description 修改文件夹名称
 * @param {Object} params 请求参数
 * @param {string} params.name 名称
 * @returns
 */
putMenuFolderName(params) {},

/**
 * @description 获取左侧菜单
 * @param {String} url 请求地址
 * @returns
 */
getMenuList(url) {},

/**
 * @description 保存修改表字段
 * @param {Object} [params={}] 请求参数
 * @returns
 */
saveTableField(params = {}) {},

/**
 * @description 连接数据库
 * @param {Object} [params={}] 请求参数
 * @returns
 */
actionConnect(params = {}) {}
```