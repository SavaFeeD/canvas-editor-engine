import AppConfig from "../config";
import AppStoreRepository from "../store/storeRepository";
import { ILayer, ILayerUpdate, IUpdateLayerOptions } from "../types/draw-layers";
import { IPainter, ISmoothFilterOptions, TDrawType } from "../types/draw-service";
import { ITempCanvasOptions } from "../types/temp-canvas";
import Painter from "../utils/painter";
import DrawLayersService from "./draw-layers.service";
import DrawService from "./draw.service";
import EventService from "./event.service";

function createDynamicPainterStore() {
  return new Proxy([] as unknown as Painter[], {
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
    deleteProperty(target, prop): boolean {
      if (prop in target) {
        delete target[prop];
        return true;
      }
      return false;
    }
  });
}

export default class DrawAccumulatorService {
  public painters: Painter[];

  constructor(
    private appConfig: AppConfig,
    private appStoreRepository: AppStoreRepository,
    private eventService: EventService,
    private drawLayersService: DrawLayersService,
  ) {
    this.painters = createDynamicPainterStore();
  }

  public async add<DrawType extends TDrawType>(
    layerId: ILayer['id'],
    drawType: DrawType,
    options: DrawService['options'][DrawType],
    initialSize: ITempCanvasOptions
  ) {
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const painter: Painter = new Painter(
      this.drawLayersService,
      {
        drawService: new DrawService(this.appConfig, this.appStoreRepository, this.eventService),
        name: `Painter ${id}`,
        drawType,
        id,
      }
    );
    painter.drawService.bindOptions(drawType, options);
    painter.drawService.tempCanvas.bindOptions(initialSize);
    this.painters.push({
      object: painter,
      update: this.update.bind(this),
    } as unknown as Painter);
    console.log(this.painters);
    this.drawLayersService.addToLayer(layerId, painter);
    this.invokePainter(drawType, painter.drawService);
  }

  public async removePainter(painterId: string) {
    const painter = this.painters.find(painter => painter.id === painterId);
    if (!painter) return console.warn('Painter not found');

    const filteredPainters: IPainter[] = this.painters.filter(painter => painter.id !== painterId);
    this.painters = createDynamicPainterStore();
    const len = filteredPainters?.length;
    filteredPainters.forEach((painter, index) => {
      if (len - 1 === index) {
        // last
        this.painters.push({
          object: painter,
          update: this.update.bind(this),
        } as unknown as Painter);
      } else {
        // other
        this.painters.push({
          object: painter,
          update: () => undefined,
        } as unknown as Painter);
      }
    });
    
    this.drawLayersService.removePainter(painterId);
    this.update();
  }

  public renamePainter(painterId: IPainter['id'], name: string) {
    const painter = this.painters.find(painter => painter.id === painterId);
    if (painter) {
      painter.putPainter({ name });
    } else {
      console.error('Painter not found');
    }
  }

  public async smoothFilter(painterId: IPainter['id'], smoothFilterOptions: ISmoothFilterOptions) {
    const { useStore, options, filterOptions } = smoothFilterOptions;
    const painter = this.painters.find(painter => painter.id === painterId);
    if (!painter) return;
    painter.drawService.drawSmoothImage(useStore, options, filterOptions).then(() => {
      this.update();
    });
  }

  public async renameLayer(id: ILayer["id"], newName: ILayerUpdate['name']) {
    const updateData: ILayerUpdate = {
      name: newName,
    };
    this.drawLayersService.updateLayer(id, updateData)
      .then((res: { status: 'error' | 'success', message?: string }) => {
        if (res.status === 'success') {
          this.update();
        } else {
          console.warn(res?.message);
        }
      })
      .catch((ex: { status: 'error' | 'success', message?: string }) => {
        console.warn(`${ex.status}: ${ex.message}`);
      });
  }

  public async removeLayer(layerId: ILayer['id']) {
    const layer = this.drawLayersService.getLayerById(layerId);
    layer.painters
      .map(painter => painter.id)
      .forEach((painterId) => {
        this.removePainter(painterId);
      });
    this.drawLayersService.removeLayer(layerId)
      .then((res: { status: 'error' | 'success', message?: string }) => {
        if (res.status === 'success') {
          this.update();
        }
      })
      .catch((ex: { status: 'error' | 'success', message?: string }) => {
        console.warn(`${ex.status}: ${ex.message}`);
      });
  }

  public updateLayerOrder(layerId: ILayer['id'], options: IUpdateLayerOptions) {
    this.drawLayersService.changeLayerOrder(layerId, options)
      .then((res: { status: 'error' | 'success', message?: string }) => {
        if (res.status === 'success') {
          this.update();
        }
      })
      .catch((ex: { status: 'error' | 'success', message?: string }) => {
        if (ex.status === 'error') {
          console.warn(ex.message);
        }
      });
  }

  private update() {
    setTimeout(() => {
      this.clearCanvas();
      this.invokePaintersOnLayers();
    }, 1000);
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
    ctx.save();
  }

  private invokePaintersOnLayers() {
    const stash = [];
    this.gradient.forEach((order) => {
      this.painters.forEach((painter) => {
        const layer = this.drawLayersService.layerList.find((layer) => layer.painters.includes(painter));
        if (!layer) return console.warn('[invoke] Layer not found');
        if (!stash.includes(painter) && layer.order === order) {
          this.invokePainterWithTempCtx(painter.drawType, painter.drawService);
          stash.push(painter);
        }
      });
    });
  }

  private async invokePainter(drawType: TDrawType, painter: DrawService) {
    if (drawType === 'image') {
      await painter.drawImage();
    }
    else if (drawType === 'project') {
      await painter.drawProject();
    }
  }

  private async invokePainterWithTempCtx(drawType: TDrawType, painter: DrawService) {
    const imageData = painter.tempCanvas.getImageData();
    const ctx = this.appConfig.canvas.getContext('2d');

    if (drawType === 'image') {
      const x = painter.options.image.drawImageArgs.position.x;
      const y = painter.options.image.drawImageArgs.position.y;
      ctx.putImageData(imageData, x, y);
      ctx.save();
    }
    else if (drawType === 'project') {
      ctx.putImageData(imageData, 0, 0);
      ctx.save();
    }
  }
}