import DrawLayersService from "../services/draw-layers.service";
import DrawService from "../services/draw.service";
import { IPainter, IPutPainter, TDrawType } from "../types/draw-service";

export default class Painter {
  public drawService: DrawService;
  public drawType: TDrawType;
  public id: string;
  public name: string;
  
  constructor(
    private drawLayersService: DrawLayersService,
    createModel: IPainter
  ) {
    this.drawService = createModel.drawService;
    this.drawType = createModel.drawType;
    this.id = createModel.id;
    this.name = createModel.name;
  }

  public putPainter(painter: IPutPainter) {
    let isUpdated = false;

    if (painter.name) {
      this.name = painter.name;
      isUpdated = true;
    }

    if (isUpdated) {
      console.log('Painter maybe updated:', this);
      this.drawLayersService.updatePainterData(this);
    }
  }
}