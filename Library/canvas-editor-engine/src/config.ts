import { ICanvasSize } from "./types/canvas";

export interface IConfigStore {
  _WEB_COMPONENT_TAG_NAME: string;
  _CANVAS_SIZE: ICanvasSize;
}

export class ConfigFabric {
  protected static _WEB_COMPONENT_TAG_NAME: string;
  protected static _CANVAS_SIZE: ICanvasSize;
}

export default class AppConfig extends ConfigFabric {

  static {
    AppConfig._CANVAS_SIZE = {
      width: 300,
      height: 150,
    };
    AppConfig._WEB_COMPONENT_TAG_NAME = 'canvas-editor-engine';
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
}
