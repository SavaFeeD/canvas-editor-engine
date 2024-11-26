import AppConfig from "../config";

export default class ToolLayerService {
  static multiplier: number = 1000;

  static getLayerIndex(layerName: string): number {
    const layer = AppConfig.LAYERS.find((layer) => layer.name === layerName);
    const zIndex = ToolLayerService.multiplier * layer.index;
    return zIndex;
  }
} 