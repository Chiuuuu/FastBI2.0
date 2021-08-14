import Vue from 'vue';
import Vuex from 'vuex';
import app from './modules/app';
import common from './modules/common';
import getters from './getters';
import dataAccess from './modules/dataAccess';
import dataModel from './modules/dataModel';
import user from './modules/user';
import permission from './modules/permission';
import projectRoles from './modules/projectCenter/roles';
import projectPermissions from './modules/projectCenter/permissions';
import board from './modules/board';
import history from './modules/history';
import dragdrop from './modules/dragdrop';
import screen from './modules/screen';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    app,
    common,
    dataAccess,
    dataModel,
    screen,
    user,
    permission,
    projectRoles,
    projectPermissions,
    board,
    dragdrop,
    history,
  },
  getters,
});
