import AppStoreRepository from "../store/storeRepository";
import { ILayer, ILayerUpdate, IUpdateLayerOptions } from "../types/draw-layers";
import { IPainter } from "../types/draw-service";
import Painter from "../utils/painter";

export default class DrawLayersService {
  public layerList: ILayer[] = [];

  constructor(
    private appStoreRepository: AppStoreRepository,
  ) {
    this.addLayer({ layerName: 'Base Layer' });
  }

  public addLayer(layerOptions?: { layerName?: string, painter?: IPainter }): ILayer {
    const layerName = layerOptions?.layerName;
    const painter = layerOptions?.painter;
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const name = (() => {
      if (layerName) return layerName;
      if (painter) {
        return `${painter.drawType}-${painter.id}`;
      } else {
        return 'New Layer';
      }
    })();
    const painters = (painter) ? [painter] : [];
    const sortedLayers = this.layerList?.sort((a, b) => a.order - b.order);
    const order = (sortedLayers?.length) ? sortedLayers.at(-1).order + 1 : 1;
    const layer: ILayer = {
      id,
      painters,
      order,
      name, 
    };
    this.layerList.push(layer);
    this.appStoreRepository.store.drawLayersState.reduce('ADD_LAYER', layer);
    return layer;
  }

  public getLayerByOrder(order: number) {
    return this.layerList.find((layer) => layer.order === order);
  }

  public getLayersByOrder(order: number) {
    return this.layerList.filter((layer) => layer.order === order);
  }

  public getLayerById(layerId: ILayer['id']) {
    return this.layerList.find((layer) => layer.id === layerId);
  }

  public addToLayer(id: ILayer['id'], painter: IPainter) {
    const layerIndex = this.layerList.findIndex((layer) => layer.id === id);
    if (layerIndex === -1) return;
    const layer = this.layerList[layerIndex];
    layer.painters.push(painter);
    this.appStoreRepository.store.drawLayersState.reduce('UPDATE_LAYER', layer);
  }

  public updateLayer(id: ILayer['id'], updateData?: ILayerUpdate) {
    return new Promise((resolve, reject) => {
      const layerIndex = this.layerList.findIndex((layer) => layer.id === id);
      const fields = Object.keys(updateData);

      if (!fields.length || layerIndex === -1) return reject({ status: 'error', message: 'Layer not found' });
      
      const layer = this.layerList[layerIndex];

      fields.forEach((field) => {
        layer[field] = updateData[field];
      });
      
      this.layerList[layerIndex] = layer;

      this.appStoreRepository.store.drawLayersState.reduce('UPDATE_LAYER', layer);
      resolve({ status: 'success', message: 'Layer updated' });
    });
  }

  public removePainter(id: IPainter['id']) {
    const layerIndex = this.layerList.findIndex((layer) => {
      return layer.painters.find((painter) => painter.id === id);
    });
    if (layerIndex === -1) return;
    this.layerList[layerIndex].painters = this.layerList[layerIndex].painters.filter((painter) => painter.id !== id);
    const layer = this.layerList[layerIndex];
    this.appStoreRepository.store.drawLayersState.reduce('UPDATE_LAYER', layer);
  }

  public updatePainterData(painter: Painter) {
    const layerIndex = this.layerList.findIndex((layer) => {
      return layer.painters.find((layerPainter) => layerPainter.id === painter.id);
    });
    if (layerIndex === -1) return;
    const painterIndex = this.layerList[layerIndex].painters.findIndex((layerPainter) => layerPainter.id === painter.id);
    this.layerList[layerIndex].painters[painterIndex] = painter;
    const layer = this.layerList[layerIndex];
    this.appStoreRepository.store.drawLayersState.reduce('UPDATE_LAYER', layer);
  }

  public removeLayer(id: ILayer['id']) {
    return new Promise((resolve, reject) => {
      const layerIndex = this.layerList.findIndex((layer) => layer.id === id);
      if (layerIndex === -1) return reject({ status: 'error', message: 'Layer not found' });
      const layer = this.layerList[layerIndex];
      this.layerList.splice(layerIndex, 1);
      this.appStoreRepository.store.drawLayersState.reduce('REMOVE_LAYER', layer);
      resolve({ status: 'success', message: 'Layer removed' });
    });
  }

  public async changeLayerOrder(id: ILayer['id'], options: IUpdateLayerOptions) {
    return new Promise((resolve, reject) => {
      const layerIndex = this.layerList.findIndex((layer) => layer.id === id);
      if (layerIndex === -1) return reject({ status: 'error', message: 'Layer not found' });
      const layer = this.layerList[layerIndex];
      
      if (options?.to) {
        layer.order = options.to;
      }

      if (options?.direction) {
        layer.order = (() => {
          if (options.direction === 'up') {
            return layer.order - 1;
          }
          else if (options.direction === 'down') {
            return layer.order + 1;
          }
          else {
            return layer.order;
          }
        })();
      }

      if (options?.addendum) {
        const operation = options.addendum.operation;
        const operand = options.addendum.value;

        if (operation === 'add') {
          layer.order = layer.order + operand;
        }
        else if (operation === 'subtract') {
          layer.order = layer.order - operand;
        }
        else if (operation === 'multiplication') {
          layer.order = layer.order * operand;
        }
        else if (operation === 'division') {
          layer.order = layer.order / operand;
        }
      }

      this.layerList[layerIndex] = layer;
      this.appStoreRepository.store.drawLayersState.reduce('UPDATE_LAYER', layer);
      resolve({ status: 'success', message: 'Layer order updated' });
    });
  }
}