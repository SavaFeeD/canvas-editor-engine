import AppConfig from "../config";
import type { IImageOptions, IImageSize, TBuff, TRGBABuff } from "../types/image";
import type { THEXColor } from '../types/general';

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

  public update(imgData: ImageData, options: IImageOptions) {
    this.ctx.clearRect(0, 0, AppConfig.CANVAS_SIZE.width, AppConfig.CANVAS_SIZE.height);
    this.ctx.putImageData(imgData, options.x, options.y);
  }

  public getBuffCollection(imageData: ImageData) {
    
    const rowRGBABuff: TRGBABuff = this.getRowRGBABuff(imageData);

    const hexBuff: THEXColor[] = rowRGBABuff.map(Convert.byteRGBToHEX);
  
    const buff: TBuff = this.getBuff(hexBuff);

    return { rowRGBABuff, hexBuff, buff };
  }


  private getBuff(hexBuff: THEXColor[]): TBuff {
    const distanceRow: number[] = range(0, this.imageSize.height).map((i) => this.imageSize.width * i);

    const buff: TBuff = [];
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