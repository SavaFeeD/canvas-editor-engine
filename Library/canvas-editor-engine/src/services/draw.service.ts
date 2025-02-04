import AppConfig from "../config";
import { VagueFilter } from "../filters";
import { IImageStateReduce } from "../store/image.state";
import AppStoreRepository from "../store/storeRepository";
import { TDrawType } from "../types/draw-service";
import { IPosition, ISize } from "../types/general";
import type { IDrawImageArgs, IDrawImageProcessor, IFilterOptions, IImageLoggingDataVague, IImageOptions } from "../types/image";
import { Project } from "../types/project";
import { Filter } from "../utils/filter";
import { TempCanvas } from "../utils/temp-canvas";
import EventService from "./event.service";

export default class DrawService {
  public id: string;
  public imageProcessor: IDrawImageProcessor;
  public options: {
    image: {
      src: string,
      drawImageArgs: IDrawImageArgs
    } | null,
    project: Project | null,
  } = {
    image: null,
    project: null,
  };
  public tempCanvas: TempCanvas = new TempCanvas();

  constructor(
    private appConfig: AppConfig,
    private appStoreRepository: AppStoreRepository,
    private eventService: EventService,
  ) {
    this.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  public bindOptions<DrawType extends TDrawType>(
    drawType: DrawType,
    options: DrawService['options'][DrawType]
  ) {
    this.options[drawType] = options;
  }

  public async drawImage() {
    const { src, drawImageArgs } = this.options.image;
    const ctx: CanvasRenderingContext2D = this.tempCanvas.ctx;
    this.imageProcessor = new ImageObject(this.appConfig, src, ctx);
    return await this.imageProcessor.draw(drawImageArgs).then(() => {
      const responseData = {
        reduceData: null as IImageStateReduce | null,
        message: null as string | null,
      };
      const zeroPosition: IPosition = {
        x: 0,
        y: 0,
      };
      const filter = new Filter(this.appConfig, ctx);
      const imageData = filter.copy(zeroPosition);
      responseData.reduceData = {
        tempImageData: imageData,
        position: zeroPosition,
        size: this.appConfig.CANVAS_SIZE,
      };
      responseData.message = "Image loaded";
      this.appStoreRepository.store.imageState.reduce(responseData.reduceData, responseData.message);
      return responseData;
    });
  }

  public async drawProject() {
    const project: Project = this.options.project;
    const ctx: CanvasRenderingContext2D = this.tempCanvas.ctx;
    const imageData: ImageData = project.state.current.imageData;
    const position: IImageOptions = project.state.current.position;
    const size: ISize = project.state.current.size;

    this.imageProcessor = new ProjectImageObject(this.appConfig, project, ctx);
    return new Promise((resolve) => {
      this.imageProcessor.draw();
      resolve(null);
    }).then(() => {
      const responseData = {
        reduceData: null as IImageStateReduce | null,
        message: null as string | null,
      };
      responseData.reduceData = {
        tempImageData: imageData,
        position: position,
        size: size,
      };
      responseData.message = "Project loaded";
      this.appStoreRepository.store.imageState.reduce(responseData.reduceData, responseData.message);
      return responseData;
    });
  }

  public async drawSmoothImage(useStore: boolean, options: IDrawImageArgs, filterOptions: IFilterOptions) {
    const filterArgs: IImageOptions = this.getFilterArgs(useStore, options);
    this.eventService.dispatch('loading-start');

    if (!this.imageProcessor) {
      throw new Error('No valid ImageProcessor instance found');
    }
    
    return this.imageProcessor.vague(filterArgs, filterOptions)
      .then((data) => {
        this.updateImageStateAfterVague(data);
        return data;
      })
      .finally(() => this.eventService.dispatch('loading-end'));
  }

  public updateImageStateAfterVague(data: IImageLoggingDataVague) {
    const { imageData, position, size, quality } = data;
    this.appStoreRepository.store.imageState.reduce({
      tempImageData: imageData,
      position: position,
      size: size,
    }, `[Filter Vague] quality: ${quality}`);
  }

  public getFilterArgs(useStore: boolean, options: IDrawImageArgs) {
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

export class ImageObject implements IDrawImageProcessor {
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

class ProjectImageObject implements IDrawImageProcessor {
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