const RouteView = () => import('@/layout/routeView');
const recordView = () => import('@/views/log-admin/record');

export default {
  path: '/logAdmin',
  redirect: '/logAdmin/record',
  component: RouteView,
  meta: {
    title: '日志管理',
    icon: 'cloud',
  },
  children: [
    {
      path: 'record',
      name: 'record',
      component: recordView,
      meta: {
        title: '操作记录',
      },
    },
  ],
};
