import AppConfig from "../config";
import { VagueFilter } from "../filters";
import AppStore from "../store/store";
import { ISize } from "../types/general";
import type { IDrawImageArgs, IDrawImageProcessor, IFilterOptions, IImageLoggingDataVague, IImageOptions } from "../types/image";
import { Project } from "../types/project";
import { Filter } from "../utils/filter";
import EventService from "./event.service";


export default class DrawService {
  public static imageProcessor: IDrawImageProcessor;

  public static drawImage(ctx: CanvasRenderingContext2D, src: string, options: IDrawImageArgs) {
    DrawService.imageProcessor = new SCImage(src, ctx);
    DrawService.imageProcessor.draw(options).then(() => {
      const filter = new Filter(ctx);
      const zeroPosition = {
        x: 0,
        y: 0,
      };
      const imageData = filter.copy(zeroPosition);
      AppStore.store.imageState.reduce({
        tempImageData: imageData,
        position: zeroPosition,
        size: AppConfig.CANVAS_SIZE,
      }, "Loaded image");
    });
  }

  public static drawProject(ctx: CanvasRenderingContext2D, project: Project) {
    // const { imageData, position, size } = project.state.current;
    const imageData = project.state.current.imageData as ImageData;
    const position = project.state.current.position as IImageOptions;
    const size = project.state.current.size as ISize;

    DrawService.imageProcessor = new PCImage(project, ctx);
    DrawService.imageProcessor.draw();

    AppStore.store.imageState.reduce({
      tempImageData: imageData,
      position: position,
      size: size,
    }, "Loaded project");
  }

  public static drawSmoothImage(useStore: boolean, options: IDrawImageArgs, filterOptions: IFilterOptions) {
    const filterArgs: IImageOptions = DrawService.getFilterArgs(useStore, options);
    EventService.dispatch('loading-start');

    if (!DrawService.imageProcessor) {
      throw new Error('No valid ImageProcessor instance found');
    }
    
    DrawService.imageProcessor.vague(filterArgs, filterOptions)
      .then(DrawService.updateImageStateAfterVague)
      .finally(() => EventService.dispatch('loading-end'));
  }

  private static updateImageStateAfterVague(data: IImageLoggingDataVague) {
    const { imageData, position, size, quality } = data;
    AppStore.store.imageState.reduce({
      tempImageData: imageData,
      position: position,
      size: size,
    }, `[Filter Vague] quality: ${quality}`);
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

export class SCImage implements IDrawImageProcessor {
  private img: HTMLImageElement = new Image();
  private ctx: CanvasRenderingContext2D;

  constructor(src: string, ctx: CanvasRenderingContext2D) {
    this.img.src = src;
    this.ctx = ctx;
  };

  public draw(options?: IDrawImageArgs) {
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

class PCImage implements IDrawImageProcessor {
  private project: Project;
  private ctx: CanvasRenderingContext2D;

  constructor(project: Project, ctx: CanvasRenderingContext2D) {
    this.project = project;
    this.ctx = ctx;
  }

  public draw(options?: IDrawImageArgs) {
    const { imageData, position } = this.project.state.current;
    return new Promise((resolve, reject) => {
      try {
        const filter = new Filter(this.ctx);
        filter.update(imageData, position);
        this.ctx.save();
        resolve(this);
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