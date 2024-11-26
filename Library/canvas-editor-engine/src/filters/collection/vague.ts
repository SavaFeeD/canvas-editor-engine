import type {
  IFilterOptions,
  IImageOptions,
  IImageSize,
  IPixelPosition,
  TBuff,
  TFilterMethod,
  TQualityBuff,
  TRangeCommit
} from "../../types/image";

import { Filter } from "../../utils/filter";

import { Convert } from "../../utils/convert";
import { range } from 'lodash';


export default class VagueFilter extends Filter {
  options: IImageOptions;
  filterList: TFilterMethod[] = ['pixel'];

  constructor(ctx: CanvasRenderingContext2D, options: IImageOptions) {
    super(ctx);
    this.options = options;
  }

  public on(action: TFilterMethod, filterOptions: IFilterOptions) {
    return new Promise((resolve) => {
      const imageData = this.copy(this.options);
      const rowImageData = this[action](imageData, filterOptions);
      this.update(rowImageData, this.options);
      return resolve('complite');
    });
  }

  public pixel(imageData: ImageData, filterOptions: IFilterOptions) {
    const imageSize: IImageSize = {
      width: imageData.width,
      height: imageData.height,
    };
    this.setImageSize(imageSize);

    const { quality } = filterOptions;
    console.log('quality', quality);
    
    const { rowRGBABuff, buff } = this.getBuffCollection(imageData);
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
        imageData.data[index] = color;
      });
      console.log('imageData', imageData);
    }

    return imageData;
  }

  private getQualityBuff(buff: TBuff, quality: number) {
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
    const mostCommonQuanlityBuff: TBuff = [];

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