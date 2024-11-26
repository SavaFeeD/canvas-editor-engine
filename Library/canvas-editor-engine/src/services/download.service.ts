import CanvasComponent from "../components/canvas.component";

export default class DownloadService {
  public static getDataUrl() {
    return CanvasComponent.canvas.toDataURL();
  }

  public static download(filename?: string) {
    const link = document.createElement('a');
    link.download = `${filename || 'image'}.png`;
    link.href = DownloadService.getDataUrl();
    link.click();
  }
}