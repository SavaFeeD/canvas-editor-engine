import AppConfig from "../config";
import AppStoreRepository from "../store/storeRepository";
import { IPosition, ISize } from "../types/general";
import { IHistoryLine } from "../types/history";
import { Project } from "../types/project";
import { Filter } from "../utils/filter";
import ThroughHistoryService from "./through-history.service";

export default class ResizeService {
  constructor(
    private appConfig: AppConfig,
    private throughHistoryService: ThroughHistoryService,
  ) {}

  public resize(ctx: CanvasRenderingContext2D, size: ISize) {
    const currentRender = this.throughHistoryService.current();
    const state = currentRender?.stateValue;

    if (!state) {
      return console.warn('No state')
    };

    this.appConfig.CANVAS_SIZE = size;
    this.updateCanvas(ctx, state);
  }

  private updateCanvas(ctx: CanvasRenderingContext2D, stateValue: IHistoryLine['stateValue']) {
    const filter = new Filter(this.appConfig, ctx);
    filter.update(
      stateValue.tempImageData as ImageData,
      stateValue.position as IPosition
    );
  }
}