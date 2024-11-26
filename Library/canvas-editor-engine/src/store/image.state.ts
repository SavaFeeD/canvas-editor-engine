import { StateService } from "../services/store.service";
import { IPosition, ISize } from "../types/general";

export interface IImageState {
  position: IPosition;
  size: ISize;
  tempImageData: ImageData | null;
};

export class ImageState implements StateService {
  private default: IImageState = {
    position: {
      x: 0,
      y: 0,
    },
    size: {
      width: 0,
      height: 0,
    },
    tempImageData: null,
  }
  
  private _position: IImageState['position'] = this.default.position;
  private _size: IImageState['size'] = this.default.size;
  private _tempImageData: IImageState['tempImageData'] = this.default.tempImageData;

  get position(): IImageState['position'] { return this._position; };
  get size(): IImageState['size'] { return this._size; };
  get tempImageData(): IImageState['tempImageData'] { return this._tempImageData; };

  constructor() {
    this.reset();
  }

  reduce(payload: IImageState, title?: string) {
    let isUpdate = false;

    if (!!payload.position) {
      this._position = payload.position;
    }
    if (!!payload.size) {
      this._size = payload.size;
    }
    if (!!payload.tempImageData) {
      this._tempImageData = payload.tempImageData;
      isUpdate = true;
    }

    if (isUpdate) {
      this.addToHistory(`${title || "reduce"}`);
    }
  }

  reset() {
    this.reduce(this.default);
  }

  addToHistory(title: string) {
    console.log(title, this._tempImageData);
  }
}