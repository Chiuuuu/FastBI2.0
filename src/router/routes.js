import LoginRouter from './modules/login'
import NoFoundRouter from './modules/404'
import ScreenRouter from './modules/screen'
import BaseRouter from './modules/layout'

let routes = [
    LoginRouter,
    ScreenRouter,
    BaseRouter
]

export const commonRoutes = [
    LoginRouter,
    NoFoundRouter
]

export const asyncRoutes = [
    ScreenRouter,
    BaseRouter,
    {
        path: '*',
        redirect: '/404'
    }
]

export default routes
