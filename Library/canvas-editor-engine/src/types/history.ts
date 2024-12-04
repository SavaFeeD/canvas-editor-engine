import { IPosition, ISize } from "./general";

export interface IHistoryLine {
  stateName: string;
  stateValue: any;
  view: string; 
}

export type TReducerNames = 'SET_HISTORY' | 'UPDATE_HISTORY' | 'UNDO' | 'REDO';