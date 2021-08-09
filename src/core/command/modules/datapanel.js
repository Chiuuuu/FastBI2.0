import { arrayAddData, arrayDeleData } from '@/utils';
export default class DataPanelCommand {
  constructor(receiver, { item, index, action }) {
    this.receiver = receiver;
    this.item = item;
    this.index = index;
    this.action = action;
  }
  hocMoveData(addFun, deleFun) {
    if (!Array.isArray(this.receiver)) {
      return console.error(`The receiver of this method is an array`);
    }
    return () => {
      this.receiver.forEach(rec => {
        if (!rec.hasOwnProperty('method') || !rec.hasOwnProperty('list')) {
          console.error(`There must be a 'method' and a 'list' property to indicate the operation`);
        }
        if (rec.method === 'add') {
          addFun(rec.list, this.item, this.index);
        } else if (rec.method === 'dele') {
          deleFun(rec.list, this.item, this.index);
        }
      });
    };
  }
  execute() {
    const actionTypes = ['add', 'dele', 'move'];
    if (!actionTypes.includes(this.action)) {
      return console.error(`${this.action} is illegal, can only be the following way: ${actionTypes}`);
    }

    const fun = {
      add: arrayAddData,
      dele: arrayDeleData,
      move: this.hocMoveData(arrayAddData, arrayDeleData),
    };

    fun[this.action](this.receiver, this.item, this.index);
  }
  undo() {
    const fun = {
      add: arrayDeleData,
      dele: arrayAddData,
      move: this.hocMoveData(arrayDeleData, arrayAddData),
    };

    fun[this.action](this.receiver, this.item, this.index);
  }
}
