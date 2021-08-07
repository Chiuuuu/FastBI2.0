import PERMISSION_CODE from '@/config/permission'
const PageView = () => import('@/layout/pageView.vue')
// const ScreenEditView = () => import('@/views/screenManage/screenEdit/admin')
const ScreenEditView = () => import('@/views/screenManage/screen/index.vue')
export default {
  path: '/screen',
  redirect: '/screen/edit',
  component: PageView,
  meta: {
    permissions: [PERMISSION_CODE.PAGE.screen]
  },
  children: [
    {
      path: 'edit',
      name: 'screenEdit',
      component: ScreenEditView,
      meta: {
        permissions: [PERMISSION_CODE.PAGE.screen]
      }
    }
  ]
}
