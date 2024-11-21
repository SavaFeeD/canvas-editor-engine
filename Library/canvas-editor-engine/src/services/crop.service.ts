import ExcretionComponent from "../components/excretions.component";

export default class CropService {
  
  public static crop() {
    ExcretionComponent.additionStyle = 'crop';
    console.log(CropService.options);
  } 

  public static viewCropButton() {
    const cropButtons = ExcretionComponent.excretionWrap.querySelectorAll('.crop-button');
    const lastCropButtonIndex = cropButtons.length - 1;
    const cropButton = cropButtons[lastCropButtonIndex];
    cropButton.classList.add('crop-button--view');
  }

  public static get options() {
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