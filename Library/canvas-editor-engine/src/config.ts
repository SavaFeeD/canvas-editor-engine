import { ICanvasSize } from "./types/canvas";

export interface ILayer {
  name: string;
  index: number;
};

export abstract class ConfigStore {
  static _WEB_COMPONENT_TAG_NAME: string;
  static _CANVAS_SIZE: ICanvasSize;
  static _LAYERS: ILayer[];
}

export class ConfigFabric implements ConfigStore{
  protected static _WEB_COMPONENT_TAG_NAME: string;
  protected static _CANVAS_SIZE: ICanvasSize;
  protected static _LAYERS: ILayer[];
}

export default class AppConfig extends ConfigFabric {

  static {
    AppConfig._CANVAS_SIZE = {
      width: 300,
      height: 150,
    };
    AppConfig._WEB_COMPONENT_TAG_NAME = 'canvas-editor-engine';
    AppConfig._LAYERS = [
      {
        name: 'low',
        index: 1,
      },
      {
        name: 'normal',
        index: 2,
      },
      {
        name: 'high',
        index: 3,
      }
    ];
  }

  static get WEB_COMPONENT_TAG_NAME(): string {
    return AppConfig._WEB_COMPONENT_TAG_NAME;
  }

  static set WEB_COMPONENT_TAG_NAME(value: string | undefined) {
    if (!!value && typeof value === 'string') {
      AppConfig._WEB_COMPONENT_TAG_NAME = value;
    }
  }

  static get CANVAS_SIZE(): ICanvasSize {
    return AppConfig._CANVAS_SIZE;
  }

  static set CANVAS_SIZE(value: ICanvasSize | undefined) {
    if (!!value && !!value?.width && !!value?.height) {
      AppConfig._CANVAS_SIZE = value;
    } else {
      console.warn('CANVAS_SIZE denied');
    }
  }

  static get LAYERS(): ILayer[] {
    return AppConfig._LAYERS;
  }

  static set LAYERS(value: ILayer[]) {
    if (!!value && !!value?.length) {
      AppConfig._LAYERS = value;
    }
  }
}
