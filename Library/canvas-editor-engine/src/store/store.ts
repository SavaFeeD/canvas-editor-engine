import { StoreService } from "../services/store.service";
import { ImageState } from "./image.state";

export class Store implements StoreService {
  constructor(
    public imageState: ImageState,
  ) { };

  reset() {
    this.imageState.reset();
  }
}

export default class AppStore {
  public static store: Store;
  
  static {
    AppStore.store = new Store(
      new ImageState(),
    );
  }
}