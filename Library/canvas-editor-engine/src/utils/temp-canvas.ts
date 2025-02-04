import { ITempCanvasOptions } from "../types/temp-canvas";

export class TempCanvas {
  public ctx: CanvasRenderingContext2D;
  public canvas: HTMLCanvasElement;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  public bindOptions(options: ITempCanvasOptions) {
    this.canvas.width = options.width;
    this.canvas.height = options.height;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  public destroy() {
    this.canvas.remove();
  }

  public getImageData() {
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }
}