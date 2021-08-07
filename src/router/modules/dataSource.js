import PERMISSION_CODE from '@/config/permission'

const RouteView = () => import('@/layout/routeView')
const PageView = () => import('@/layout/pageView')
const dataAccessView = () => import('@/views/dataSource/dataAccess/dataAccess')
const dataModelView = () => import('@/views/dataSource/dataModel/dataModel')
const dataModelEditView = () => import('@/views/dataSource/dataModel/model-edit/Model-Edit')

export default {
  path: '/dataSource',
  redirect: '/dataSource/dataAccess',
  component: RouteView,
  meta: {
    title: '数据管理',
    icon: 'bar-chart',
    permissions: [PERMISSION_CODE.PAGE.datasource, PERMISSION_CODE.PAGE.datamodel]
  },
  children: [
    {
      path: 'dataAccess',
      name: 'dataAccess',
      component: dataAccessView,
      meta: {
        title: '数据接入',
        permissions: [PERMISSION_CODE.PAGE.datasource]
      }
    },
    {
      path: 'dataModel',
      name: 'dataModel',
      redirect: '/dataSource/dataModel/modelShow',
      component: PageView,
      meta: {
        title: '数据建模',
        permissions: [PERMISSION_CODE.PAGE.datamodel]
      },
      children: [
        {
          path: 'modelShow',
          name: 'modelShow',
          component: dataModelView,
          meta: {
            sideBar: 'dataModel', // 用于显示对对应的菜单
            permissions: [PERMISSION_CODE.PAGE.datamodel]
          }
        },
        {
          path: 'modelEdit',
          name: 'modelEdit',
          component: dataModelEditView,
          meta: {
            sideBar: 'dataModel',
            permissions: [PERMISSION_CODE.PAGE.datamodel]
          }
        }
      ]
    }
  ]
}
