import { IPosition, ISize, TStringMatrix } from "./general";

export interface IOptionImageSize {
  width?: number;
  height?: number;
}

export interface IImageOptions extends IPosition, IOptionImageSize { };

export interface IDrawImageArgs {
  position: IArgumentImagePosition,
  size?: TArgumentImageSize,
};

export interface IArgumentImagePosition extends IPosition { };

export interface IPixelPosition extends IPosition { };

export type TArgumentImageSize = IOptionImageSize | 'initial';

export interface IImageSize extends ISize { };

export type TRGBABuff = TByteRGBColor[];

export type TByteRGBColor = [number, number, number, number];

export type TBuff = TStringMatrix;

export type TQualityBuff = TStringMatrix;

export type TRangeCommit = IPixelPosition[][];

export type TFilterMethod = 'pixel';

export interface IFilterOptions {
  quality: number;
};
