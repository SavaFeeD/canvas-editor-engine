export interface IExcretionsCoords {
  start?: {
    x: number,
    y: number,
  },
  end?: {
    x: number,
    y: number,
  },
};

export interface IExcretionTempStart {
  start: {
    x: number,
    y: number,
  },
};

export interface IExcretionTempEnd {
  end: {
    x: number,
    y: number,
  },
};

export type TExcretionTempCoords = (IExcretionTempStart | IExcretionTempEnd)[];

export type TExcretionToolState = 'taken' | 'abandoned';
export type TExcretionState = 'create' | 'add' | 'remove' | 'abandoned';
export type TExcretionActivity = 'active' | 'end' | 'abandoned';