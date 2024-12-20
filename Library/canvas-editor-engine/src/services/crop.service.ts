import ExcretionComponent from "../components/excretions.component";
import AppConfig from "../config";
import AppStoreRepository from "../store/storeRepository";
import { IImageOptions } from "../types/image";
import { Filter } from "../utils/filter";

export default class CropService {
  
  constructor(
    private appConfig: AppConfig,
    private appStoreRepository: AppStoreRepository,
    private excretionComponent: ExcretionComponent,
  ) {}

  public activate() {
    this.excretionComponent.additionStyle = 'crop';
  }

  public deactivate() {
    this.excretionComponent.additionStyle = 'default';
  }

  public crop(ctx: CanvasRenderingContext2D) {
    if (!!this.excretionComponent.excretionsCoords?.length === false) return;
    
    const filter = new Filter(this.appConfig, ctx);
    const options = this.options;
    const { imageData, size } = filter.copyExtendedModel(options);
    const position = {
      x: (this.appConfig.CANVAS_SIZE.width / 2) - (size.width / 2),
      y: (this.appConfig.CANVAS_SIZE.height / 2) - (size.height / 2),
    }
    filter.update(imageData, position);
    this.appStoreRepository.store.imageState.reduce({
      tempImageData: imageData,
      position: position,
      size: {
        width: size.width,
        height: size.height,
      }
    }, "Use crop");
  }

  // TODO: refactor
  public viewCropButton() {
    const cropButtons = this.excretionComponent.excretionWrap.querySelectorAll('.crop-button');
    const lastCropButtonIndex = cropButtons.length - 1;
    const cropButton = cropButtons[lastCropButtonIndex];
    cropButton.classList.add('crop-button--view');
  }

  public get options(): IImageOptions {
    const excretionLastIndex = this.excretionComponent.excretionsCoords.length - 1;
    const coords = this.excretionComponent.excretionsCoords[excretionLastIndex];
    const excWidth = Math.abs(coords.start.x - coords.end.x);
    const excHeight = Math.abs(coords.start.y - coords.end.y);
    return {
      x: coords.start.x,
      y: coords.start.y,
      width: excWidth,
      height: excHeight,
    };
  }

} 