import AppStore from "../store/store";
import { IPosition } from "../types/general";
import { IHistoryLine } from "../types/history";
import { Filter } from "../utils/filter";

export default class ThroughHistoryService {
  public static cache: IHistoryLine[] = [];
  
  public static current() {
    const history = AppStore.store.historyState.historyLines;
    const lastIndex = history.length - 1;
    return history[lastIndex];
  }

  public static prev() {
    const history = AppStore.store.historyState.historyLines;
    const prevIndex = history.length - 2;
    return history[prevIndex];
  }
  
  public static undo(ctx: CanvasRenderingContext2D) {
    const current = ThroughHistoryService.current();
    const prev = ThroughHistoryService.prev();
    if (!!current?.stateValue) {
      ThroughHistoryService.cache.unshift(current);
      AppStore.store.historyState.reduce('UNDO');
      if (prev?.stateValue) {
        ThroughHistoryService.updateCanvas(ctx, prev.stateValue);
      }
    }
  };

  public static redo(ctx: CanvasRenderingContext2D) {
    const firstInCache = ThroughHistoryService.cache.shift();
    if (!!firstInCache?.stateValue) {
      AppStore.store.historyState.reduce('REDO', firstInCache);
      ThroughHistoryService.updateCanvas(ctx, firstInCache.stateValue);
    }
  };

  public static clearCache() {
    ThroughHistoryService.cache = [];
  }

  private static updateCanvas(ctx: CanvasRenderingContext2D, stateValue: IHistoryLine['stateValue']) {
    const filter = new Filter(ctx);
    filter.update(
      stateValue.tempImageData as ImageData,
      stateValue.position as IPosition
    );
  }
}