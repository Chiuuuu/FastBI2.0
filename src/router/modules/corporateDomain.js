import PERMISSION_CODE from '@/config/permission'

const RouteView = () => import('@/layout/routeView')
const PersonelView = () => import('@/views/corporateDomain/personnel')
const ProjectView = () => import('@/views/corporateDomain/project')

export default {
  path: '/corporateDomain',
  redirect: '/corporateDomain/personnel',
  component: RouteView,
  meta: {
    title: '企业域管理',
    icon: 'cloud',
    permissions: [PERMISSION_CODE.PAGE.personnel, PERMISSION_CODE.PAGE.project]
  },
  children: [
    {
      path: 'personnel',
      name: 'personnel',
      component: PersonelView,
      meta: {
        title: '人员管理',
        permissions: [PERMISSION_CODE.PAGE.personnel]
      }
    },
    {
      path: 'project',
      name: 'project',
      component: ProjectView,
      meta: {
        title: '项目管理',
        permissions: [PERMISSION_CODE.PAGE.project]
      }
    }
  ]
}
