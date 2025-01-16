import { StateService } from "../services/store.service";
import { ILayer } from "../types/draw-layers";
import { TReducerNames } from "../types/draw-layers";
import AppStoreRepository from "./storeRepository";

export interface IDrawLayersState {
  layers: ILayer[];
};

export class DrawLayersState implements StateService {
  private default: IDrawLayersState = {
    layers: [],
  }

  private _emergeCompleteIt: (layers: IDrawLayersState['layers']) => void;
  
  private _layers: IDrawLayersState['layers'] = this.default.layers;

  get layers(): IDrawLayersState['layers'] { return this._layers; };

  constructor(
    private appStoreRepository: AppStoreRepository,
  ) {
    this.reset();
  }

  reduce(name: TReducerNames, payload?: ILayer | IDrawLayersState) {
    const reducer = new Reducer(this);

    switch(name) {
      case 'SET_LAYERS':
        reducer.setLayers(payload as IDrawLayersState);
        break;
      case 'UPDATE_LAYER':
        reducer.updateLayer(payload as ILayer);
        break;
      case 'ADD_LAYER':
        reducer.addLayer(payload as ILayer);
        break;
    }
  }

  emerge(completeIt: (layers: IDrawLayersState['layers']) => void) {
    this._emergeCompleteIt = completeIt;
  }

  reset() {
    this.reduce('SET_LAYERS', this.default);
  }
}

class Reducer {
  constructor(private state: any) { };

  setLayers(payload: IDrawLayersState) {
    let isUpdate = false;
    
    if (!!payload?.layers) {
      this.state._layers = payload.layers;
      isUpdate = true;
    }

    if (isUpdate && !!this.state._emergeCompleteIt) {
      this.state._emergeCompleteIt(this.state._layers);
    }
  }

  updateLayer(payload: ILayer) {
    let isUpdate = false;
    
    if (!!payload) {
      const targetLayerIndex = (this.state._layers as IDrawLayersState['layers']).findIndex(layer => layer.id === payload.id);
      if (targetLayerIndex != -1) {
        this.state._layers[targetLayerIndex] = payload;
        isUpdate = true;
      }
    }

    if (isUpdate && !!this.state._emergeCompleteIt) {
      this.state._emergeCompleteIt(this.state._layers);
    }
  }

  addLayer(payload: ILayer) {
    let isUpdate = false;

    if (!!payload) {
      this.state._layers.unshift(payload);
      isUpdate = true;
    }

    if (isUpdate && !!this.state._emergeCompleteIt) {
      this.state._emergeCompleteIt(this.state._layers);
    }
  }

  popLayer() {
    this.state._layers.pop();

    if (!!this.state._emergeCompleteIt) {
      this.state._emergeCompleteIt(this.state._layers);
    }
  }
}