import AppStoreRepository from "../store/storeRepository";
import { ILayer, ILayerUpdate, IUpdateLayerOptions } from "../types/draw-layers";
import Painter from "../utils/painter";

export default class DrawLayersService {
  public layerList: ILayer[] = [];

  constructor(
    private appStoreRepository: AppStoreRepository,
  ) {
    this.addLayer({ layerName: 'Base Layer' });
  }

  public addLayer(layerOptions?: { layerName?: string, painter?: Painter }): ILayer {
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

  public getLayerByPainterId(painterId: Painter['id']) {
    return this.layerList.find((layer) => {
      return layer.painters.find((painter) => painter.id === painterId);
    });
  }

  public addToLayer(id: ILayer['id'], painter: Painter) {
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

  public removePainter(id: Painter['id']) {
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

  /**
   * options steps:
   * 1. to (optional)
   * 2. direction (optional)
   * 3. addendum (optional)
   * @param id ILayer['id']
   * @param options IUpdateLayerOptions
   * @param noReplayseable (optional) If true, the operation will not use the layer being replaceable ([0, 1, 2, 3] -> [0, 2*, 2, 3] -> [0, 1, 2*, 3])
   * @returns promise { status: 'success' | 'error', message: string }
   */
  public async changeLayerOrder(id: ILayer['id'], options: IUpdateLayerOptions, noReplayseable?: boolean) {
    return new Promise((resolve, reject) => {
      const layerIndex = this.layerList.findIndex((layer) => layer.id === id);
      if (layerIndex === -1) return reject({ status: 'error', message: 'Layer not found' });
      const layer = this.layerList[layerIndex];
      
      let newOrder = layer.order;

      if (options?.to) {
        newOrder = options.to;
      }

      if (options?.direction) {
        switch (options.direction) {
          case 'up':
            newOrder = layer.order + 1;
            break;
          case 'down':
            newOrder = layer.order - 1;
            break;
          case 'front':
            let mostMax = 0;
            this.layerList.forEach((l) => (l.order > mostMax) ? mostMax = l.order : null);
            newOrder = mostMax;
            break;
          case 'back':
            let mostMin = Infinity;
            this.layerList.forEach((l) => (l.order < mostMin) ? mostMin = l.order : null);
            newOrder = mostMin;
            break;
        }
      }

      if (options?.addendum) {
        const operation = options.addendum.operation;
        const operand = options.addendum.value;

        if (operation === 'add') {
          newOrder = layer.order + operand;
        }
        else if (operation === 'subtract') {
          newOrder = layer.order - operand;
        }
        else if (operation === 'multiplication') {
          newOrder = layer.order * operand;
        }
        else if (operation === 'division') {
          newOrder = layer.order / operand;
        }
      }

      if (!noReplayseable) {
        const replaceableIndex = this.layerList.findIndex((layer) => layer.order === newOrder);

        if (replaceableIndex === layerIndex) return reject({ status: 'error', message: 'Layer order equals to replaceable layer order' });
        if (replaceableIndex === -1) return reject({ status: 'error', message: 'Replaceable layer not found' });

        this.layerList.sort((a, b) => a.order - b.order);

        const layerIdx = this.layerList.findIndex((layer) => layer.id === id);
        const replaceableIdx = this.layerList.findIndex((layer) => layer.order === newOrder);

        if (this.layerList[layerIdx].order < newOrder) {
          this.layerList = this.layerList.map((item, idx) => {
            if (idx > layerIdx && idx <= replaceableIdx) {
              item.order -= 1;
            }
            return item;
          }); 
        } else {
          this.layerList = this.layerList.map((item, idx) => {
            if (idx >= replaceableIdx && idx < layerIdx) {
              item.order += 1;
            }
            return item;
          }); 
        }

        this.layerList.forEach((item, idx) => {
          if (idx >= layerIdx && idx <= replaceableIdx) {
            this.appStoreRepository.store.drawLayersState.reduce('UPDATE_LAYER', item);
          }
        });

        this.layerList[layerIdx].order = newOrder;      
        this.appStoreRepository.store.drawLayersState.reduce('UPDATE_LAYER', layer);
      } else {
        layer.order = newOrder;
        this.layerList[layerIndex] = layer;      
        this.appStoreRepository.store.drawLayersState.reduce('UPDATE_LAYER', layer);
      }

      resolve({ status: 'success', message: 'Layer order updated' });
    });
  }
}