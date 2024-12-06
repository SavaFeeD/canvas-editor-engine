import { IImageState } from "../store/image.state";
import { IPosition, ISize } from "./general";

export interface IHistoryLine {
  stateName: string;
  stateValue: IImageState;
  view: string; 
}

export type TReducerNames = 'SET_HISTORY' | 'UPDATE_HISTORY' | 'UNDO' | 'REDO';