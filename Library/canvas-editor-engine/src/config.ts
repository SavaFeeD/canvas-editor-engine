import { ICanvasSize } from "./types/canvas";

export default class AppConfig {
  private static _WEB_COMPONENT_TAG_NAME: string = 'canvas-editor-engine';
  private static _CANVAS_SIZE: ICanvasSize = {
    width: 300,
    height: 150,
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