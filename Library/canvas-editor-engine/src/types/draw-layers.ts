import Painter from "../utils/painter";

export interface ILayer {
  id: string,
  painters: Painter[],
  order: number,
  name: string, 
};

export interface ILayerUpdate {
  painters?: ILayer['painters'],
  order?: ILayer['order'],
  name?: ILayer['name'],
};

export type TReducerNames = 'SET_LAYERS' | 'UPDATE_LAYER' | 'ADD_LAYER' | 'REMOVE_LAYER';

export interface IUpdateLayerOptions {
  to?: number;
  direction?: 'up' | 'down' | 'front' | 'back';
  addendum?: {
    operation: 'add' | 'subtract' | 'multiplication' | 'division';
    value: number
  };
};