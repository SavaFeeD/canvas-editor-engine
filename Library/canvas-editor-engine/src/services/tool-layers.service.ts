import AppConfig from "../config";

export default class ToolLayerService {
  multiplier: number = 1000;

  constructor(private appConfig: AppConfig) {}

  getLayerIndex(layerName: string): number {
    const layer = this.appConfig.LAYERS.find((layer) => layer.name === layerName);
    const zIndex = this.multiplier * layer.index;
    return zIndex;
  }
}