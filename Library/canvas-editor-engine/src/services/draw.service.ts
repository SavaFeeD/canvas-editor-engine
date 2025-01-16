import AppConfig from "../config";
import { VagueFilter } from "../filters";
import { IImageStateReduce } from "../store/image.state";
import AppStoreRepository from "../store/storeRepository";
import { ILayer } from "../types/draw-layers";
import { IPainter, TDrawType } from "../types/draw-service";
import { IPosition, ISize } from "../types/general";
import type { IDrawImageArgs, IDrawImageProcessor, IFilterOptions, IImageLoggingDataVague, IImageOptions } from "../types/image";
import { Project } from "../types/project";
import { Filter } from "../utils/filter";
import DrawLayersService from "./draw-leayers.service";
import EventService from "./event.service";


export class DrawAccumulator {
  public painters: IPainter[] = new Proxy([], {
    get(target, name) {
      return target[name];
    },
    set(target, name, value) {
      try {
        if (typeof value?.object !== 'undefined') {
          target[name] = value.object;
          value.update();
          return true;
        } else {
          if (name != 'length') {
            console.warn('Proxy set error: object denied');
            return false;
          } else {
            const MIN_LENGTH = -1;
            const MAX_LENGTH = [...Object.keys( target )] as unknown as number[];
            if ( value <= Math.max(MIN_LENGTH, ...MAX_LENGTH) + 1 ) {
              target.length = value;
            }
          }
          return true;
        }
      } catch (error) {
        console.error('Proxy set error:', error);
        return false;
      }
    },
  });

  constructor(
    private appConfig: AppConfig,
    private appStoreRepository: AppStoreRepository,
    private eventService: EventService,
    private drawLayersService: DrawLayersService,
  ) {}

  public async add<DrawType extends TDrawType>(
    layerId: ILayer['id'],
    drawType: DrawType,
    options: DrawService['options'][DrawType]
  ) {
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const painter: IPainter = {
      drawService: new DrawService(this.appConfig, this.appStoreRepository, this.eventService),
      drawType,
      id,
    };
    painter.drawService.bindOptions(drawType, options);
    this.painters.push({
      object: painter,
      update: this.update.bind(this),
    } as unknown as IPainter);
    this.drawLayersService.addToLayer(layerId, painter);
    const inStore = true;
    this.invokePainter(drawType, painter.drawService, inStore);
  }

  public async remove(id: string) {
    const painter = this.painters.find(painter => painter.id === id);
    if (!!painter) {
      this.painters = this.painters.filter(painter => painter.id !== id);
    }
  }

  private update() {
    this.clearCanvas();
    this.invokePaintersOnLayers();
  }

  private get gradient() {
    const gradient = [];
    this.painters.forEach((painter) => {
      const layer = this.drawLayersService.layerList.find((layer) => layer.painters.includes(painter));
      if (layer) {
        gradient.push(layer.order);
      }
    });
    return gradient.sort((a, b) => a - b);
  }
  
  private clearCanvas() {
    const ctx = this.appConfig.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.appConfig.CANVAS_SIZE.width, this.appConfig.CANVAS_SIZE.height);
  }

  private invokePaintersOnLayers() {
    const stash = [];
    this.gradient.forEach((order) => {
      this.painters.forEach((painter) => {
        const layer = this.drawLayersService.layerList.find((layer) => layer.painters.includes(painter));
        if (!layer) return;
        if (!stash.includes(painter) && layer.order === order) {
          this.invokePainter(painter.drawType, painter.drawService);
          stash.push(painter);
        }
      });
    });
  }

  private async invokePainter(drawType: TDrawType, painter: DrawService, inStore: boolean = false) {
    if (drawType === 'image') {
      const { reduceData, message } = await painter.drawImage(inStore);
      const isAddToStore = !!reduceData && !!message && inStore;
      if (isAddToStore) {
        this.appStoreRepository.store.imageState.reduce(reduceData, message);
      }
    } else if (drawType === 'project') {
      const { reduceData, message } = await painter.drawProject(inStore);
      const isAddToStore = !!reduceData && !!message && inStore;
      if (isAddToStore) {
        this.appStoreRepository.store.imageState.reduce(reduceData, message);
      }
    }
  }
}

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

  public async drawImage(isReturnReduceData: boolean = false) {
    const { src, drawImageArgs } = this.options.image;
    const ctx: CanvasRenderingContext2D = this.appConfig.canvas.getContext('2d');
    this.imageProcessor = new ImageObject(this.appConfig, src, ctx);
    return await this.imageProcessor.draw(drawImageArgs).then(() => {
      // this.appStoreRepository.store.imageState.reduce({
      //   tempImageData: imageData,
      //   position: zeroPosition,
      //   size: this.appConfig.CANVAS_SIZE,
      // }, "Loaded image");
      const responseData = {
        reduceData: null as IImageStateReduce | null,
        message: null as string | null,
      };
      if (!isReturnReduceData) return responseData;
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
      return responseData;
    });
  }

  public async drawProject(isReturnReduceData: boolean = false) {
    const project: Project = this.options.project;
    const ctx: CanvasRenderingContext2D = this.appConfig.canvas.getContext('2d');
    const imageData: ImageData = project.state.current.imageData;
    const position: IImageOptions = project.state.current.position;
    const size: ISize = project.state.current.size;

    this.imageProcessor = new ProjectImageObject(this.appConfig, project, ctx);
    return new Promise((resolve) => {
      this.imageProcessor.draw();
      resolve(null);
    }).then(() => {
      // this.appStoreRepository.store.imageState.reduce({
      //   tempImageData: imageData,
      //   position: position,
      //   size: size,
      // }, "Loaded project");

      const responseData = {
        reduceData: null as IImageStateReduce | null,
        message: null as string | null,
      };

      if (!isReturnReduceData) return responseData;

      responseData.reduceData = {
        tempImageData: imageData,
        position: position,
        size: size,
      };
      responseData.message = "Project loaded";
      return responseData;
    });
  }

  public drawSmoothImage(useStore: boolean, options: IDrawImageArgs, filterOptions: IFilterOptions) {
    const filterArgs: IImageOptions = this.getFilterArgs(useStore, options);
    this.eventService.dispatch('loading-start');

    if (!this.imageProcessor) {
      throw new Error('No valid ImageProcessor instance found');
    }
    
    this.imageProcessor.vague(filterArgs, filterOptions)
      .then((data) => this.updateImageStateAfterVague(data))
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