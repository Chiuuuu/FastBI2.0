import PERMISSION_CODE from '@/config/permission'

const RouteView = () => import('@/layout/routeView')
const PageView = () => import('@/layout/pageView')

const UsersView = () => import('@/views/projectCenter/users/users')

const RolesView = () => import('@/views/projectCenter/roles')
const RolesEdit = () => import('@/views/projectCenter/roles/components/role-edit')

const PermissionsView = () => import('@/views/projectCenter/permissions')
const PermissionsEdit = () => import('@/views/projectCenter/permissions/components/perm-edit')

const SreenMaterialView = () => import('@/views/screenMaterial')

export default {
  path: '/projectCenter',
  redirect: '/projectCenter/users',
  component: RouteView,
  meta: {
    title: '项目中心',
    icon: 'appstore',
    permissions: [PERMISSION_CODE.PAGE.user, PERMISSION_CODE.PAGE.role, PERMISSION_CODE.PAGE.dataPermission]
  },
  children: [
    {
      path: 'users',
      name: 'users',
      component: UsersView,
      meta: {
        title: '用户管理',
        permissions: [PERMISSION_CODE.PAGE.user]
      }
    },
    {
      path: 'roles',
      name: 'roles',
      redirect: '/projectCenter/roles/list',
      component: PageView,
      meta: {
        title: '角色管理',
        permissions: [PERMISSION_CODE.PAGE.role]
      },
      children: [
        {
          path: 'list',
          name: 'rolesList',
          component: RolesView,
          meta: {
            sideBar: 'roles',
            permissions: [PERMISSION_CODE.PAGE.role]
          }
        },
        {
          path: 'edit/id=:id',
          name: 'rolesEdit',
          component: RolesEdit,
          meta: {
            sideBar: 'roles',
            permissions: [PERMISSION_CODE.PAGE.role]
          }
        }
      ]
    },
    {
      path: 'screenMaterial',
      name: 'screenMaterial',
      component: SreenMaterialView,
      meta: {
        title: '素材管理'
      }
    }
    // {
    //   path: 'permissions',
    //   name: 'permissions',
    //   redirect: '/projectCenter/permissions/list',
    //   component: PageView,
    //   meta: {
    //     title: '数据权限管理',
    //     permissions: [PERMISSION_CODE.PAGE.dataPermission]
    //   },
    //   children: [
    //     {
    //       path: 'list',
    //       name: 'permissionsList',
    //       component: PermissionsView,
    //       meta: {
    //         sideBar: 'permissions',
    //         permissions: [PERMISSION_CODE.PAGE.dataPermission]
    //       }
    //     },
    //     {
    //       path: 'edit/id=:id',
    //       name: 'permissionsEdit',
    //       component: PermissionsEdit,
    //       meta: {
    //         sideBar: 'permissions',
    //         permissions: [PERMISSION_CODE.PAGE.dataPermission]
    //       }
    //     }
    //   ]
    // }
  ]
}
