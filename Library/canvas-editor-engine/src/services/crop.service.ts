import ExcretionComponent from "../components/excretions.component";
import AppConfig from "../config";
import AppStore from "../store/store";
import { IImageOptions } from "../types/image";
import { Filter } from "../utils/filter";

export default class CropService {
  
  public static setup() {
    ExcretionComponent.additionStyle = 'crop';
  } 

  public static crop(ctx: CanvasRenderingContext2D) {
    if (!!ExcretionComponent.excretionsCoords?.length === false) return;
    
    const filter = new Filter(ctx);
    const options = CropService.options;
    const imageData = filter.copy(options);
    const putOptions = {
      x: (AppConfig.CANVAS_SIZE.width / 2) - (options.width / 2),
      y: (AppConfig.CANVAS_SIZE.height / 2) - (options.height / 2),
    }
    filter.update(imageData, putOptions);
    AppStore.store.imageState.reduce({
      tempImageData: imageData,
      position: putOptions,
      size: {
        width: options.width,
        height: options.height,
      }
    }, "Use crop");
  }

  public static viewCropButton() {
    const cropButtons = ExcretionComponent.excretionWrap.querySelectorAll('.crop-button');
    const lastCropButtonIndex = cropButtons.length - 1;
    const cropButton = cropButtons[lastCropButtonIndex];
    cropButton.classList.add('crop-button--view');
  }

  public static get options(): IImageOptions {
    const excretionLastIndex = ExcretionComponent.excretionsCoords.length - 1;
    const coords = ExcretionComponent.excretionsCoords[excretionLastIndex];
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