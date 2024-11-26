import AppConfig from "../config";
import { VagueFilter } from "../filters";
import AppStore from "../store/store";
import type { IDrawImageArgs, IFilterOptions, IImageOptions } from "../types/image";
import EventService from "./event.service";


export default class DrawService {
  public static scImage: SCImage;

  public static drawImage(ctx: CanvasRenderingContext2D, src: string, options: IDrawImageArgs) {
    DrawService.scImage = new SCImage(src, ctx);
    DrawService.scImage.draw(options);
  }

  public static drawSmoothImage(useStore: boolean, options: IDrawImageArgs, filterOptions: IFilterOptions) {
    const filterArgs: IImageOptions = DrawService.getFilterArgs(useStore, options);
    EventService.dispatch('loading-start');
    this.scImage.vague(filterArgs, filterOptions).finally(() => {
      EventService.dispatch('loading-end');
    });
  }

  private static getFilterArgs(useStore: boolean, options: IDrawImageArgs) {
    let filterArgs: IImageOptions;
    const store = AppStore.store.imageState;

    if (useStore) {
      filterArgs = {
        x: store.position.x,
        y: store.position.y,
      };
      if (!!store.size.width && !!store.size.height) {
        filterArgs.width = store.size.width;
        filterArgs.height = store.size.height;
      }
    } else {
      filterArgs = {
        x: options.position.x,
        y: options.position.y,
      };
      if (options.size !== 'initial') {
        if (!!options.size?.width && !!options.size?.height) {
          filterArgs.width = options.size.width;
          filterArgs.height = options.size.height;
        }
      }
    }

    return filterArgs;
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
      } catch (error) {
        reject(error);
      }
    });
  }

  public vague(options: IImageOptions, filterOptions: IFilterOptions) {
    const filter = new VagueFilter(this.ctx, options);
    return filter.on('pixel', filterOptions);
  }
}