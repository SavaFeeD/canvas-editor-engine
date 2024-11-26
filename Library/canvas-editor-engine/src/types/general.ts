export type THEXColor = `#${string}`;

export type TComponent = HTMLElement | HTMLDivElement | HTMLCanvasElement;

export interface IWrapOptions {
  tag?: string,
  className?: string,
  id?: string,
};

export interface ITool {
  id: number,
  name: string,
  onAction?: (...args: any) => void,
  offAction?: (...args: any) => void,
  support?: (...args: any) => void,
};

export type IGUID4 = `${number}-${number}-${number}-${number}`;

export interface IPosition {
  x: number;
  y: number;
};

export interface ISize {
  width: number;
  height: number;
}

export type TStringMatrix = string[][];
