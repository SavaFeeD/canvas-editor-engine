import { StoreService } from "../services/store.service";
import ThroughHistoryService from "../services/through-history.service";
import { HistoryState } from "./history.state";
import { ImageState } from "./image.state";
import AppStoreRepository from "./storeRepository";

export class Store implements StoreService {
  constructor(
    public imageState: ImageState,
    public historyState: HistoryState,
  ) { };

  reset() {
    this.imageState.reset();
    this.historyState.reset();
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
    );
  }

  public subscribe(to: 'history', completeIt: (...args: any) => void) {
    if (to === 'history') {
      this.appStoreRepository.store.historyState.emerge(completeIt);
    }
  }

  public getHistoryLines() {
    return this.appStoreRepository.store.historyState.historyLines;
  }
}