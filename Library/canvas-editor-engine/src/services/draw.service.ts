import AppConfig from "../config";
import { VagueFilter } from "../filters";
import AppStoreRepository from "../store/storeRepository";
import { ISize } from "../types/general";
import type { IDrawImageArgs, IDrawImageProcessor, IFilterOptions, IImageLoggingDataVague, IImageOptions } from "../types/image";
import { Project } from "../types/project";
import { Filter } from "../utils/filter";
import EventService from "./event.service";


export default class DrawService {
  public imageProcessor: IDrawImageProcessor;

  constructor(
    private appConfig: AppConfig,
    private appStoreRepository: AppStoreRepository,
    private eventService: EventService,
  ) {};

  public drawImage(ctx: CanvasRenderingContext2D, src: string, options: IDrawImageArgs) {
    this.imageProcessor = new SCImage(this.appConfig, src, ctx);
    this.imageProcessor.draw(options).then(() => {
      const filter = new Filter(this.appConfig, ctx);
      const zeroPosition = {
        x: 0,
        y: 0,
      };
      const imageData = filter.copy(zeroPosition);
      this.appStoreRepository.store.imageState.reduce({
        tempImageData: imageData,
        position: zeroPosition,
        size: this.appConfig.CANVAS_SIZE,
      }, "Loaded image");
    });
  }

  public drawProject(ctx: CanvasRenderingContext2D, project: Project) {
    // const { imageData, position, size } = project.state.current;
    const imageData = project.state.current.imageData as ImageData;
    const position = project.state.current.position as IImageOptions;
    const size = project.state.current.size as ISize;

    this.imageProcessor = new PCImage(this.appConfig, project, ctx);
    this.imageProcessor.draw();

    this.appStoreRepository.store.imageState.reduce({
      tempImageData: imageData,
      position: position,
      size: size,
    }, "Loaded project");
  }

  public drawSmoothImage(useStore: boolean, options: IDrawImageArgs, filterOptions: IFilterOptions) {
    const filterArgs: IImageOptions = this.getFilterArgs(useStore, options);
    this.eventService.dispatch('loading-start');

    if (!this.imageProcessor) {
      throw new Error('No valid ImageProcessor instance found');
    }
    
    this.imageProcessor.vague(filterArgs, filterOptions)
      .then(this.updateImageStateAfterVague)
      .finally(() => this.eventService.dispatch('loading-end'));
  }

  private updateImageStateAfterVague(data: IImageLoggingDataVague) {
    const { imageData, position, size, quality } = data;
    this.appStoreRepository.store.imageState.reduce({
      tempImageData: imageData,
      position: position,
      size: size,
    }, `[Filter Vague] quality: ${quality}`);
  }

  private getFilterArgs(useStore: boolean, options: IDrawImageArgs) {
    let filterArgs: IImageOptions;
    const store = this.appStoreRepository.store.imageState;

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

  constructor(
    private appConfig: AppConfig,
    src: string,
    ctx: CanvasRenderingContext2D
  ) {
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
              drawImageArgs = drawImageArgs.concat([this.appConfig.CANVAS_SIZE.width, this.appConfig.CANVAS_SIZE.height]);
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
    const filter = new VagueFilter(this.appConfig, this.ctx, options);
    return filter.on('pixel', filterOptions);
  }
}

class PCImage implements IDrawImageProcessor {
  private project: Project;
  private ctx: CanvasRenderingContext2D;

  constructor(
    private appConfig: AppConfig,
    project: Project,
    ctx: CanvasRenderingContext2D
  ) {
    this.project = project;
    this.ctx = ctx;
  }

  public draw(options?: IDrawImageArgs) {
    const { imageData, position } = this.project.state.current;
    return new Promise((resolve, reject) => {
      try {
        const filter = new Filter(this.appConfig, this.ctx);
        filter.update(imageData, position);
        this.ctx.save();
        resolve(this);
      } catch (error) {
        reject(error);
      }
    });
  }

  public vague(options: IImageOptions, filterOptions: IFilterOptions) {
    const filter = new VagueFilter(this.appConfig, this.ctx, options);
    return filter.on('pixel', filterOptions);
  }
}