import { ICanvasSize } from "./types/canvas";

export interface ILayer {
  name: string;
  index: number;
};

export class ConfigFabric {
  protected _CANVAS_SIZE: ICanvasSize;
  protected _LAYERS: ILayer[];
  protected _ZOOM: number;
}

export default class AppConfig extends ConfigFabric {

  constructor() {
    super();
    this._CANVAS_SIZE = {
      width: 300,
      height: 150,
    };
    this._LAYERS = [
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
    this._ZOOM = 1;
  }

  public get CANVAS_SIZE(): ICanvasSize {
    return this._CANVAS_SIZE;
  }

  public set CANVAS_SIZE(value: ICanvasSize | undefined) {
    if (!!value && !!value?.width && !!value?.height) {
      this._CANVAS_SIZE = value;
    } else {
      console.warn('CANVAS_SIZE denied');
    }
  }

  public get LAYERS(): ILayer[] {
    return this._LAYERS;
  }

  public set LAYERS(value: ILayer[]) {
    if (!!value && !!value?.length) {
      this._LAYERS = value;
    }
  }

  public get ZOOM(): number {
    return this._ZOOM;
  }

  public set ZOOM(value: number) {
    this._ZOOM = value;
  }
}
