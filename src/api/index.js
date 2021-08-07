import common from '@/api/modules/common'
import dataAccess from '@/api/modules/dataAccess'
import dataModel from '@/api/modules/dataModel'
import screenManage from '@/api/modules/screenManage'
import screenMaterial from '@/api/modules/screenMaterial'
import login from '@/api/modules/login'
import projectCenter from '@/api/modules/projectCenter'
import corporateDomain from '@/api/modules/corporateDomain'
import user from '@/api/modules/user'
import chooseScreen from './modules/chooseScreen'

const server = {
  user,
  screenManage,
  screenMaterial,
  login,
  common,
  dataAccess,
  dataModel,
  projectCenter,
  corporateDomain,
  chooseScreen
}

export default server
