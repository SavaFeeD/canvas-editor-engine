import { StoreService } from "../services/store.service";
import { HistoryState } from "./history.state";
import { ImageState } from "./image.state";

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
  public static store: Store;
  
  static {
    AppStore.store = new Store(
      new ImageState(),
      new HistoryState(),
    );
  }

  public static subscribe(to: 'history', completeIt: (...args: any) => void) {
    if (to === 'history') {
      AppStore.store.historyState.emerge(completeIt);
    }
  }
}