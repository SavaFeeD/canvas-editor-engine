import { StateService } from "../services/store.service";
import { IPosition, ISize } from "../types/general";
import AppStore from "./store";
import AppStoreRepository from "./storeRepository";

export interface IImageState {
  position: IPosition;
  size: ISize;
  tempImageData: ImageData | null;
};

export interface IImageStateReduce {
  position?: IImageState['position'];
  size?: IImageState['size'];
  tempImageData?: IImageState['tempImageData'];
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

  constructor(
    private appStoreRepository: AppStoreRepository,
  ) {
    this.reset();
  }

  reduce(payload: IImageStateReduce, title?: string) {
    let isUpdate = false;

    if (!!payload?.position) {
      this._position = payload.position;
    }
    if (!!payload?.size) {
      this._size = payload.size;
    }
    if (!!payload?.tempImageData) {
      this._tempImageData = payload.tempImageData;
      isUpdate = true;
    }

    if (isUpdate) {
      this.addToHistory(`${title || "reduce image"}`);
    }
  }

  reset() {
    this.reduce(this.default, "reset to default");
  }

  getEntry() {
    return {
      position: this._position,
      size: this._size,
      imageData: this._tempImageData,
    };
  }

  addToHistory(title: string) {
    const stateValue = {
      position: this._position,
      size: this._size,
      tempImageData: this._tempImageData,
    }
    this.appStoreRepository.store.historyState.reduce('UPDATE_HISTORY', {
      view: title,
      stateName: 'image',
      stateValue,
    });
  }
}