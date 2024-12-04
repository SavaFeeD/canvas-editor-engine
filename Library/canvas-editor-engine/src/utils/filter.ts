import AppConfig from "../config";
import { E_RGBA, IExtendedImageDataModel, type IImageOptions, type IImageSize, type TBuff, type TRGBABuff } from "../types/image";
import type { ISize, THEXColor } from '../types/general';

import { Convert } from "./convert";
import { range } from 'lodash';

export class Filter {
  public ctx: CanvasRenderingContext2D;
  public imageSize: IImageSize;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setImageSize(size: IImageSize) {
    this.imageSize = size;
  }

  public copy(options: IImageOptions): ImageData {
    const width = (options?.width) ? options.width : AppConfig.CANVAS_SIZE.width;
    const height = (options?.height) ? options.height : AppConfig.CANVAS_SIZE.height;
    
    const imgData: ImageData = this.ctx.getImageData(options.x, options.y, width, height);
    
    return imgData;
  }

  public copyExtendedModel(options: IImageOptions): IExtendedImageDataModel {
    const width = (options?.width) ? options.width : AppConfig.CANVAS_SIZE.width;
    const height = (options?.height) ? options.height : AppConfig.CANVAS_SIZE.height;
    
    const imgData: ImageData = this.ctx.getImageData(options.x, options.y, width, height);
    const extendedImageData = this.clearEmptyPixels(imgData);
    
    return extendedImageData;
  }

  public update(imgData: ImageData, options: IImageOptions) {
    this.ctx.clearRect(0, 0, AppConfig.CANVAS_SIZE.width, AppConfig.CANVAS_SIZE.height);
    this.ctx.putImageData(imgData, options.x, options.y);
  }

  public clearEmptyPixels(imageData: ImageData): IExtendedImageDataModel {
    const rowRGBABuff: TRGBABuff = this.getRowRGBABuff(imageData);
    const RGBAMatrix = this.getRGBAMatrix(rowRGBABuff, { width: imageData.width, height: imageData.height });

    const beforeSize = {
      width: imageData.width,
      height: imageData.height,
    };
    const tempSize = this.getSizeOfSparseMatrix(RGBAMatrix, beforeSize);

    const cleared = rowRGBABuff.filter((byteArray) => {
      const alpha = byteArray[E_RGBA.a];
      return !!alpha;
    });

    const clearedBuff = cleared.flat();

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const tempImageData = tempCtx.createImageData(tempSize.width, tempSize.height);

    clearedBuff.forEach((_, i) => tempImageData.data[i] = clearedBuff[i]);

    console.log('cleared', cleared);
    return {
      imageData: tempImageData,
      size: tempSize
    };
  }

  public getSizeOfSparseMatrix(RGBAMatrix: TBuff<number[]>, tempSize: ISize) {
    // case 1: Xcanvas -> Ximage && case 3: Ycanvas -> Yimage
    let leftIndex: number | undefined;
    let upIndex: number | undefined;
    for (const [iy, row] of RGBAMatrix.entries()) {
      for (const [ix, rowItem] of row.entries()) {
        const isNotEmpty = rowItem[E_RGBA.a] !== 0;
        if (isNotEmpty) {
          leftIndex = ix;
          upIndex = iy;
          break;
        }
      }
      if (leftIndex !== undefined && upIndex !== undefined) {
        break;
      }
    }
    console.log('case 1: Xcanvas -> Ximage; leftIndex:', leftIndex);
    console.log('case 3: Ycanvas -> Yimage; upIndex:', upIndex);
    
    // case 2: Ximage <- Xcanvas && case 4: Yimage <- Ycanvas
    let rightIndex: number | undefined;
    let downIndex: number | undefined;
    for (const [iy, row] of RGBAMatrix.reverse().entries()) {
      for (const [ix, rowItem] of row.reverse().entries()) {
        const isNotEmpty = rowItem[E_RGBA.a] !== 0;
        if (isNotEmpty) {
          rightIndex = ix;
          downIndex = iy;
          break;
        }
      }
      if (rightIndex !== undefined && downIndex !== undefined) {
        break;
      }
    }
    console.log('case 2: Ximage <- Xcanvas; rightIndex:', rightIndex);
    console.log('case 4: Yimage <- Ycanvas; downIndex:', downIndex);

    const reduceWidth = (tempWidth: ISize['width']) => tempWidth - (leftIndex + rightIndex);
    const reduceHeight = (tempHeight: ISize['height']) => tempHeight - (upIndex + downIndex);
    
    const resultSize: ISize = {
      width: reduceWidth(tempSize.width),
      height: reduceHeight(tempSize.height),
    };

    return resultSize;
  }

  public getBuffCollection(imageData: ImageData) {
    
    const rowRGBABuff: TRGBABuff = this.getRowRGBABuff(imageData);

    const hexBuff: THEXColor[] = rowRGBABuff.map(Convert.byteRGBToHEX);
  
    const buff: TBuff<string> = this.getBuff(hexBuff);

    return { rowRGBABuff, hexBuff, buff };
  }


  private getBuff(hexBuff: THEXColor[]): TBuff<string> {
    const distanceRow: number[] = range(0, this.imageSize.height).map((i) => this.imageSize.width * i);

    const buff: TBuff<string> = [];
    let indexOfDistance = 0;
    hexBuff.forEach((pxColor, pxIndex) => {
      if (pxIndex >= distanceRow[indexOfDistance+1]) {
        indexOfDistance++;
      }
      buff[indexOfDistance] ??= []; 
      buff[indexOfDistance].push(pxColor);
    });
    return buff;
  }

  private getRGBAMatrix(RGBABuff: TRGBABuff, size?: ISize): TBuff<number[]> {
    const maybeSize: ISize = {
      width: size.width || this.imageSize.width,
      height: size.height || this.imageSize.height,
    };
    const distanceRow: number[] = range(0, maybeSize.height).map((i) => maybeSize.width * i);

    const buff: TBuff<number[]> = [];
    let indexOfDistance = 0;
    RGBABuff.forEach((pxRGBA, pxIndex) => {
      if (pxIndex >= distanceRow[indexOfDistance+1]) {
        indexOfDistance++;
      }
      buff[indexOfDistance] ??= [];
      buff[indexOfDistance].push(pxRGBA);
    });
    return buff;
  }

  private getRowRGBABuff(imageData: ImageData): TRGBABuff {
    const rowRGBABuff: TRGBABuff = []; // [ [0, 0, 0, 0], [0, 0, 0, 0], ... ]

    let colorIndx: number = 0;
    let colorRGBAIndx: number = 0;

    imageData.data.forEach((pxColor: number) => {
      if (colorIndx >= 4) {
        colorIndx = 0;
        colorRGBAIndx++;
      }
      colorIndx++;
      // @ts-ignore
      rowRGBABuff[colorRGBAIndx] ??= [];
      rowRGBABuff[colorRGBAIndx].push(pxColor);
    });

    return rowRGBABuff;
  }
}