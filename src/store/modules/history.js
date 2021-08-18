import {
  AddCommand,
  DeleCommand,
  StyleCommand,
  DragMoveCommand,
  DataCommand,
  DataPanelCommand,
  PositionCommand,
  InteractionCommand,
} from '../../core/command';

export const mutationTypes = {
  COMMAND: 'history/COMMAND',
  UNDO: 'history/UNDO',
  REDO: 'history/REDO',
};

const Commands = {
  Add: AddCommand,
  Dele: DeleCommand,
  Style: StyleCommand,
  DragMove: DragMoveCommand,
  Data: DataCommand,
  DatePanel: DataPanelCommand,
  Position: PositionCommand,
  Interaction: InteractionCommand,
};

const state = {
  historyRecordList: [],
  historyRecordIndex: -1,
};

const mutations = {
  COMMAND(state, payload) {
    if (state.historyRecordIndex < state.historyRecordList.length) {
      state.historyRecordList = state.historyRecordList.slice(0, state.historyRecordIndex + 1);
    }
    const { commandType, target, ...rest } = payload;
    if (typeof commandType === 'undefined') {
      return console.error(`command type is must,but got undefined`);
    }
    if (typeof target === 'undefined') {
      return console.error(`target is must,but got undefined`);
    }
    const command = new Commands[commandType](target, rest);
    if (command) {
      state.historyRecordList.push(command);
      state.historyRecordIndex++;
      command.execute();
    }
  },
  UNDO(state) {
    if (state.historyRecordIndex > -1) {
      state.historyRecordList[state.historyRecordIndex].undo();
      state.historyRecordIndex--;
    }
  },
  REDO(state) {
    if (state.historyRecordIndex < state.historyRecordList.length - 1) {
      state.historyRecordIndex++;
      state.historyRecordList[state.historyRecordIndex].execute();
    }
  },
};

const actions = {};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
