import AppStoreRepository from "../store/storeRepository";
import { ILayer, ILayerUpdate } from "../types/draw-layers";
import { IPainter } from "../types/draw-service";

export default class DrawLayersService {
  layerList: ILayer[] = [];

  constructor(
    private appStoreRepository: AppStoreRepository,
  ) {
    this.addLayer({ layerName: 'Base Layer' });
  }

  addLayer(layerOptions?: { layerName?: string, painter?: IPainter }) {
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
  }

  getLayerByOrder(order: number) {
    return this.layerList.find((layer) => layer.order === order);
  }

  getLayerById(layerId: ILayer['id']) {
    return this.layerList.find((layer) => layer.id === layerId);
  }

  addToLayer(id: ILayer['id'], painter: IPainter) {
    const layerIndex = this.layerList.findIndex((layer) => layer.id === id);
    if (layerIndex === -1) return;
    const layer = this.layerList[layerIndex];
    layer.painters.push(painter);
    this.appStoreRepository.store.drawLayersState.reduce('UPDATE_LAYER', layer);
  }

  updateLayer(id: ILayer['id'], updateData?: ILayerUpdate) {
    const layerIndex = this.layerList.findIndex((layer) => layer.id === id);
    const fields = Object.keys(updateData);

    if (!fields.length || layerIndex === -1) return;
    
    const layer = this.layerList[layerIndex];

    fields.forEach((field) => {
      layer[field] = updateData[field];
    });
    
    this.layerList[layerIndex] = layer;

    this.appStoreRepository.store.drawLayersState.reduce('UPDATE_LAYER', layer);
  }
}