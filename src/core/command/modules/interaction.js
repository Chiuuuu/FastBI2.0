import cloneDeep from 'lodash/cloneDeep';
import assignIn from 'lodash/assignIn';
import BaseCommand from './base';
export default class InteractionCommand extends BaseCommand {
  /**
   * Creates an instance of InteractionCommand.
   * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
   * @param {*} receiver
   * @param {object} interaction 数据
   * @param {object} store 整个store
   * @memberof InteractionCommand
   */
  constructor(receiver, { interaction, store, beforeExecute, afterExecute }) {
    super(receiver, { store, beforeExecute, afterExecute });
    this.oldInteraction = cloneDeep(this.receiver.setting.interaction);
    this.newInteraction = interaction;
  }
  executeFun() {
    this.receiver.setting.interaction = assignIn(this.receiver.setting.interaction, this.newInteraction);
    this.setCurCom();
  }
  undoFun() {
    this.receiver.setting.interaction = assignIn(this.receiver.setting.interaction, this.oldInteraction);
    this.setCurCom();
  }
}
