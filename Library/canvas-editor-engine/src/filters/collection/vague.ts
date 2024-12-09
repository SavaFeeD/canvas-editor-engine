import type {
  IFilterOptions,
  IImageLoggingDataVague,
  IImageOptions,
  IImageSize,
  IPixelPosition,
  TBuff,
  TFilterMethod,
  TQualityBuff,
  TRangeCommit,
  TRGBABuff
} from "../../types/image";

import { Filter } from "../../utils/filter";

import { Convert } from "../../utils/convert";
import { range } from '../../utils/generation';
import { ISize } from "../../types/general";


export default class VagueFilter extends Filter {
  options: IImageOptions;
  filterList: TFilterMethod[] = ['pixel'];

  constructor(ctx: CanvasRenderingContext2D, options: IImageOptions) {
    super(ctx);
    this.options = options;
  }

  public on(action: TFilterMethod, filterOptions: IFilterOptions): Promise<IImageLoggingDataVague> {
    return new Promise((resolve) => {
      const options = this.options;
      const imageData = this.copy(options);
      // TODO: rewrite on pattern Strategies
      const rowImageData = this[action](imageData, filterOptions);
      this.update(rowImageData, options);
      return resolve({
        imageData: rowImageData,
        position: {
          x: options.x,
          y: options.y,
        },
        size: {
          width: rowImageData.width,
          height: rowImageData.height,
        },
        quality: filterOptions.quality,
      });
    });
  }

  public pixel(imageData: ImageData, filterOptions: IFilterOptions) {
    const { quality } = filterOptions;
    console.log('quality', quality);

    // expansion strategy
    const processedImageData = this.getQualityProcessedRemainder(imageData, +quality);

    // TODO: add compression strategy and use register strategies;

    const imageSize: IImageSize = {
      width: processedImageData.width,
      height: processedImageData.height,
    };
    console.log('imageSize', imageSize);
    this.setImageSize(imageSize);
    
    const { rowRGBABuff, buff } = this.getBuffCollection(processedImageData);
    const { qualityBuff, rangeCommit } = this.getQualityBuff(buff, +quality);

    const qualityBuffWithMostCommonElement = this.getMostCommonQuanlityBuff(qualityBuff, rangeCommit);
    const rowQualityBuffWithMostCommonElement = qualityBuffWithMostCommonElement.flat();

    if (rowRGBABuff.length >= rowQualityBuffWithMostCommonElement.length) {
      const occurrenceRGBAbuff = rowQualityBuffWithMostCommonElement.map((hexColor, index) => {
        const { r, g, b } = Convert.hexToRgb(hexColor);
        const a = rowRGBABuff[index][3];
        return [r, g, b, a];
      });

      const rowBuff = occurrenceRGBAbuff.flat();

      rowBuff.forEach((color, index) => {
        processedImageData.data[index] = color;
      });
    }

    return processedImageData;
  }

  private getQualityProcessedRemainder(imageData: ImageData, quality: number) {
    const rowRGBABuff: TRGBABuff = this.getRowRGBABuff(imageData);
    const RGBAMatrix = this.getRGBAMatrix(rowRGBABuff, { width: imageData.width, height: imageData.height });

    const cqx = quality - (imageData.width % quality);
    const cqy = quality - (imageData.height % quality);

    const xCommit = range(0, cqx);
    const yCommit = range(0, cqy);

    const tempSize: ISize = {
      width: imageData.width + cqx,
      height: imageData.height + cqy,
    };

    const xLastIndex = RGBAMatrix[0].length - 1;
    RGBAMatrix.forEach((row, y) => {
      const xLastRGBAByte = row[xLastIndex];
      xCommit.forEach(() => RGBAMatrix[y].push(xLastRGBAByte));
    });

    const yLastIndex = RGBAMatrix.length - 1;
    const yLastRGBARow = RGBAMatrix[yLastIndex];
    yCommit.forEach(() => RGBAMatrix.push(yLastRGBARow));

    const buffWithRemainder = RGBAMatrix.flat(2);

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const tempImageData = tempCtx.createImageData(tempSize.width, tempSize.height);

    buffWithRemainder.forEach((_, i) => tempImageData.data[i] = buffWithRemainder[i]);
    return tempImageData;
  }

  private getQualityBuff(buff: TBuff<string>, quality: number) {
    const wq: number = Math.floor(this.imageSize.width / quality);
    const hq: number = Math.floor(this.imageSize.height / quality);

    const qualityBuff: TQualityBuff = [];
    const rangeCommit: TRangeCommit = [];

    let i = 0;
    let xStart = 0;
    let xEnd = quality;
    let yStart = 0;
    let yEnd = quality;

    range(0, hq).forEach((hqi) => {

      range(0, wq).forEach((wqi) => {
        const dy = range(yStart, yEnd);
        const dx = range(xStart, xEnd);
        
        const items: string[] = [];
        const coords: IPixelPosition[] = [];
        
        dy.forEach((y) => {
          dx.forEach((x) => {
            items.push(buff[y][x]);
            coords.push({y, x});
          });
        });

        xStart += quality;
        xEnd += quality;
        rangeCommit[i] ??= coords;
        qualityBuff[i] ??= items;
        i++;
      });

      xStart = 0;
      xEnd = quality;
      yStart += quality;
      yEnd += quality;
    });

    return { qualityBuff, rangeCommit };
  }

  private getMostCommonQuanlityBuff(qualityBuff: TQualityBuff, rangeCommit: TRangeCommit) {
    const mostCommonQuanlityBuff: TBuff<string> = [];

    const qualityBuffWithMostCommonElement = qualityBuff.map((newPixel) => {
      const color = this.getMostCommonElement(newPixel);
      return newPixel.map(() => color);
    });

    qualityBuffWithMostCommonElement.forEach((qPixel, pixelIndex) => {
      qPixel.forEach((pixelColor, pixelColorIndex) => {
        const { x, y } = rangeCommit[pixelIndex][pixelColorIndex];
        mostCommonQuanlityBuff[y] ??= [];
        mostCommonQuanlityBuff[y][x] ??= pixelColor;
      });
    });

    return mostCommonQuanlityBuff;
  }

  private getMostCommonElement<T>(array: T[]): T {
    function mostCommon(a: T, b: T) {
      const diffA = array.filter((v) => v === a).length;
      const diffB = array.filter((v) => v === b).length;
      return diffA - diffB;
    }
    const arraySorted = array.sort(mostCommon);
    const mostCommonElement = arraySorted[arraySorted.length-1];
    return mostCommonElement;
  }
}