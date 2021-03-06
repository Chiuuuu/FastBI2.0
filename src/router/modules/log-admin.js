import PERMISSION_CODE from '@/config/permission';

const RouteView = () => import('@/layout/routeView');
const recordView = () => import('@/views/log-admin/record');

export default {
  path: '/logAdmin',
  redirect: '/logAdmin/record',
  component: RouteView,
  meta: {
    title: '日志管理',
    icon: 'calendar',
    permissions: [PERMISSION_CODE.PAGE.logAdmin],
  },
  children: [
    {
      path: 'record',
      name: 'record',
      component: recordView,
      meta: {
        title: '操作记录',
        permissions: [PERMISSION_CODE.PAGE.logAdmin],
      },
    },
  ],
};
