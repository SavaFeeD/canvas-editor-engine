import CanvasComponent from "../components/canvas.component";

export default class DownloadService {
  constructor(private canvasComponent: CanvasComponent) { }

  public getDataUrl() {
    return this.canvasComponent.canvas.toDataURL();
  }

  public download(filename?: string) {
    const link = document.createElement('a');
    link.download = `${filename || 'image'}.png`;
    link.href = this.getDataUrl();
    link.click();
  }
}