import { IPainter } from "./draw-service";

export interface ILayer {
  id: string,
  painters: IPainter[],
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
  direction?: 'up' | 'down';
  addendum?: {
    operation: 'add' | 'subtract' | 'multiplication' | 'division';
    value: number
  };
};