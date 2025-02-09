import CanvasComponent from "../components/canvas.component";
import DrawLayersService from "../services/draw-layers.service";
import DrawService from "../services/draw.service";
import { ICursorPosition } from "../types/cursor";
import { ICreatePainter, IPutPainter, TDrawType } from "../types/draw-service";
import { IPosition } from "../types/general";

export default class Painter {
  public drawService: DrawService;
  public drawType: TDrawType;
  public id: string;
  public name: string;
  public order: number | null;
  public createdAt: {
    view: Date,
    digital: number,
  };
  public isFocused: boolean;
  public isSelected: boolean;
  public focusTimer: NodeJS.Timeout | null;
  
  constructor(
    private canvasComponent: CanvasComponent,
    private drawLayersService: DrawLayersService,
    createModel: ICreatePainter
  ) {
    this.drawService = createModel.drawService;
    this.drawType = createModel.drawType;
    this.id = createModel.id;
    this.name = createModel.name;
    this.order = createModel?.order || null;
    this.createdAt = {
      view: new Date(),
      digital: Date.now(),
    };
  }

  public subscribeOnCanvas(render: () => void) {
    this.canvasComponent.subscribe('mousedown', () => {
      this.focusTimer = setTimeout(() => {
        this.focusPainter();
      }, 800);
    });
    this.canvasComponent.subscribe('mouseup', () => {
      this.blurPainter();
      this.focusTimer = null;
    });
    this.canvasComponent.subscribe('mousemove', (event: MouseEvent, cursorPosition: ICursorPosition) => {
      if (!this.isFocused) return;
      const { x, y } = cursorPosition;
      const size = this.drawService.options.image.drawImageArgs.size;
      const condition = size && size !== 'initial';
      const position = {
        x: (condition) ? x - size.width / 2 : x,
        y: (condition) ? y - size.height / 2 : y,
      };
      this.changePainterPosition(position);
      render();
    });
  }

  public focusPainter() {
    this.isFocused = true;
  }

  public blurPainter() {
    this.isFocused = false;
  }

  public selectPainter() {
    this.isSelected = true;
  }

  public unselectPainter() {
    this.isSelected = false;
  }

  public async changePainterPosition(position: IPosition) {
    return new Promise((resolve, reject) => {
      if (!position) return reject(false);
      this.drawService.options.image.drawImageArgs.position = position;
      this.drawLayersService.updatePainterData(this);
      resolve(true);
    });
  }

  public async putPainter(painter: IPutPainter) {
    return new Promise((resolve, reject) => {
      let isUpdated = false;

      if (painter?.name) {
        this.name = painter.name;
        isUpdated = true;
      }
  
      if (painter?.order) {
        this.order = painter.order;
        isUpdated = true;
      }
  
      if (isUpdated) {
        this.drawLayersService.updatePainterData(this);
        resolve(true);
        return true;
      } else {
        reject(false);
        return false;
      }
    });
  }
}