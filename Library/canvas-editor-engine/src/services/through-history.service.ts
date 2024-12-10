import AppConfig from "../config";
import AppStoreRepository from "../store/storeRepository";
import { IPosition } from "../types/general";
import { IHistoryLine } from "../types/history";
import { Project } from "../types/project";
import { Filter } from "../utils/filter";

export default class ThroughHistoryService {
  public cache: IHistoryLine[] = [];

  constructor(
    private appConfig: AppConfig,
    private appStoreRepository: AppStoreRepository,
  ) {}
  
  public current() {
    const history = this.appStoreRepository.store.historyState.historyLines;
    const lastIndex = history.length - 1;
    return history[lastIndex];
  }

  public prev() {
    const history = this.appStoreRepository.store.historyState.historyLines;
    const prevIndex = history.length - 2;
    return history[prevIndex];
  }
  
  public undo(ctx: CanvasRenderingContext2D) {
    const current = this.current();
    const prev = this.prev();
    if (!!current?.stateValue) {
      this.cache.unshift(current);
      this.appStoreRepository.store.historyState.reduce('UNDO');
      if (prev?.stateValue) {
        this.updateCanvas(ctx, prev.stateValue);
      }
    }
  };

  public redo(ctx: CanvasRenderingContext2D) {
    const firstInCache = this.cache.shift();
    if (!!firstInCache?.stateValue) {
      this.appStoreRepository.store.historyState.reduce('REDO', firstInCache);
      this.updateCanvas(ctx, firstInCache.stateValue);
    }
  };

  public clearCache() {
    this.cache = [];
  }

  public recovery(project: Project) {
    this.appStoreRepository.store.historyState.reduce('SET_HISTORY', { historyLines: project.state.history});
    this.cache = project.state.cache;
  }

  private updateCanvas(ctx: CanvasRenderingContext2D, stateValue: IHistoryLine['stateValue']) {
    const filter = new Filter(this.appConfig, ctx);
    filter.update(
      stateValue.tempImageData as ImageData,
      stateValue.position as IPosition
    );
  }
}