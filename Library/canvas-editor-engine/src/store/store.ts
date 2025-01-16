import { StoreService } from "../services/store.service";
import ThroughHistoryService from "../services/through-history.service";
import { DrawLayersState } from "./draw-layers.state";
import { HistoryState } from "./history.state";
import { ImageState } from "./image.state";
import AppStoreRepository from "./storeRepository";

export class Store implements StoreService {
  constructor(
    public imageState: ImageState,
    public historyState: HistoryState,
    public drawLayersState: DrawLayersState,
  ) { };

  reset() {
    this.imageState.reset();
    this.historyState.reset();
    this.drawLayersState.reset();
  }
}

export default class AppStore {
  constructor(
    private throughHistoryService: ThroughHistoryService,
    private appStoreRepository: AppStoreRepository,
  ) {
    this.appStoreRepository.store = new Store(
      new ImageState(this.appStoreRepository),
      new HistoryState(this.throughHistoryService),
      new DrawLayersState(this.appStoreRepository),
    );
  }

  public subscribe(to: 'history' | 'layers', completeIt: (...args: any) => void) {
    if (to === 'history') {
      this.appStoreRepository.store.historyState.emerge(completeIt);
    } else if (to === 'layers') {
      this.appStoreRepository.store.drawLayersState.emerge(completeIt);
    }
  }

  public getHistoryLines() {
    return this.appStoreRepository.store.historyState.historyLines;
  }

  public getLayers() {
    return this.appStoreRepository.store.drawLayersState.layers;
  }
}