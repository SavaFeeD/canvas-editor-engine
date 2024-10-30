export interface IImageOptions {
  x: number,
  y: number,
  width?: number,
  height?: number,
};

export interface IDrawImageArgs {
  position: IArgumentImagePosition,
  size?: TArgumentImageSize,
};

export interface IArgumentImagePosition {
  x: number,
  y: number,
};

export type TArgumentImageSize = IOptionImageSize | 'initial';

export interface IOptionImageSize {
  width?: number,
  height?: number
}

export interface IImageSize {
  w: number,
  h: number,
};

export interface IPixelPosition {
  x: number,
  y: number,
}

export type TRGBABuff = TByteRGBColor[];

export type TByteRGBColor = [number, number, number, number];

export type TBuff = string[][];

export type TQualityBuff = string[][];

export type TRangeCommit = IPixelPosition[][];

export type TFilterMethod = 'pixel';

export interface IFilterOptions {
  quality: number,
};
