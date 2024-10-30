import AppConfig from "../config";
import { VagueFilter } from "../filters";
import type { IDrawImageArgs, IFilterOptions, IImageOptions } from "../types/image";


export default class DrawService {
  public static drawImage(ctx: CanvasRenderingContext2D, src: string, options: IDrawImageArgs) {
    const img = new SCImage(src, ctx);
    img.draw(options);
  }

  public static drawSmoothImage(ctx: CanvasRenderingContext2D, src: string, options: IDrawImageArgs, filterOptions: IFilterOptions) {
    const img = new SCImage(src, ctx);
    const filterArgs: IImageOptions = {
      x: options.position.x,
      y: options.position.y,
    };
    if (options.size !== 'initial') {
      if (!!options.size?.width && !!options.size?.height) {
        filterArgs.width = options.size.width;
        filterArgs.height = options.size.height;
      }
    }
    console.log('filterArgs', filterArgs);
    img.draw(options).then(() => img.vague(filterArgs, filterOptions));
  }
}

export class SCImage {
  private img: HTMLImageElement = new Image();
  private ctx: CanvasRenderingContext2D;

  constructor(src: string, ctx: CanvasRenderingContext2D) {
    this.img.src = src;
    this.ctx = ctx;
  };

  public get(): HTMLImageElement {
    return this.img;
  }

  public draw(options: IDrawImageArgs) {
    const proto = this;
    const protoImg = this.img;

    return new Promise((resolve, reject) => {
      try {
        protoImg.addEventListener("load", () => {
          let drawImageArgs: number[] = [options.position.x, options.position.y];
          if (options.size !== 'initial') {
            if (!!options.size?.width && !!options.size?.height) {
              drawImageArgs = drawImageArgs.concat([options.size.width, options.size.height]);
            } else {
              drawImageArgs = drawImageArgs.concat([AppConfig.CANVAS_SIZE.width, AppConfig.CANVAS_SIZE.height]);
            }
          }
          // @ts-ignore
          this.ctx.drawImage(protoImg, ...drawImageArgs);
          this.ctx.save();
          resolve(proto);
        });
      } catch(error) {
        reject(error);
      }
    });
  }

  public vague(options: IImageOptions, filterOptions: IFilterOptions) {
    const filter = new VagueFilter(this.ctx, options);
    filter.on('pixel', filterOptions);
  }
}