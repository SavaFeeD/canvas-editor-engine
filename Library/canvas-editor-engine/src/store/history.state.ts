import { StateService } from "../services/store.service";
import ThroughHistoryService from "../services/through-history.service";
import { IHistoryLine, TReducerNames } from "../types/history";

export interface IHistoryState {
  historyLines: IHistoryLine[];
};

export class HistoryState implements StateService {
  private default: IHistoryState = {
    historyLines: [],
  }

  private _emergeCompleteIt: (history: IHistoryState['historyLines']) => void;
  
  private _historyLines: IHistoryState['historyLines'] = this.default.historyLines;

  get historyLines(): IHistoryState['historyLines'] { return this._historyLines; };

  constructor(
    private throughHistoryService: ThroughHistoryService,
  ) {
    this.reset();
  }

  reduce(name: TReducerNames, payload?: IHistoryLine | IHistoryState) {
    const reducer = new Reducer(this);

    switch(name) {
      case 'SET_HISTORY':
        reducer.setHistoryLines(payload as IHistoryState);
        this.throughHistoryService.clearCache();
        break;
      case 'UPDATE_HISTORY':
        reducer.updateHistoryLines(payload as IHistoryLine);
        this.throughHistoryService.clearCache();
        break;
      case 'REDO':
        reducer.updateHistoryLines(payload as IHistoryLine);
        break;
      case 'UNDO':
        reducer.popHistoryLines();
        break;
    }
  }

  emerge(completeIt: (history: IHistoryState['historyLines']) => void) {
    this._emergeCompleteIt = completeIt;
  }

  reset() {
    this.reduce('SET_HISTORY', this.default);
  }
}

class Reducer {
  constructor(private state: any) { };

  setHistoryLines(payload: IHistoryState) {
    let isUpdate = false;
    
    if (!!payload?.historyLines) {
      this.state._historyLines = payload.historyLines;
      isUpdate = true;
    }

    if (isUpdate && !!this.state._emergeCompleteIt) {
      this.state._emergeCompleteIt(this.state._historyLines);
    }
  }

  updateHistoryLines(payload: IHistoryLine) {
    let isUpdate = false;
    
    if (!!payload?.view) {
      this.state._historyLines.push(payload);
      isUpdate = true;
    }

    if (isUpdate && !!this.state._emergeCompleteIt) {
      this.state._emergeCompleteIt(this.state._historyLines);
    }
  }

  popHistoryLines() {
    this.state._historyLines.pop();

    if (!!this.state._emergeCompleteIt) {
      this.state._emergeCompleteIt(this.state._historyLines);
    }
  }
}